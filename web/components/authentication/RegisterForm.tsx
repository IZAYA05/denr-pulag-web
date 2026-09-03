"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  registerUser,
  type RegisterState,
} from "@/app/actions/auth";

import TextInput from "./TextInput";
import PasswordInput from "./PasswordInput";

const initialState: RegisterState = {
  success: false,
  message: "",
};

export default function RegisterForm() {
  const router = useRouter();

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
          className={`mt-6 rounded-xl p-3 text-sm ${
            state.success
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {state.message}
        </div>
      )}

      <form
        action={formAction}
        className="mt-8 space-y-5"
      >
        {/* Name */}

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="First Name"
            name="firstName"
            placeholder="Giho"
            error={state.errors?.firstName?.[0]}
          />

          <TextInput
            label="Last Name"
            name="lastName"
            placeholder="Pastor"
            error={state.errors?.lastName?.[0]}
          />
        </div>

        {/* Email */}

        <TextInput
          label="Email Address"
          name="email"
          type="email"
          placeholder="zaldylovesgihopastor@email.com"
          error={state.errors?.email?.[0]}
        />

        {/* Phone */}

        <TextInput
          label="Contact Number"
          name="phone"
          type="tel"
          placeholder="09XXXXXXXXX"
          error={state.errors?.phone?.[0]}
        />

        {/* Password */}

        <PasswordInput
          label="Password"
          name="password"
          placeholder="Create a password"
          error={state.errors?.password?.[0]}
        />

        {/* Confirm Password */}

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Confirm your password"
          error={state.errors?.confirmPassword?.[0]}
        />

        {/* Terms */}

        <label className="flex items-start gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            required
            className="mt-1 accent-emerald-500"
          />

          <span>
            I agree to the Terms &amp; Conditions and Privacy Policy.
          </span>
        </label>

        {/* Submit */}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-emerald-500 py-4 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Creating Account..."
            : "Create Account"}
        </button>
      </form>

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