import TrailCard, { Trail } from "./TrailCard";

const trails: Trail[] = [
  {
    id: "T-001",
    name: "Ambangeg Trail",
    difficulty: "Easy",
    distance: "7.5 km",
    duration: "4–6 Hours",
    capacity: 500,
    status: "Open",
  },
  {
    id: "T-002",
    name: "Akiki Trail",
    difficulty: "Hard",
    distance: "13 km",
    duration: "8–10 Hours",
    capacity: 500,
    status: "Open",
  },
  {
    id: "T-003",
    name: "Tawangan Trail",
    difficulty: "Moderate",
    distance: "11 km",
    duration: "7–9 Hours",
    capacity: 500,
    status: "Maintenance",
  },
];

export default function TrailGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {trails.map((trail) => (
        <TrailCard key={trail.id} trail={trail} />
      ))}
    </div>
  );
}