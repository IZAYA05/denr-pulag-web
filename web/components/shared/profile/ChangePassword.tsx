"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { useProfile } from "./ProfileContext";

export default function ChangePassword() {
  const {
    changePassword,
    changingPassword,
    error,
    success,
    clearMessages,
  } = useProfile();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState("");

  function clearFormMessages() {
    clearMessages();
    setLocalError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFormMessages();

    if (newPassword !== confirmPassword) {
      setLocalError("The new password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setLocalError("Your new password must contain at least 8 characters.");
      return;
    }

    const changed = await changePassword({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    });

    if (changed) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }

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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <Input
            label="Current Password"
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              clearFormMessages();
            }}
            placeholder="Enter current password"
            className="pr-12"
            autoComplete="current-password"
            required
            disabled={changingPassword}
          />

          <button
            type="button"
            onClick={() => setShowCurrent((value) => !value)}
            className="absolute right-3 top-[34px] flex items-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            aria-label={
              showCurrent ? "Hide current password" : "Show current password"
            }
          >
            {showCurrent ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            label="New Password"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              clearFormMessages();
            }}
            placeholder="Enter new password"
            className="pr-12"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={changingPassword}
          />

          <button
            type="button"
            onClick={() => setShowNew((value) => !value)}
            className="absolute right-3 top-[34px] flex items-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            aria-label={showNew ? "Hide new password" : "Show new password"}
          >
            {showNew ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm New Password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              clearFormMessages();
            }}
            placeholder="Confirm new password"
            className="pr-12"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={changingPassword}
          />

          <button
            type="button"
            onClick={() => setShowConfirm((value) => !value)}
            className="absolute right-3 top-[34px] flex items-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            aria-label={
              showConfirm ? "Hide confirm password" : "Show confirm password"
            }
          >
            {showConfirm ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Password Requirements
          </p>

          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>At least 8 characters</li>
            <li>New password and confirmation must match</li>
            <li>Your current password must be correct</li>
          </ul>
        </div>

        {(localError || error) && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            {localError || error}
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
            disabled={
              changingPassword ||
              !currentPassword ||
              newPassword.length < 8 ||
              !confirmPassword
            }
          >
            {changingPassword ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
