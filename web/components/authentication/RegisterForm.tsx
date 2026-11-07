"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  registerUser,
  type RegisterState,
} from "@/app/actions/auth";

import TextInput from "./TextInput";
import PasswordInput from "./PasswordInput";
import TermsAndConditionsModal from "./TermsAndConditionsModal";

const initialState: RegisterState = {
  success: false,
  message: "",
};

export default function RegisterForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
    const [isTermsOpen, setIsTermsOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state, router]);

  return (
    <>
      {state.message && (
        <div
          role="status"
          className={`mt-6 rounded-xl p-3 text-sm ${
            state.success
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {state.message}
        </div>
      )}

      <form action={formAction} className="mt-8 space-y-5">
        {/* Name */}

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="First Name"
            name="firstName"
            placeholder="Enter first name"
            required
            excludeNumbers
            error={state.errors?.firstName?.[0]}
          />

          <TextInput
            label="Last Name"
            name="lastName"
            placeholder="Enter last name"
            required
            excludeNumbers
            error={state.errors?.lastName?.[0]}
          />
        </div>

        {/* Email */}

        <TextInput
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          error={state.errors?.email?.[0]}
        />

        {/* Phone */}

        <TextInput
          label="Contact Number"
          name="phone"
          type="tel"
          placeholder="09XXXXXXXXX"
          value={phone}
          onChange={setPhone}
          inputMode="numeric"
          digitsOnly
          maxLength={11}
          required
          error={state.errors?.phone?.[0]}
        />

        <p className="-mt-3 text-xs text-zinc-500">
          Enter exactly 11 digits.
        </p>

        {/* Password */}

        <div className="space-y-2">
          <PasswordInput
            label="Password"
            name="password"
            placeholder="Create a password"
            minLength={8}
            required
            error={state.errors?.password?.[0]}
          />

          <div className="rounded-lg bg-white/5 p-3 text-xs leading-6 text-zinc-400">
            <p className="mb-1 font-semibold text-zinc-300">
              Password requirements:
            </p>
            <p>â€¢ At least 8 characters</p>
            <p>â€¢ One uppercase letter (Aâ€“Z)</p>
            <p>â€¢ One lowercase letter (aâ€“z)</p>
            <p>â€¢ One number (0â€“9)</p>
            <p>â€¢ One special symbol (! @ # $ % ...)</p>
          </div>
        </div>

        {/* Confirm Password */}

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Confirm your password"
          minLength={8}
          required
          error={state.errors?.confirmPassword?.[0]}
        />

                {/* Terms and Conditions */}
        <label className="flex items-start gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            name="termsAccepted"
            value="on"
            required
            className="mt-1 h-4 w-4 accent-emerald-500"
          />
          <span>
            I have read and agree to the{" "}
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              className="font-semibold text-emerald-400 underline hover:text-emerald-300"
            >
              Terms and Conditions
            </button>
            .
          </span>
        </label>

        {state.errors?.termsAccepted?.[0] && (
          <p className="text-xs text-red-400">
            {state.errors.termsAccepted[0]}
          </p>
        )}

        {/* Submit */}

        <button
          type="submit"
          disabled={isPending || state.success}
          className="w-full rounded-xl bg-emerald-500 py-4 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Creating Account..."
            : state.success
              ? "Account Created"
              : "Create Account"}
        </button>
      </form>

      <TermsAndConditionsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />


      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold !text-emerald-400 transition hover:text-emerald-300"
        >
          Login
        </Link>
      </p>
    </>
  );
}
