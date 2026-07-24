"use client";

import { use } from "react";
import ReportSectionForm from "@/components/admin/reports/ReportSectionForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditReportSectionPage({ params }: PageProps) {
  const { id } = use(params);
  return <ReportSectionForm id={id} />;
}
