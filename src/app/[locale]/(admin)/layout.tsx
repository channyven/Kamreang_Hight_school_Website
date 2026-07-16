import { AuthProvider } from "@/providers/AuthContext";
import AdminGate from "@/components/admin/AdminGate";

// AuthProvider (and the Firebase Auth SDK it loads) is scoped to /admin and
// /login only — public pages never call useAuth(), so they shouldn't pay
// for Firebase's bundle size or its onAuthStateChanged() network check.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGate>{children}</AdminGate>
    </AuthProvider>
  );
}
