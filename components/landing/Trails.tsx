"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock3, Mountain, Users } from "lucide-react";
import Image from "next/image";

const trails = [
  {
    name: "Ambangeg Trail",
    image: "/trails/ambangeg.jpg",
    difficulty: "Beginner",
    duration: "4 - 6 Hours",
    capacity: "12 Persons / Group",
    description:
      "The most popular trail to Mount Pulag. Ideal for beginners with scenic pine forests, grasslands, and breathtaking sunrise views.",
  },
  {
    name: "Akiki Trail",
    image: "/trails/akiki.jpg",
    difficulty: "Advanced",
    duration: "2 Days",
    capacity: "12 Persons / Group",
    description:
      "Known as the 'Killer Trail', Akiki offers a challenging ascent through mossy forests and steep mountain ridges.",
  },
  {
    name: "Tawangan Trail",
    image: "/trails/tawangan.jpg",
    difficulty: "Intermediate",
    duration: "2 Days",
    capacity: "12 Persons /Group",
    description:
      "Experience river crossings, dense forests, and traditional indigenous villages before reaching the summit.",
  },
];

const Trails = () => {
  return (
    <section
      id="trails"
      className="relative overflow-hidden bg-white py-28 transition-colors duration-300 dark:bg-zinc-900"
    >
      {/* Background */}

      <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="container-width relative z-10">
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Hiking Trails
          </span>

          <h2 className="mt-6 text-4xl font-bold text-zinc-900 md:text-5xl dark:text-white">
            Choose Your Adventure
          </h2>

          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Explore the official hiking trails of Mount Pulag. Each trail
            offers a unique experience, from beginner-friendly routes to
            challenging climbs for experienced hikers.
          </p>
        </motion.div>

        {/* Cards */}

        <div className="grid gap-8 lg:grid-cols-3">
          {trails.map((trail, index) => (
            <motion.div
              key={trail.name}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
              }}
              viewport={{ once: true }}
              whileHover={{
                y: -8,
              }}
              className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-colors dark:border-white/10 dark:bg-zinc-950"
            >
              {/* Image */}

              <div className="relative h-64 overflow-hidden">
                <Image
                  src={trail.image}
                  alt={trail.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <span className="absolute left-5 top-5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                  {trail.difficulty}
                </span>
              </div>

              {/* Content */}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {trail.name}
                </h3>

                <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-400">
                  {trail.description}
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    <Clock3 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                    <span>{trail.duration}</span>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    <Users className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                    <span>{trail.capacity}</span>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    <Mountain className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                    <span>Mount Pulag National Park</span>
                  </div>
                </div>

                <button className="mt-10 inline-flex items-center gap-2 font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
                  Learn More

                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Trails;