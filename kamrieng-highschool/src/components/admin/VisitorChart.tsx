"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const DATA = [
  { day: "Mon", visitors: 120, unique: 84 },
  { day: "Tue", visitors: 185, unique: 132 },
  { day: "Wed", visitors: 142, unique: 99 },
  { day: "Thu", visitors: 203, unique: 154 },
  { day: "Fri", visitors: 178, unique: 120 },
  { day: "Sat", visitors: 95, unique: 68 },
  { day: "Sun", visitors: 67, unique: 45 },
];

export default function VisitorChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={DATA} margin={{ top: 5, right: 8, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00376f" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#00376f" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradUnique" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fdbc13" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#fdbc13" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: "#8892a0", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#8892a0", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #e8edf5",
            borderRadius: 10,
            boxShadow: "0px 4px 20px rgba(30,78,140,0.10)",
            fontSize: 12,
          }}
          labelStyle={{ color: "#0d1c2f", fontWeight: 600, marginBottom: 4 }}
        />
        <Area
          type="monotone"
          dataKey="visitors"
          name="Total Visitors"
          stroke="#00376f"
          strokeWidth={2.5}
          fill="url(#gradVisitors)"
          dot={false}
          activeDot={{ r: 5, fill: "#00376f", strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="unique"
          name="Unique Visitors"
          stroke="#fdbc13"
          strokeWidth={2}
          fill="url(#gradUnique)"
          dot={false}
          activeDot={{ r: 4, fill: "#fdbc13", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
