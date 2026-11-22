"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Leaf,
  Mountain,
  ShieldCheck,
  Sun,
} from "lucide-react";

const highlights = [
  {
    icon: Sun,
    title: "Sea of Clouds",
    description:
      "Mount Pulag is widely known for its breathtaking sea of clouds and sunrise views, creating a memorable experience for visitors.",
    image: "/mount-pulag-sea-of-clouds.jpg",
  },
  {
    icon: Leaf,
    title: "Rich Biodiversity",
    description:
      "The mountain is home to diverse vegetation and wildlife across its different ecological environments.",
    image: "/near-saddle-camp.jpg",
  },
  {
    icon: Mountain,
    title: "Unique Landscapes",
    description:
      "From forested mountain slopes to open grassland scenery, Mount Pulag offers a distinctive natural landscape.",
    image: "/Pulag.jpg",
  },
];

const MountPulagInfo = () => {
  return (
    <section
      id="mount-pulag"
      className="relative overflow-hidden bg-zinc-100 py-28 transition-colors duration-300 dark:bg-zinc-900"
    >
      {/* Background Accent */}

      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="container-width relative z-10">
        {/* Section Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Discover Mount Pulag
          </span>

          <h2 className="mt-6 text-4xl font-bold text-zinc-900 md:text-5xl dark:text-white">
            A Natural Treasure of the Cordillera
          </h2>

          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Discover the breathtaking landscapes, unique ecosystems,
            and natural beauty of Mount Pulag National Park.
          </p>
        </motion.div>

        {/* Introduction */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid items-center gap-12 lg:grid-cols-2"
        >
          <div className="relative h-[350px] overflow-hidden rounded-3xl md:h-[450px]">
            <Image
              src="/Pulag.jpg"
              alt="Mount Pulag landscape"
              fill
              priority={false}
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <div>
            <h3 className="text-3xl font-bold text-zinc-900 md:text-4xl dark:text-white">
              Discover the Beauty of Mount Pulag
            </h3>

            <p className="mt-6 leading-8 text-zinc-600 dark:text-zinc-400">
              Mount Pulag is one of the most recognized mountain
              destinations in the Philippines, known for its scenic
              landscapes, high-elevation grasslands, forests, and
              remarkable natural environment.
            </p>

            <p className="mt-5 leading-8 text-zinc-600 dark:text-zinc-400">
              Located within the Cordillera Mountain Range, the
              mountain attracts visitors who want to experience its
              scenery while appreciating the importance of protecting
              its natural resources.
            </p>

            <div className="mt-8 flex items-start gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <Mountain className="mt-1 h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />

              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-white">
                  A Remarkable Mountain Destination
                </h4>

                <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  Mount Pulag is known for its summit grasslands,
                  mountain forests, and panoramic views that make
                  it a significant natural destination in Luzon.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Highlights */}

        <div className="mt-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h3 className="text-3xl font-bold text-zinc-900 md:text-4xl dark:text-white">
              What Makes Mount Pulag Special?
            </h3>

            <p className="mx-auto mt-5 max-w-2xl leading-8 text-zinc-600 dark:text-zinc-400">
              Explore the natural features that make Mount Pulag
              a remarkable destination.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {highlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.15,
                  }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6 }}
                  className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-colors dark:border-white/10 dark:bg-zinc-950"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  <div className="p-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                      <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <h4 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {item.title}
                    </h4>

                    <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Conservation */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-28 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 md:p-12 dark:border-white/10 dark:bg-zinc-950"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr]">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10">
              <ShieldCheck className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">
                Protecting Mount Pulag
              </h3>

              <p className="mt-5 leading-8 text-zinc-600 dark:text-zinc-400">
                Mount Pulag is a protected natural area. Visitors
                are encouraged to practice responsible tourism,
                respect park regulations, minimize environmental
                impact, and help preserve the mountain for future
                generations.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              "Follow park regulations and DENR guidelines.",
              "Leave no trace and dispose of waste properly.",
              "Respect the natural environment and local communities.",
            ].map((reminder, index) => (
              <div
                key={index}
                className="rounded-2xl border border-zinc-200 p-5 dark:border-white/10"
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />

                  <p className="leading-7 text-zinc-600 dark:text-zinc-400">
                    {reminder}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MountPulagInfo;