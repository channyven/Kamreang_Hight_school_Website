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
import { logError } from "@/lib/error-logger";

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

  const setSessionCookie = useCallback(
    async (fbUser: FirebaseUser | null): Promise<SessionUser | null> => {
      if (!fbUser) {
        try {
          await fetch("/api/auth/session", { method: "DELETE" });
        } catch (error) {
          logError(error, { severity: "low", tags: ["auth", "session-cleanup"] });
        }
        return null;
      }
      try {
        const idToken = await fbUser.getIdToken();
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, firebase_uid: fbUser.uid }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to establish session");
        }
        const { user } = await res.json();
        if (!user) throw new Error("No user profile found in response");
        const sessionUser = user as SessionUser;
        if (!sessionUser.is_active) throw new Error("Account is deactivated");
        return sessionUser;
      } catch (error) {
        logError(error, { 
          severity: "high", 
          tags: ["auth", "session-creation"],
          userId: fbUser.uid 
        });
        return null;
      }
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
        } catch (error) {
          logError(error, { 
            severity: "medium", 
            tags: ["auth", "onAuthStateChanged"],
            userId: fbUser.uid 
          });
          setUser(null);
          await signOut(auth);
        }
      } else {
        setUser(null);
        try {
          await setSessionCookie(null);
        } catch (error) {
          logError(error, { severity: "low", tags: ["auth", "signout-cleanup"] });
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [setSessionCookie]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        logError(error, { severity: "high", tags: ["auth", "signin-email"], email });
        throw error;
      }
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      logError(error, { severity: "high", tags: ["auth", "signin-google"] });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      logError(error, { severity: "medium", tags: ["auth", "logout"] });
      throw error;
    }
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
