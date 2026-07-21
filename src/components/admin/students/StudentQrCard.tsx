"use client";

import { useState } from "react";
import {
  QrCode, Download, Printer, RefreshCw, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { regenerateStudentQrCode } from "@/actions/students";
import { downloadQrCode, printStudentCard } from "@/lib/qrcode";
import { supabase } from "@/lib/supabase";
import type { Student } from "@/types";

interface Props {
  student: Student;
}

export default function StudentQrCard({ student }: Props) {
  const s = student;
  const [qrRegenerating, setQrRegenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(s.qr_code ?? null);
  const fullName = `${s.english_first_name} ${s.english_last_name}`;

  const handleRegenerate = async () => {
    setQrRegenerating(true);
    const result = await regenerateStudentQrCode(s.id);
    if (result.success) {
      const { data: refreshed } = await supabase
        .from("students")
        .select("qr_code")
        .eq("id", s.id)
        .single();
      if (refreshed?.qr_code) {
        setQrDataUrl(refreshed.qr_code as string);
      }
      toast.success("QR code regenerated successfully.");
    } else {
      toast.error(result.error ?? "Failed to regenerate QR code");
    }
    setQrRegenerating(false);
  };

  const handlePrint = () => {
    if (qrDataUrl) {
      printStudentCard({
        name: fullName,
        studentId: s.student_id,
        qrDataUrl,
        photo: s.photo,
        faculty: s.faculty,
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      {/* Large, clean QR Code */}
      <div className="bg-white rounded-2xl border-2 border-blue-100 p-4 shadow-sm">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR Code - ${fullName}`}
            className="w-48 h-48 object-contain"
          />
        ) : (
          <div className="w-48 h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-16 h-16 text-blue-300 mx-auto mb-2" />
              <p className="text-xs text-blue-400 font-mono">No QR yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Student ID label */}
      <div className="text-center">
        <p className="text-xs text-gray-400 font-mono tracking-wider uppercase">
          Student ID: {s.student_id}
        </p>
        <p className="text-[10px] text-gray-300 mt-0.5">
          Scan to view student profile
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-2">
        <Button
          variant="default"
          size="sm"
          className="w-full h-10 gap-2 text-sm justify-center bg-blue-600 hover:bg-blue-700"
          disabled={!qrDataUrl}
          onClick={() => {
            if (qrDataUrl) {
              downloadQrCode(qrDataUrl, `${s.student_id}-${s.english_last_name}`);
            }
          }}
        >
          <Download className="w-4 h-4" /> Download QR
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-10 gap-2 text-sm justify-center"
          disabled={!qrDataUrl}
          onClick={handlePrint}
        >
          <Printer className="w-4 h-4" /> Print Student Card
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-10 gap-2 text-sm justify-center text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={handleRegenerate}
          disabled={qrRegenerating}
        >
          {qrRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {qrRegenerating ? "Regenerating..." : "Regenerate QR Code"}
        </Button>
      </div>
    </div>
  );
}
