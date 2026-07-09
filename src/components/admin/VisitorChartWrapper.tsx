"use client";

import dynamic from "next/dynamic";

const VisitorChart = dynamic(() => import("./VisitorChart"), { ssr: false });

export default function VisitorChartWrapper() {
  return <VisitorChart />;
}
