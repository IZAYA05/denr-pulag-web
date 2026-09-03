"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import Card from "@/components/ui/Card";

const data = [
  {
    name: "Approved",
    value: 820,
  },
  {
    name: "Pending",
    value: 285,
  },
  {
    name: "Cancelled",
    value: 149,
  },
];

const COLORS = [
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

export default function StatusChart() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Reservation Status
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Distribution of reservation statuses.
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={4}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend
              verticalAlign="bottom"
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}