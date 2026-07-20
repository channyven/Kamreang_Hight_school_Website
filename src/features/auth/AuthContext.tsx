"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type FirebaseUser,
} from "@/lib/firebase";
import type { SessionUser, UserRole, RolePermissions } from "@/types";
import { ROLE_PERMISSIONS } from "@/types";

interface AuthContextValue {
  user: SessionUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  permissions: RolePermissions | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (key: keyof RolePermissions) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Stores resolve/reject callbacks for the sign-in promise.
   * This bridges the gap between `signInWithEmail` / `signInWithGoogle`
   * and the `onAuthStateChanged` listener that actually sets the session.
   * Without this, the login page would redirect before the __session cookie
   * was written, causing the middleware to bounce the user back to login.
   */
  const pendingSession = useRef<{
    resolve: (user: SessionUser) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const setSessionCookie = useCallback(
    async (fbUser: FirebaseUser | null): Promise<SessionUser | null> => {
      if (!fbUser) {
        try { await fetch("/api/auth/session", { method: "DELETE" }); } catch { /* non-critical */ }
        return null;
      }
      const idToken = await fbUser.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, firebase_uid: fbUser.uid }),
      });
      if (!res.ok) return null;
      const { user } = await res.json();
      if (!user) return null;
      const sessionUser = user as SessionUser;
      if (!sessionUser.is_active) throw new Error("Account is deactivated");
      return sessionUser;
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    /** True once Firebase has determined the *initial* auth state. */
    let initialAuthReady = false;
    /** True when fbUser was null before initialAuthReady was set. */
    let waitingForInitialAuth = false;

    /**
     * Firebase can briefly fire `onAuthStateChanged` with null while it is
     * still reading the persisted auth state from IndexedDB.  If we set
     * `loading = false` at that point, the admin layout immediately redirects
     * back to /login long before the real signed-in user is reported.
     *
     * We solve this by registering onAuthStateChanged IMMEDIATELY (so we
     * never miss a login event), but DELAYING the `loading = false` transition
     * for the null-user case until authStateReady() confirms the initial
     * state is truly null.
     */
    auth
      .authStateReady()
      .then(() => {
        if (cancelled) return;
        initialAuthReady = true;
        // If the null callback already fired, resolve loading now
        if (waitingForInitialAuth) {
          pendingSession.current = null;
          setLoading(false);
        }
      })
      .catch(() => {
        // authStateReady() itself failed — release loading anyway
        if (!cancelled) {
          if (waitingForInitialAuth) {
            pendingSession.current = null;
            setLoading(false);
          }
          initialAuthReady = true;
        }
      });

    unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const sessionUser = await setSessionCookie(fbUser);
          if (!sessionUser) throw new Error("No account found in the system");
          setUser(sessionUser);
          // Resolve the pending sign-in promise so the login page can redirect
          pendingSession.current?.resolve(sessionUser);
        } catch (err) {
          setUser(null);
          await signOut(auth);
          // Reject the pending sign-in promise with a meaningful error
          const error = err instanceof Error ? err : new Error("Login failed");
          pendingSession.current?.reject(error);
        }
        // Authenticated user → always resolve loading
        pendingSession.current = null;
        setLoading(false);
      } else {
        setUser(null);
        try { await setSessionCookie(null); } catch { /* non-critical */ }

        if (initialAuthReady) {
          // Firebase confirmed the initial state is null (no saved session)
          pendingSession.current = null;
          setLoading(false);
        } else {
          // Firebase hasn't finished restoring the initial auth state yet.
          // Don't resolve loading yet — wait for authStateReady().
          waitingForInitialAuth = true;
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [setSessionCookie]);

  /** Safety timeout to prevent hanging if onAuthStateChanged never fires */
  const SESSION_TIMEOUT_MS = 15_000;

  /**
   * Refresh the current user's session data from the server.
   * Call this after any profile update so the whole admin UI reflects
   * the latest name, avatar, role, etc. without requiring a page reload.
   */
  const refreshUser = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const idToken = await firebaseUser.getIdToken(true);
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, firebase_uid: firebaseUser.uid }),
      });
      if (!res.ok) return;
      const { user: freshUser } = await res.json();
      if (freshUser) {
        setUser(freshUser as SessionUser);
      }
    } catch {
      // Non-critical – the old data will still be in the UI
    }
  }, [firebaseUser]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      return new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          pendingSession.current = null;
          reject(new Error("Session setup timed out — please try again"));
        }, SESSION_TIMEOUT_MS);

        /**
         * Wrap resolve/reject so they always clear the timeout first.
         * This prevents the timeout from firing after the session is set,
         * which could wipe `pendingSession.current` under a subsequent login.
         */
        pendingSession.current = {
          resolve: () => {
            clearTimeout(timeoutId);
            resolve();
          },
          reject: (error) => {
            clearTimeout(timeoutId);
            reject(error);
          },
        };

        signInWithEmailAndPassword(auth, email, password).catch((error) => {
          clearTimeout(timeoutId);
          pendingSession.current = null;
          reject(error);
        });
      });
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        pendingSession.current = null;
        reject(new Error("Session setup timed out — please try again"));
      }, SESSION_TIMEOUT_MS);

      pendingSession.current = {
        resolve: () => {
          clearTimeout(timeoutId);
          resolve();
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
      };

      signInWithPopup(auth, googleProvider).catch((error) => {
        clearTimeout(timeoutId);
        pendingSession.current = null;
        reject(error);
      });
    });
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  }, []);

  const permissions = user ? ROLE_PERMISSIONS[user.role as UserRole] : null;

  const hasPermission = useCallback(
    (key: keyof RolePermissions): boolean => {
      return permissions?.[key] ?? false;
    },
    [permissions]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        permissions,
        signInWithEmail,
        signInWithGoogle,
        logout,
        refreshUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
