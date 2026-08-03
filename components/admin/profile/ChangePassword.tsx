"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";

export default function ChangePassword() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inputClass =
    "w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-4 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white";

  const toggleButton =
    "absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300";

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <LockKeyhole className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Change Password
          </h3>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Update your password to keep your account secure.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Current Password */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Current Password
          </label>

          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              className={inputClass}
              placeholder="Enter current password"
            />

            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className={toggleButton}
            >
              {showCurrent ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            New Password
          </label>

          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              className={inputClass}
              placeholder="Enter new password"
            />

            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className={toggleButton}
            >
              {showNew ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Confirm New Password
          </label>

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              className={inputClass}
              placeholder="Confirm new password"
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className={toggleButton}
            >
              {showConfirm ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Password Requirements
          </p>

          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• At least 8 characters</li>
            <li>• One uppercase letter</li>
            <li>• One lowercase letter</li>
            <li>• One number</li>
            <li>• One special character</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-700">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}