import { Wordmark } from "@/components/brand";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Wordmark height={26} />
          <p className="text-sm text-muted-foreground">
            Project management internal Mote Kreatif
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <SignInForm />
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Belum punya akun? Minta undangan ke admin.
        </p>
      </div>
    </div>
  );
}
