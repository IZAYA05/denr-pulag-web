"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ChangePassword() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Card className="p-6">
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
        <div className="relative">
          <Input
            label="Current Password"
            type={showCurrent ? "text" : "password"}
            placeholder="Enter current password"
            className="pr-12"
          />

          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-[34px] flex items-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            aria-label={
              showCurrent
                ? "Hide current password"
                : "Show current password"
            }
          >
            {showCurrent ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* New Password */}
        <div className="relative">
          <Input
            label="New Password"
            type={showNew ? "text" : "password"}
            placeholder="Enter new password"
            className="pr-12"
          />

          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-[34px] flex items-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            aria-label={
              showNew
                ? "Hide new password"
                : "Show new password"
            }
          >
            {showNew ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Input
            label="Confirm New Password"
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            className="pr-12"
          />

          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-[34px] flex items-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            aria-label={
              showConfirm
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            {showConfirm ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
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
          <Button type="button" variant="primary">
            Update Password
          </Button>
        </div>
      </div>
    </Card>
  );
}