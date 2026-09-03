"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Mountain, X } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

const navigation = [
  {
    label: "Home",
    href: "#home",
  },
  {
    label: "About",
    href: "#about",
  },
  {
    label: "Trails",
    href: "#trails",
  },
  {
    label: "FAQ",
    href: "#faq",
  },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    onScroll();

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <motion.header
        initial={{
          y: -80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.45,
        }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/85 backdrop-blur-xl dark:bg-zinc-950/80"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center px-6 lg:px-8">

          {/* Logo */}

          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
              <Mountain
                className="h-5 w-5 text-white"
                strokeWidth={2.4}
              />
            </div>

            <div className="leading-tight">
              <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                E-PULAG
              </h1>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Reservation System
              </p>
            </div>
          </Link>

          {/* Navigation */}

          <nav className="ml-165 hidden lg:block">
            <ul className="flex items-center gap-8">
              {navigation.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="group relative text-[15px] font-medium text-zinc-700 transition hover:text-black dark:text-zinc-300 dark:hover:text-white"
                  >
                    {item.label}

                    <span className="absolute -bottom-2 left-0 h-[2px] w-0 rounded-full bg-emerald-500 transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}

          <div className="ml-7 hidden items-center gap-6 lg:flex">
            <Link
              href="/login"
              className="text-[15px] font-medium text-zinc-700 transition hover:text-black dark:text-zinc-300 dark:hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="text-[15px] font-medium text-zinc-700 transition hover:text-black dark:text-zinc-300 dark:hover:text-white"
            >
              Register
            </Link>

            <ThemeToggle />
          </div>

          {/* Mobile Button */}

          <button
            onClick={() => setIsOpen(true)}
            className="ml-auto rounded-lg p-2 transition hover:bg-zinc-200 dark:hover:bg-white/10 lg:hidden"
          >
            <Menu className="h-6 w-6 text-zinc-900 dark:text-white" />
          </button>
        </div>
      </motion.header>
            <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 30,
              }}
              className="fixed right-0 top-0 z-50 flex h-screen w-80 flex-col border-l border-white/10 bg-zinc-950 p-8"
            >
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    E-PULAG
                  </h2>

                  <p className="text-sm text-zinc-400">
                    Reservation System
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-8 flex justify-center">
                <ThemeToggle />
              </div>

              <nav className="flex flex-col gap-7">
                {navigation.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-zinc-300 transition hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-4">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-white/10 py-3 text-base font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-white/10 py-3 text-base font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
                >
                  Register
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;