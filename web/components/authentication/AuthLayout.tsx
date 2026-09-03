import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Exit */}

      <Link
        href="/"
        className="absolute right-8 top-8 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-xl transition hover:border-emerald-400 hover:bg-black/50"
      >
        <X size={24} />
      </Link>

      {/* Background */}

      <Image
        src="/Pulag.jpg"
        alt="Mount Pulag"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}

      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}

      <section className="relative z-10 flex min-h-screen items-center py-24">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 px-8 lg:grid-cols-2">
          {children}
        </div>
      </section>
    </main>
  );
}