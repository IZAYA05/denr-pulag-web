import { Search } from "lucide-react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

interface VerificationFiltersProps {
  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

export default function VerificationFilters({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: VerificationFiltersProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

          <Input
            type="text"
            placeholder="Search booking, package, or customer..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-12"
          />
        </div>

        <div className="w-full lg:w-64">
          <Select
            aria-label="Filter by verification status"
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            options={[
              "All Statuses",
              "Not Verified",
              "Verification Pending",
              "Verified",
            ]}
          />
        </div>
      </div>
    </Card>
  );
}