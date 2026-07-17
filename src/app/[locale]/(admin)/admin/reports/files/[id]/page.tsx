"use client";

import { use } from "react";
import ReportFileForm from "@/components/admin/reports/ReportFileForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditReportFilePage({ params }: PageProps) {
  const { id } = use(params);
  return <ReportFileForm id={id} />;
}
