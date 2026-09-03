import { Inter } from "next/font/google";

import AuthLayout from "@/components/authentication/AuthLayout";
import AuthHero from "@/components/authentication/AuthHero";
import AuthCard from "@/components/authentication/AuthCard";
import RegisterForm from "@/components/authentication/RegisterForm";

const inter = Inter({
  subsets: ["latin"],
});

export default function RegisterPage() {
  return (
    <div className={inter.className}>
      <AuthLayout>
        <AuthHero
          subtitle="Join"
          title="E-PULAG"
          description="Create your account to reserve hiking schedules, manage bookings, and experience the breathtaking beauty of Mount Pulag National Park."
        />

        <AuthCard
          title="Create Account"
          subtitle="Join the official E-PULAG booking system"
        >
          <RegisterForm />
        </AuthCard>
      </AuthLayout>
    </div>
  );
}