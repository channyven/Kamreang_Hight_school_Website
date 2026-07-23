"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import StudentIdCard from "@/components/admin/students/StudentIdCard";
import { openPrintWindow } from "@/lib/student-card-print";
import { getFullName } from "@/lib/student-card-format";
import type { Student } from "@/types";

interface Props {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StudentCardModal({ student, open, onOpenChange }: Props) {
  const handlePrint = () => {
    const opened = openPrintWindow([student], "Student Card", `Student ID Card — ${getFullName(student)}`);
    if (!opened) toast.error("Popup blocked — please allow popups for this site and try again");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header — always visible */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
              <h2 className="text-sm font-semibold text-gray-900">Student ID Card</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Card — the only part that scrolls if it doesn't fit */}
            <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-gray-50">
              <StudentIdCard student={student} />
            </div>

            {/* Actions — always visible */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100 shrink-0">
              <Button variant="outline" size="sm" className="h-9 gap-2 text-sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                size="sm"
                className="h-9 gap-2 text-sm bg-school-blue-800 hover:bg-school-blue-900"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
