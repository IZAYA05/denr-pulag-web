"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Card from "@/components/ui/Card";

const data = [
  {
    trail: "Ambangeg",
    bookings: 520,
  },
  {
    trail: "Akiki",
    bookings: 365,
  },
  {
    trail: "Tawangan",
    bookings: 240,
  },
];

export default function TrailPopularityChart() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Most Popular Trails
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Number of reservations per trail.
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 10,
              right: 20,
              left: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#3f3f46"
              opacity={0.15}
            />

            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              type="category"
              dataKey="trail"
              tickLine={false}
              axisLine={false}
              width={90}
            />

            <Tooltip />

            <Bar
              dataKey="bookings"
              radius={[0, 10, 10, 0]}
              fill="#10b981"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}