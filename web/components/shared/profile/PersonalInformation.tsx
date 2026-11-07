"use client";

import { useEffect, useState, type FormEvent } from "react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { useProfile } from "./ProfileContext";

export default function PersonalInformation() {
  const {
    profile,
    updateProfile,
    saving,
    error,
    success,
    clearMessages,
  } = useProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setEmail(profile.email ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await updateProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
    });
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Personal Information
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your personal details and contact information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="First Name"
            type="text"
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
              clearMessages();
            }}
            placeholder="Enter first name"
            required
            minLength={2}
            maxLength={255}
            disabled={!profile || saving}
          />

          <Input
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(event) => {
              setLastName(event.target.value);
              clearMessages();
            }}
            placeholder="Enter last name"
            required
            minLength={2}
            maxLength={255}
            disabled={!profile || saving}
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearMessages();
            }}
            placeholder="Enter email address"
            required
            maxLength={255}
            disabled={!profile || saving}
          />

          <Input
            label="Contact Number"
            type="tel"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              clearMessages();
            }}
            placeholder="09XX XXX XXXX"
            required
            minLength={11}
            maxLength={50}
            disabled={!profile || saving}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            {success}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!profile || saving}
          >
            {saving ? "Saving..." : "Save Personal Information"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
