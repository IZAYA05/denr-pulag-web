import PackageStats from "@/components/organizer/packages/PackageStats";
import PackageFilters from "@/components/organizer/packages/PackageFilters";
import PackageList from "@/components/organizer/packages/PackageList";
import PackagePagination from "@/components/organizer/packages/PackagePagination";
import { PackageProvider } from "@/components/organizer/packages/PackageContext";

export default function PackagesPage() {
  return (
    <PackageProvider>
      <div className="space-y-8">
        <PackageStats />

        <PackageFilters />

        <PackageList />

        <PackagePagination />
      </div>
    </PackageProvider>
  );
}