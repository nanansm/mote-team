import { requireSession } from "@/lib/session";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Profil saya" };

export default async function ProfilePage() {
  const session = await requireSession();
  return (
    <ProfileForm
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    />
  );
}
