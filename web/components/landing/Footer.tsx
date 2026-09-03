"use client";

import { Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-zinc-200 bg-white transition-colors duration-300 dark:border-white/10 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-10 text-center md:flex-row md:text-left">
        {/* Left */}

        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            E-PULAG
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            A web-based reservation system for Mount Pulag National Park,
            developed to provide a faster and more convenient reservation
            experience for visitors and administrators.
          </p>
        </div>

        {/* Right */}

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 md:justify-end">
            <Phone className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span>(074) 422-3000</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 md:justify-end">
            <Mail className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span>mtpulagnp@gmail.com</span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-center text-sm text-zinc-500 dark:text-zinc-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} E-PULAG. All rights reserved.
          </p>

          <p>
            Department of Environment and Natural Resources – Mount Pulag
            National Park
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;