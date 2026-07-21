"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Save, Loader2, Camera, User, Phone, Mail, MapPin,
  GraduationCap, ShieldCheck, X, Calendar, IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { studentSchema, type StudentInput } from "@/schemas/validations";
import { createStudent } from "@/actions/students";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// ─── Config ──────────────────────────────────────────────────

const STUDY_TRACKS = ["Science", "Social Science", "General"];
const GRADES = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const SEMESTERS = ["Semester 1", "Semester 2", "Summer"];
const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-800" },
  { value: "graduated", label: "Graduated", color: "bg-blue-100 text-blue-800" },
  { value: "suspended", label: "Suspended", color: "bg-yellow-100 text-yellow-800" },
  { value: "transferred", label: "Transferred", color: "bg-purple-100 text-purple-800" },
  { value: "expelled", label: "Expelled", color: "bg-red-100 text-red-800" },
];

function DatePickerField({
  value, onChange, label, error,
}: {
  value: string; onChange: (val: string) => void; label: string; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Dialog ──────────────────────────────────────────────────

export default function CreateStudentDialog({ open, onOpenChange, onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } =
    useForm<StudentInput>({
      resolver: zodResolver(studentSchema),
      defaultValues: {
        status: "active", nationality: "Khmer",
        faculty: "", major: "", academic_year: "", class_name: "",
        study_year: "", semester: "",
        phoneNumber: "", email: "", streetAddress: "",
        province: "", district: "", commune: "", village: "",
        gpa: undefined, credits_earned: undefined,
        student_id: `STU${new Date().getFullYear()}${String(Math.floor(1000 + Math.random() * 9000))}`,
      },
    });



  // ─── Reset form when dialog opens ──────────────────────────
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Clear form and photo on close
      reset({
        status: "active", nationality: "Khmer",
        faculty: "", major: "", academic_year: "", class_name: "",
        study_year: "", semester: "",
        phoneNumber: "", email: "", streetAddress: "",
        province: "", district: "", commune: "", village: "",
        gpa: undefined, credits_earned: undefined,
        student_id: `STU-${new Date().getFullYear()}-XXXX`,
      });
      setPhotoPreview(null);
      setPhotoUrl("");
    }
    onOpenChange(open);
  };

  // ─── Photo upload ──────────────────────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("File must be smaller than 10MB"); return; }
    setUploadingPhoto(true);

    const img = document.createElement("img");
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 400;
        let w = img.naturalWidth, h = img.naturalHeight;
        if (w > MAX || h > MAX) {
          const ratio = Math.min(MAX / w, MAX / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setPhotoPreview(dataUrl);
        setPhotoUrl(dataUrl);
        setValue("photo", dataUrl);
        setUploadingPhoto(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // ─── Submit ────────────────────────────────────────────────
  const onSubmit = async (data: StudentInput) => {
    setSubmitting(true);
    const cleaned = { ...data, photo: photoUrl || data.photo || undefined };
    if (!cleaned.date_of_birth) delete (cleaned as Record<string, unknown>).date_of_birth;
    if (!cleaned.card_issue_date) delete (cleaned as Record<string, unknown>).card_issue_date;
    if (!cleaned.card_expiry_date) delete (cleaned as Record<string, unknown>).card_expiry_date;

    const result = await createStudent(cleaned);
    // QR code is generated server-side after creation with the UUID
    setSubmitting(false);

    if (result.success) {
      toast.success("Student created successfully.");
      handleOpenChange(false);
      onSuccess();
    } else {
      toast.error(result.error ?? "Failed to create student");
    }
  };

  const FormField = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {children}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 py-5 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-lg">
          <DialogTitle className="text-xl font-bold text-gray-900">Add New Student</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Fill in the student details below. Required fields are marked.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* ═══ SECTION 1 — IDENTITY ═══ */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-gray-900">Identity</h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Photo */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative">
                  <Avatar className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                    <AvatarImage src={photoPreview ?? undefined} />
                    <AvatarFallback className="bg-gray-50"><Camera className="w-8 h-8 text-gray-400" /></AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />
                <p className="text-[10px] text-gray-400 text-center max-w-[120px] leading-tight">JPG, PNG, WebP<br />Max 10MB</p>
                {photoPreview && (
                  <button type="button" onClick={() => { setPhotoPreview(null); setPhotoUrl(""); setValue("photo", ""); }}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <X className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-4">
                {/* Student ID */}
                <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                  <IdCard className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">Student ID:</span>                    <Input {...register("student_id")} readOnly className="font-mono text-sm h-8 max-w-[200px] bg-gray-100 text-gray-500" placeholder="Auto-generated" />
                </div>

                <Separator />

                {/* Khmer names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Khmer First Name *">
                    <Input {...register("khmer_first_name")} className="font-khmer h-10 rounded-lg" placeholder="នាមត្រកូល" />
                    {errors.khmer_first_name && <p className="text-xs text-red-500">{errors.khmer_first_name.message}</p>}
                  </FormField>
                  <FormField label="Khmer Last Name *">
                    <Input {...register("khmer_last_name")} className="font-khmer h-10 rounded-lg" placeholder="នាមខ្លួន" />
                    {errors.khmer_last_name && <p className="text-xs text-red-500">{errors.khmer_last_name.message}</p>}
                  </FormField>
                </div>

                {/* English names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="English First Name *">
                    <Input {...register("english_first_name")} className="h-10 rounded-lg" placeholder="First name" />
                    {errors.english_first_name && <p className="text-xs text-red-500">{errors.english_first_name.message}</p>}
                  </FormField>
                  <FormField label="English Last Name *">
                    <Input {...register("english_last_name")} className="h-10 rounded-lg" placeholder="Last name" />
                    {errors.english_last_name && <p className="text-xs text-red-500">{errors.english_last_name.message}</p>}
                  </FormField>
                </div>

                <Separator />

                {/* Gender, DOB, Place of Birth, Nationality */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <FormField label="Gender">
                    <Controller name="gender" control={control} render={({ field }) => (
                      <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                        <SelectTrigger className="bg-white h-10 rounded-lg"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )} />
                  </FormField>
                  <DatePickerField label="Date of Birth" value={watch("date_of_birth") ?? ""}
                    onChange={(v) => setValue("date_of_birth", v)} error={errors.date_of_birth?.message} />
                  <FormField label="Place of Birth">
                    <Input {...register("place_of_birth")} className="h-10 rounded-lg" placeholder="City / Province" />
                  </FormField>
                  <FormField label="Nationality">
                    <Input {...register("nationality")} className="h-10 rounded-lg" placeholder="Khmer" />
                  </FormField>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* ═══ SECTION 2 — CONTACT & ADDRESS ═══ */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-gray-900">Contact &amp; Address</h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Phone Number">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input {...register("phoneNumber")} placeholder="+855 12 345 678" className="pl-10 h-10 rounded-lg" />
                  </div>
                </FormField>
                <FormField label="Email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input {...register("email")} type="email" placeholder="student@example.com" className="pl-10 h-10 rounded-lg" />
                  </div>
                </FormField>
              </div>
              <FormField label="Street Address">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input {...register("streetAddress")} placeholder="Street / House number" className="pl-10 h-10 rounded-lg" />
                </div>
              </FormField>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <FormField label="Province">
                  <Input {...register("province")} placeholder="Enter province" className="h-10 rounded-lg" />
                </FormField>
                <FormField label="District">
                  <Input {...register("district")} placeholder="Enter district" className="h-10 rounded-lg" />
                </FormField>
                <FormField label="Commune">
                  <Input {...register("commune")} placeholder="Enter commune" className="h-10 rounded-lg" />
                </FormField>
                <FormField label="Village">
                  <Input {...register("village")} placeholder="Enter village" className="h-10 rounded-lg" />
                </FormField>
              </div>
            </div>
          </div>

          <Separator />

          {/* ═══ SECTION 3 — ACADEMIC PLACEMENT ═══ */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-gray-900">Academic Placement</h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="High School *">
                  <Input {...register("faculty")} placeholder="e.g. Kamreang High School" className="h-10 rounded-lg" />
                  {errors.faculty && <p className="text-xs text-red-500">{errors.faculty.message}</p>}
                </FormField>
                <FormField label="Study Track *">
                  <Controller name="major" control={control} render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white h-10 rounded-lg">
                        <SelectValue placeholder="Select track" />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDY_TRACKS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                  {errors.major && <p className="text-xs text-red-500">{errors.major.message}</p>}
                </FormField>
                <FormField label="Academic Year *">
                  <Input {...register("academic_year")} placeholder="e.g. 2024-2025" className="h-10 rounded-lg" />
                  {errors.academic_year && <p className="text-xs text-red-500">{errors.academic_year.message}</p>}
                </FormField>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <FormField label="Class *">
                  <Input {...register("class_name")} placeholder="e.g. A, B, 1, 2" className="h-10 rounded-lg" />
                  {errors.class_name && <p className="text-xs text-red-500">{errors.class_name.message}</p>}
                </FormField>
                <FormField label="Grade">
                  <Controller name="study_year" control={control} render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white h-10 rounded-lg"><SelectValue placeholder="Select grade" /></SelectTrigger>
                      <SelectContent>
                        {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </FormField>
                <FormField label="Semester">
                  <Controller name="semester" control={control} render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white h-10 rounded-lg"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {SEMESTERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </FormField>
                <FormField label="GPA">
                  <Controller name="gpa" control={control} render={({ field }) => (
                    <Input type="number" step="0.01" min="0" max="99.99"
                      value={field.value ?? ""}
                      onChange={(e) => { const v = e.target.value; field.onChange(v === "" ? undefined : Number(v)); }}
                      placeholder="0.00" className="h-10 rounded-lg" />
                  )} />
                </FormField>
                <FormField label="Credits">
                  <Controller name="credits_earned" control={control} render={({ field }) => (
                    <Input type="number" min="0"
                      value={field.value ?? ""}
                      onChange={(e) => { const v = e.target.value; field.onChange(v === "" ? undefined : Number(v)); }}
                      placeholder="0" className="h-10 rounded-lg" />
                  )} />
                </FormField>
              </div>
            </div>
          </div>

          <Separator />

          {/* ═══ SECTION 4 — STATUS & CARD ═══ */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-gray-900">Status &amp; Card Validity</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Status *">
                <Controller name="status" control={control} render={({ field }) => (
                  <Select value={field.value ?? "active"} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-white h-10 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          <span className="inline-flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${o.color.split(" ")[0]}`} />
                            {o.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </FormField>
              <DatePickerField label="Card Issue Date" value={watch("card_issue_date") ?? ""}
                onChange={(v) => setValue("card_issue_date", v)} />
              <DatePickerField label="Card Expiry Date" value={watch("card_expiry_date") ?? ""}
                onChange={(v) => setValue("card_expiry_date", v)} />
            </div>
          </div>

          {/* ═══ Actions ═══ */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}
              className="h-10 px-6 rounded-lg">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2 rounded-lg">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {submitting ? "Creating..." : "Create Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
