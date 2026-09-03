"use client";

import { useState } from "react";
import Link from "next/link";

import TextInput from "./TextInput";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    // Later:
    // Send reset email through Laravel API

    setTimeout(() => {
      setLoading(false);
      alert("Password reset link sent.");
    }, 1500);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <TextInput
          label="Email Address"
          name="email"
          type="email"
          placeholder="zaldylovesgihopastor@email.com"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-500 py-4 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Sending Reset Link..."
            : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="text-center text-sm text-zinc-400">
          Remember your password?{" "}
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