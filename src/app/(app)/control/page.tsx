import { redirect } from "next/navigation";

// Kontrol merged into Overview (/dashboard).
export default function ControlPage() {
  redirect("/dashboard?tab=kontrol");
}
