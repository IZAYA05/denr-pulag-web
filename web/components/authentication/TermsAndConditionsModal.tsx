"use client";

import { useEffect } from "react";
import { FileText, Info, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const sections = [
  {
    title: "1. Booking Requirements",
    paragraphs: [
      "Hiking reservations must be submitted at least 30 days before the intended hiking date.",
      "The required approval process must also be completed at least 30 days before the hiking date. Visitors should submit bookings early enough to allow the required reviews.",
      "Submitting a reservation does not automatically mean that the booking has been approved.",
    ],
  },
  {
    title: "2. Group Size",
    paragraphs: [
      "Each booking group may contain a maximum of 12 participants.",
      "A group that exceeds the permitted limit must be divided into separate bookings, subject to the applicable booking requirements and available park capacity.",
    ],
  },
  {
    title: "3. Daily Visitor Capacity",
    paragraphs: [
      "Mount Pulag National Park has a maximum visitor capacity of 500 visitors per hiking date.",
      "This limit is shared by direct reservations and package bookings, regardless of the selected trail.",
      "New bookings cannot be accepted when the daily visitor capacity has been reached. A displayed remaining capacity is subject to change as other bookings are submitted or their statuses are updated.",
    ],
  },
  {
    title: "4. Booking Review and Approval",
    paragraphs: [
      "Direct reservations are subject to review and approval by the DENR office.",
      "Package bookings require two stages of review: Organizer approval followed by final DENR approval.",
      "A submitted booking remains subject to these reviews. Visitors should check the booking status rather than treating submission as final confirmation.",
    ],
  },
  {
    title: "5. Payments",
    paragraphs: [
      "E-PULAG does not process online payments.",
      "Required payments are handled manually through the DENR office. Visitors should follow the payment instructions provided by the office.",
    ],
  },
  {
    title: "6. Medical Certificates",
    paragraphs: [
      "Medical certificates are not uploaded or stored through E-PULAG.",
      "Visitors must present the required medical certificates physically to the DENR office in accordance with its instructions.",
    ],
  },
  {
    title: "7. Authorized Trails",
    paragraphs: [
      "Visitors may select only from the hiking trails made available and authorized by DENR.",
      "Trail availability and permission to hike remain subject to DENR rules and approval.",
    ],
  },
];

export default function TermsAndConditionsModal({
  isOpen,
  onClose,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h2
                id="terms-modal-title"
                className="font-bold text-white"
              >
                Terms and Conditions
              </h2>
              <p className="text-xs text-zinc-400">
                E-PULAG Reservation System · Version 2026-11-07
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Terms and Conditions"
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
          <p className="text-sm leading-7 text-zinc-300">
            Please read these terms before submitting a reservation or package
            booking through E-PULAG. These terms describe the booking rules
            and procedures applicable to the system.
          </p>

          <div className="flex gap-3 rounded-xl border border-blue-900/60 bg-blue-950/30 p-4 text-sm leading-6 text-blue-200">
            <Info className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              These terms describe the E-PULAG booking procedures. Visitors
              must also comply with applicable DENR rules, instructions, and
              requirements for Mount Pulag National Park.
            </p>
          </div>

          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5"
            >
              <h3 className="font-bold text-white">
                {section.title}
              </h3>

              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-sm leading-7 text-zinc-300"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-5">
            <h3 className="font-bold text-emerald-200">
              Acceptance of Terms
            </h3>
            <p className="mt-3 text-sm leading-7 text-emerald-100">
              By checking the acceptance box on the registration form, you
              acknowledge that you have read and agreed to these Terms and
              Conditions.
            </p>
          </section>
        </div>

        <footer className="flex shrink-0 justify-end border-t border-zinc-800 bg-zinc-900 px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
