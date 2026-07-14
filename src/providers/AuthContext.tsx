"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
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
  hasPermission: (key: keyof RolePermissions) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Creates the session cookie AND returns the Supabase user in one call.
  // The server endpoint uses the service-role key so it bypasses RLS.
  const setSessionCookie = useCallback(
    async (fbUser: FirebaseUser | null): Promise<SessionUser | null> => {
      if (!fbUser) {
        await fetch("/api/auth/session", { method: "DELETE" });
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
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const sessionUser = await setSessionCookie(fbUser);
          if (!sessionUser) throw new Error("No account found in the system");
          setUser(sessionUser);
        } catch {
          setUser(null);
          await signOut(auth);
        }
      } else {
        setUser(null);
        try { await setSessionCookie(null); } catch { /* cookie deletion failure is non-critical */ }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [setSessionCookie]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged handles the rest
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
    // onAuthStateChanged handles the rest
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
