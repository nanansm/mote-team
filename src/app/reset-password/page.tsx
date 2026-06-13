import { Suspense } from "react";
import { Wordmark } from "@/components/brand";
import { ResetForm } from "./reset-form";

export default function ResetPasswordPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Wordmark height={26} />
          <h1 className="text-lg font-semibold tracking-tight">Reset password</h1>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <Suspense>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
