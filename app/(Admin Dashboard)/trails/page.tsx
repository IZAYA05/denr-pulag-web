import TrailStats from "@/components/admin/trails/TrailStats";
import TrailGrid from "@/components/admin/trails/TrailGrid";

export default function TrailsPage() {
  return (
    <div className="space-y-8">
      <TrailStats />

      <TrailGrid />
    </div>
  );
} 