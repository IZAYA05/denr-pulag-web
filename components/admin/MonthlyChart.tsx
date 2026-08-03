"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", reservations: 42 },
  { month: "Feb", reservations: 58 },
  { month: "Mar", reservations: 71 },
  { month: "Apr", reservations: 65 },
  { month: "May", reservations: 92 },
  { month: "Jun", reservations: 118 },
  { month: "Jul", reservations: 146 },
  { month: "Aug", reservations: 132 },
  { month: "Sep", reservations: 98 },
  { month: "Oct", reservations: 110 },
  { month: "Nov", reservations: 89 },
  { month: "Dec", reservations: 76 },
];

export default function MonthlyChart() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Monthly Reservations
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Reservation trends throughout the year
          </p>
        </div>
      </div>

      {/* Chart */}

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 13,
              }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 13,
              }}
            />

            <Tooltip />
                        <Line
              type="monotone"
              dataKey="reservations"
              stroke="#059669"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#059669",
                strokeWidth: 2,
                stroke: "#ffffff",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}