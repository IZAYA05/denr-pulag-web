import { ReactNode } from "react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
});

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthCard({
  title,
  subtitle,
  children,
}: AuthCardProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
        <h2
        className={`${montserrat.className} text-center text-3xl font-bold tracking-tight text-emerald-400`}
        >
        {title}
        </h2>

        <p className="mt-2 text-center text-zinc-300">
          {subtitle}
        </p>

        {children}
      </div>
    </div>
  );
}