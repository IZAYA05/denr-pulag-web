"use client";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Monitor,
  Smartphone,
  Clock,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";
import { useSession } from "next-auth/react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

export default function OrganizerProfilePage() {
  const { data: session } =
    useSession();

  const firstName =
    session?.user?.firstName || "";

  const lastName =
    session?.user?.lastName || "";

  const email =
    session?.user?.email || "";

  const phone =
    session?.user?.phone || "";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    "OR";

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  return (
    <div className="space-y-6">
      {/* Profile Header */}

      <Card className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100 text-4xl font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            {initials}
          </div>

          <h1 className="mt-5 text-2xl font-bold text-zinc-900 dark:text-white">
            {firstName} {lastName}
          </h1>

          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            <ShieldCheck className="h-4 w-4" />
            Organizer
          </div>

          <p className="mt-3 text-zinc-500 dark:text-zinc-400">
            {email}
          </p>
        </div>
      </Card>

      {/* Personal + Account Information */}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Personal Information */}

        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Personal Information
            </h3>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Update your personal details.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="First Name"
              type="text"
              defaultValue={
                firstName
              }
            />

            <Input
              label="Last Name"
              type="text"
              defaultValue={
                lastName
              }
            />

            <Input
              label="Contact Number"
              type="tel"
              defaultValue={
                phone
              }
              placeholder="+63 9XX XXX XXXX"
            />

            <Input
              label="Email Address"
              type="email"
              value={
                email
              }
              readOnly
              disabled
            />
          </div>
        </Card>

        {/* Account Information */}

        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Account Information
            </h3>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              View your account and access information.
            </p>
          </div>

          <div className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={
                email
              }
              readOnly
              disabled
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Role
                </label>

                <Badge variant="warning">
                  Organizer
                </Badge>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Account Status
                </label>

                <Badge variant="success">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Change Password */}

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
              type={
                showCurrent
                  ? "text"
                  : "password"
              }
              placeholder="Enter current password"
              className="pr-12"
            />

            <button
              type="button"
              onClick={() =>
                setShowCurrent(
                  !showCurrent
                )
              }
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
              type={
                showNew
                  ? "text"
                  : "password"
              }
              placeholder="Enter new password"
              className="pr-12"
            />

            <button
              type="button"
              onClick={() =>
                setShowNew(
                  !showNew
                )
              }
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
              type={
                showConfirm
                  ? "text"
                  : "password"
              }
              placeholder="Confirm new password"
              className="pr-12"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirm(
                  !showConfirm
                )
              }
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
              <li>
                • At least 8 characters
              </li>
              <li>
                • One uppercase letter
              </li>
              <li>
                • One lowercase letter
              </li>
              <li>
                • One number
              </li>
              <li>
                • One special character
              </li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
            >
              Update Password
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Login Activity */}

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Recent Login Activity
          </h3>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Review recent devices that have accessed your account.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Monitor className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium text-zinc-900 dark:text-white">
                  Windows PC
                </h4>

                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  Current Session
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <span>
                  Google Chrome
                </span>

                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Current Location
                </span>

                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Current Session
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Smartphone className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h4 className="font-medium text-zinc-900 dark:text-white">
                Mobile Device
              </h4>

              <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <span>
                  Google Chrome
                </span>

                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Previous Session
                </span>

                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Previous Login
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Changes */}

      <div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <Button
          type="button"
          variant="outline"
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="primary"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}