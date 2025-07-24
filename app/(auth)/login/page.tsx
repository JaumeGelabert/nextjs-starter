import AuthCard from "@/components/auth/AuthCard";

export default function LoginPage() {
  return (
    <div className="flex flex-col justify-center items-center h-dvh">
      <AuthCard action="login" google microsoft />
    </div>
  );
}
