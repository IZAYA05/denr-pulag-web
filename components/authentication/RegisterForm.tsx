"use client";

import { useState } from "react";
import Link from "next/link";

import PasswordInput from "./PasswordInput";

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    // Later:
    // Validate token
    // Update password through Laravel API

    setTimeout(() => {
      setLoading(false);
      alert("Password successfully changed.");
    }, 1500);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <PasswordInput
          label="New Password"
          name="password"
          placeholder="Enter your new password"
          required
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Confirm your new password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-500 py-4 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Updating Password..."
            : "Reset Password"}
        </button>
      </form>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="text-center text-sm text-zinc-400">
          Back to{" "}
          <Link
            href="/login"
            className="font-semibold !text-emerald-400 transition hover:text-emerald-300"
          >
            Login
          </Link>
        </p>
      </div>
    </>
  );
}