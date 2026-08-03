"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import TextInput from "./TextInput";
import PasswordInput from "./PasswordInput";

export default function LoginForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;

    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    const session = await fetch("/api/auth/session").then((res) =>
      res.json()
    );

    if (session?.user?.role === "ADMIN") {
      router.push("/dashboard");
      return;
    }

    router.push("/home");
  }

  return (
    <>
      {error && (
        <div className="mt-6 rounded-xl bg-red-500/20 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form
        onSubmit={handleLogin}
        className="mt-8 space-y-5"
      >
        <TextInput
          label="Email Address"
          name="email"
          type="email"
          placeholder="zaldylovesgihopastor@email.com"
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          placeholder="Enter your password"
          required
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium !text-emerald-400 transition hover:text-emerald-300"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-emerald-500 py-4 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg
                className="mr-2 h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />

                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>

              Signing In...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="text-center text-sm text-zinc-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold !text-emerald-400 transition hover:text-emerald-300"
          >
            Create Account
          </Link>
        </p>
      </div>
    </>
  );
}