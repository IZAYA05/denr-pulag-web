"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ReservationPagination() {
  return (
    <Card className="px-6 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left */}

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing{" "}
          <span className="font-semibold text-zinc-900 dark:text-white">
            1–10
          </span>{" "}
          of{" "}
          <span className="font-semibold text-zinc-900 dark:text-white">
            264
          </span>{" "}
          reservations
        </p>

        {/* Right */}

        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 w-10 p-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button variant="primary" className="h-10 w-10 p-0">
            1
          </Button>

          <Button variant="outline" className="h-10 w-10 p-0">
            2
          </Button>

          <Button variant="outline" className="h-10 w-10 p-0">
            3
          </Button>

          <span className="px-2 text-zinc-500">...</span>

          <Button variant="outline" className="h-10 w-10 p-0">
            27
          </Button>

          <Button variant="outline" className="h-10 w-10 p-0">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}