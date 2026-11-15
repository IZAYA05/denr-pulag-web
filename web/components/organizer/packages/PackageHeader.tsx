import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";

type PackageHeaderProps = {
  onCreate: () => void;
};

export default function PackageHeader({
  onCreate,
}: PackageHeaderProps) {
  return (
    <PageHeader
      title="My Packages"

      actions={
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Package
        </Button>
      }
    />
  );
}