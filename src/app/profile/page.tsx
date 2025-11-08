import ProtectedRoute from "@/components/auth/protect";
import Profile from "./_components/profile";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}
