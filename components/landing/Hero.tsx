"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-white transition-colors duration-300 dark:bg-zinc-950"
    >
      {/* Overlay */}

      <div className="absolute inset-0 bg-white/45 transition-colors duration-300 dark:bg-black/60" />

      {/* Gradient */}

      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/30 to-white dark:from-black/20 dark:via-black/50 dark:to-zinc-950" />

      {/* Content */}

      <div className="container-width relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center rounded-full border border-zinc-300/60 bg-white/70 px-4 py-2 backdrop-blur-md dark:border-white/10 dark:bg-white/10"
          >
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Unofficial Mount Pulag Reservation System
            </span>
          </motion.div>

          {/* Heading */}

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl font-bold leading-tight text-zinc-900 md:text-7xl dark:text-white"
          >
            Experience the
            <br />
            <span className="text-gradient">
              Sea of Clouds
            </span>
          </motion.h1>

          {/* Description */}

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 max-w-2xl text-lg leading-8 text-zinc-700 md:text-xl dark:text-zinc-300"
          >
            Reserve your Mount Pulag hiking adventure through
            E-PULAG, the official online reservation system
            designed to make booking easier, faster, and more
            convenient for every visitor.
          </motion.p>

          {/* Buttons */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              Reserve Now

              <ArrowRight
                className="h-5 w-5"
                strokeWidth={2.4}
              />
            </Link>

            <a
              href="#about"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white/70 px-8 py-4 text-lg font-semibold text-zinc-900 backdrop-blur-md transition-all duration-300 hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              Learn More
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;