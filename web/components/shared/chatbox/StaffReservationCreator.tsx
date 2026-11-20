"use client";

import { useState, type FormEvent } from "react";
import { CalendarCheck, CheckCircle2, X } from "lucide-react";

import Button from "@/components/ui/Button";

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type ParticipantForm = {
  full_name: string;
  age: string;
  gender: string;
  nationality: string;
  contact_number: string;
  address: string;
  emergency_contact: string;
  emergency_number: string;
};

type ApiResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

function emptyParticipant(): ParticipantForm {
  return {
    full_name: "",
    age: "",
    gender: "",
    nationality: "Filipino",
    contact_number: "",
    address: "",
    emergency_contact: "",
    emergency_number: "",
  };
}

function getErrorMessage(data: ApiResponse, fallback: string) {
  const firstError = Object.values(data.errors ?? {})
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .find((value): value is string => typeof value === "string");

  return firstError || data.message || fallback;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

type Props = {
  conversationId: number;
  requestedVisitors: number;
  userName: string;
  userPhone?: string;
  accessToken: string;
  onCreated: (message: string) => void | Promise<void>;
  onError: (message: string) => void;
};

export default function StaffReservationCreator({
  conversationId,
  requestedVisitors,
  userName,
  userPhone,
  accessToken,
  onCreated,
  onError,
}: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [groupLeaderName, setGroupLeaderName] = useState(userName);
  const [groupLeaderPhone, setGroupLeaderPhone] = useState(userPhone || "");
  const [remarks, setRemarks] = useState("");
  const [participants, setParticipants] = useState<ParticipantForm[]>([]);

  function openForm() {
    const count = Math.min(12, Math.max(1, requestedVisitors));

    setParticipants(Array.from({ length: count }, () => emptyParticipant()));
    setGroupLeaderName(userName);
    setGroupLeaderPhone(userPhone || "");
    setRemarks("");
    onError("");
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    onError("");

    try {
      const response = await fetch(
        `${API_URL}/api/conversations/${conversationId}/reservation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            group_leader_name: groupLeaderName.trim(),
            group_leader_phone: groupLeaderPhone.trim(),
            remarks: remarks.trim() || null,
            participants: participants.map((participant) => ({
              full_name: participant.full_name.trim(),
              age: Number(participant.age),
              gender: participant.gender,
              nationality: participant.nationality.trim(),
              contact_number: participant.contact_number.trim() || null,
              address: participant.address.trim() || null,
              emergency_contact: participant.emergency_contact.trim(),
              emergency_number: participant.emergency_number.trim(),
            })),
          }),
        }
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to create the official reservation.")
        );
      }

      setOpen(false);
      await onCreated(data.message || "Official reservation recorded.");
    } catch (caught) {
      onError(
        caught instanceof Error
          ? caught.message
          : "Unable to create the official reservation."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={openForm}>
        <CalendarCheck className="mr-2 h-4 w-4" />
        Record confirmed reservation
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-white">
            Create official reservation
          </h3>

          <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            Use this only after confirming the requested date and remaining
            capacity with the visitor. This creates an APPROVED reservation
            record and closes the coordination conversation.
          </p>
        </div>

        <button
          type="button"
          aria-label="Close reservation form"
          onClick={() => setOpen(false)}
          disabled={saving}
          className="rounded-lg p-2 text-zinc-500 hover:bg-white dark:hover:bg-zinc-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Group leader name
          <input
            required
            maxLength={255}
            value={groupLeaderName}
            onChange={(event) => setGroupLeaderName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Group leader phone
          <input
            required
            type="tel"
            inputMode="numeric"
            maxLength={11}
            value={groupLeaderPhone}
            onChange={(event) =>
              setGroupLeaderPhone(digitsOnly(event.target.value))
            }
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Participant details ({participants.length})
          </h4>

          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Must match the requested group size
          </span>
        </div>

        {participants.map((participant, index) => (
          <div
            key={index}
            className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Participant {index + 1}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
                Full name
                <input
                  required
                  maxLength={255}
                  value={participant.full_name}
                  onChange={(event) =>
                    setParticipants((current) =>
                      current.map((item, i) =>
                        i === index
                          ? { ...item, full_name: event.target.value }
                          : item
                      )
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Age
                <input
                  required
                  type="number"
                  min="1"
                  max="120"
                  value={participant.age}
                  onChange={(event) =>
                    setParticipants((current) =>
                      current.map((item, i) =>
                        i === index
                          ? { ...item, age: event.target.value }
                          : item
                      )
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Gender
                <select
                  required
                  value={participant.gender}
                  onChange={(event) =>
                    setParticipants((current) =>
                      current.map((item, i) =>
                        i === index
                          ? { ...item, gender: event.target.value }
                          : item
                      )
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </label>

              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Nationality
                <input
                  required
                  maxLength={100}
                  value={participant.nationality}
                  onChange={(event) =>
                    setParticipants((current) =>
                      current.map((item, i) =>
                        i === index
                          ? { ...item, nationality: event.target.value }
                          : item
                      )
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Contact number
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={participant.contact_number}
                  onChange={(event) =>
                    setParticipants((current) =>
                      current.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              contact_number: digitsOnly(event.target.value),
                            }
                          : item
                      )
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
                Address
                <input
                  value={participant.address}
                  onChange={(event) =>
                    setParticipants((current) =>
                      current.map((item, i) =>
                        i === index
                          ? { ...item, address: event.target.value }
                          : item
                      )
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Emergency contact name
                <input
                  required
                  maxLength={255}
                  value={participant.emergency_contact}
                  onChange={(event) =>
                    setParticipants((current) =>
                      current.map((item, i) =>
                        i === index
                          ? { ...item, emergency_contact: event.target.value }
                          : item
                      )
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Emergency contact number
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={participant.emergency_number}
                  onChange={(event) =>
                    setParticipants((current) =>
                      current.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              emergency_number: digitsOnly(event.target.value),
                            }
                          : item
                      )
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
        DENR remarks (optional)
        <textarea
          rows={2}
          maxLength={2000}
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={saving}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={saving || participants.length < 1 || participants.length > 12}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {saving ? "Recording..." : "Confirm and record booking"}
        </Button>
      </div>
    </form>
  );
}