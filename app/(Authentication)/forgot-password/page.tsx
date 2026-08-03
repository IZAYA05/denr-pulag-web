import { Inter } from "next/font/google";

import AuthLayout from "@/components/authentication/AuthLayout";
import AuthHero from "@/components/authentication/AuthHero";
import AuthCard from "@/components/authentication/AuthCard";
import ForgotPasswordForm from "@/components/authentication/ForgotPasswordForm";

const inter = Inter({
  subsets: ["latin"],
});

export default function ForgotPasswordPage() {
  return (
    <div className={inter.className}>
      <AuthLayout>
        <AuthHero
          subtitle="Forgot"
          title="Password"
          description="Enter your email address and we'll send you a password reset link."
        />

        <AuthCard
          title="Forgot Password"
          subtitle="Recover your E-PULAG account"
        >
          <ForgotPasswordForm />
        </AuthCard>
      </AuthLayout>
    </div>
  );
}