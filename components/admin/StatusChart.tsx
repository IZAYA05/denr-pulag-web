"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  {
    name: "Approved",
    value: 185,
    color: "#059669",
  },
  {
    name: "Pending",
    value: 52,
    color: "#F59E0B",
  },
  {
    name: "Cancelled",
    value: 27,
    color: "#DC2626",
  },
];

export default function StatusChart() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      {/* Header */}

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Reservation Status
        </h2>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Distribution of current reservations
        </p>
      </div>

      {/* Chart */}

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={4}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
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

      {/* Summary */}

      <div className="mt-6 grid grid-cols-3 gap-3">
        {data.map((item) => (
          <div
            key={item.name}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div
              className="mx-auto mb-2 h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />

            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {item.name}
            </p>

            <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}