import AuthCard from "@/components/auth/AuthCard";

export default function SignupPage() {
  return (
    <div className="flex flex-col justify-center items-center h-dvh">
      <AuthCard action="signup" google microsoft />
    </div>
  );
}
