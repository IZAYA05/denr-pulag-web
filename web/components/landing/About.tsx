"use client";

import { motion } from "framer-motion";
import {
  CalendarCheck,
  Mountain,
  ShieldCheck,
  Users,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Easy Reservation",
    description:
      "Book your Mount Pulag adventure online with a streamlined reservation process.",
  },
  {
    icon: Users,
    title: "Group Management",
    description:
      "Organize your hiking group, manage participants, and track reservation details effortlessly.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable System",
    description:
      "Developed to provide a secure and organized reservation experience for hikers and administrators.",
  },
  {
    icon: Mountain,
    title: "Mount Pulag",
    description:
      "Supporting responsible tourism while preserving one of the Philippines' most iconic mountain destinations.",
  },
];

const stats = [
  {
    value: "500",
    label: "Daily Visitor Limit",
  },
  {
    value: "12",
    label: "Maximum per Group",
  },
  {
    value: "100%",
    label: "Online Reservation",
  },
];

const About = () => {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-white py-28 transition-colors duration-300 dark:bg-zinc-950"
    >
      {/* Background Glow */}

      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-600/10 blur-[140px]" />

      {/* Header */}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mx-auto mb-20 max-w-3xl text-center"
      >
        <span className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          About E-PULAG
        </span>

        <h2 className="mt-6 text-4xl font-bold text-zinc-900 md:text-5xl dark:text-white">
          Modernizing Mount Pulag Reservations
        </h2>

        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          E-PULAG is a web-based reservation platform designed to
          simplify the booking process for Mount Pulag National Park.
          It enables visitors to reserve hiking schedules online while
          helping administrators efficiently manage reservations,
          visitor capacity, and records.
        </p>
      </motion.div>
    </section>
  );
};

export default About;