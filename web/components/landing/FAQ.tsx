"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I reserve a hiking schedule?",
    answer:
      "Create an E-PULAG account, log in, select your preferred hiking date, complete the required reservation details, and submit your booking request.",
  },
  {
    question: "How many hikers are allowed in one reservation?",
    answer:
      "Each reservation may include up to 12 participants per group, following the Mount Pulag National Park reservation policy.",
  },
  {
    question: "Can I book on the same day as my hike?",
    answer:
      "No. Reservations must be made in advance and are subject to available hiking slots for your selected date.",
  },
  {
    question: "How many visitors are allowed per day?",
    answer:
      "Mount Pulag National Park has a daily visitor limit of 500 hikers. Once the daily capacity has been reached, reservations for that date will no longer be accepted.",
  },
  {
    question: "Does E-PULAG accept online payments?",
    answer:
      "No. E-PULAG only manages reservations. Payment of fees will be handled by the DENR following their official procedures.",
  },
  {
    question: "What should I bring before my hike?",
    answer:
      "Visitors should prepare proper hiking attire, valid identification, weather-appropriate clothing, sufficient food and water, and follow all guidelines provided by the DENR and Mount Pulag National Park.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-white py-28 transition-colors duration-300 dark:bg-zinc-950"
    >
      {/* Background Glow */}

      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-600/10 blur-[140px]" />

      <div className="container-width relative z-10">
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Frequently Asked Questions
          </span>

          <h2 className="mt-6 text-4xl font-bold text-zinc-900 md:text-5xl dark:text-white">
            Have Questions?
          </h2>

          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Find answers to the most common questions about booking,
            hiking schedules, and the E-PULAG reservation system.
          </p>
        </motion.div>

        {/* FAQ Items */}

        <div className="mx-auto max-w-4xl space-y-5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                }}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
              >
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between px-7 py-6 text-left"
                >
                  <h3 className="pr-6 text-lg font-semibold text-zinc-900 dark:text-white">
                    {faq.question}
                  </h3>

                  <motion.div
                    animate={{
                      rotate: isOpen ? 180 : 0,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                  >
                    <ChevronDown className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                    >
                      <div className="border-t border-zinc-200 px-7 py-6 dark:border-white/10">
                        <p className="leading-8 text-zinc-600 dark:text-zinc-400">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
        >
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Still have questions?
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
            If you need additional assistance regarding reservations or
            hiking requirements, feel free to contact the Mount Pulag
            National Park Office.
          </p>

          <a
            href="mailto:mtpulagnp@gmail.com"
            className="mt-8 inline-flex rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white transition hover:bg-emerald-500"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;