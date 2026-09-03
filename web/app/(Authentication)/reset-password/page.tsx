import { Inter } from "next/font/google";

import AuthLayout from "@/components/authentication/AuthLayout";
import AuthHero from "@/components/authentication/AuthHero";
import AuthCard from "@/components/authentication/AuthCard";
import ResetPasswordForm from "@/components/authentication/ResetPasswordForm";

const inter = Inter({
  subsets: ["latin"],
});

export default function ResetPasswordPage() {
  return (
    <div className={inter.className}>
      <AuthLayout>
        <AuthHero
          subtitle="Reset"
          title="Password"
          description="Create a new password to regain access to your E-PULAG account."
        />

        <AuthCard
          title="Reset Password"
          subtitle="Choose a strong new password"
        >
          <ResetPasswordForm />
        </AuthCard>
      </AuthLayout>
    </div>
  );
}