import AuthLayout from "@/components/authentication/AuthLayout";
import AuthHero from "@/components/authentication/AuthHero";
import AuthCard from "@/components/authentication/AuthCard";
import LoginForm from "@/components/authentication/LoginForm";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

export default function LoginPage() {
  return (
    <div className={inter.className}>
      <AuthLayout>
        <AuthHero
          subtitle="Welcome Back"
          title="E-PULAG"
          description="Sign in to manage your hiking reservations, view schedules, and continue your Mount Pulag adventure."
        />

        <AuthCard
          title="Login"
          subtitle="Welcome back to E-PULAG"
        >
          <LoginForm />
        </AuthCard>
      </AuthLayout>
    </div>
  );
}