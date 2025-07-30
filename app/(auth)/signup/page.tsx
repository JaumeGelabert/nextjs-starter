import AuthCard from "@/components/auth/AuthCard";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <div className="flex flex-col justify-center items-center h-dvh">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthCard action="signup" google microsoft />
      </Suspense>
    </div>
  );
}
