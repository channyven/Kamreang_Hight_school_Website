"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Loader2, User, Phone, Mail, MapPin,
  GraduationCap, ShieldCheck, Calendar, IdCard, Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhotoCropUploader from "@/components/admin/PhotoCropUploader";
import { studentSchema, type StudentInput } from "@/schemas/validations";
import { createStudent } from "@/actions/students";
import { adminHref, convertGoogleDriveUrl } from "@/utils";

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

function FormField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function NewStudentPage() {
  const locale = useLocale();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } =
    useForm<StudentInput>({
      resolver: zodResolver(studentSchema),
      defaultValues: {
        status: "active", nationality: "Khmer",
        faculty: "", major: "", academic_year: "", class_name: "",
        study_year: "", semester: "",
        father_name: "", father_name_km: "", mother_name: "", mother_name_km: "",
        phone_number: "", email: "", street_address: "",
        province: "", district: "", commune: "", village: "",
        gpa: undefined, credits_earned: undefined,
        student_id: `STU-${new Date().getFullYear()}-XXXX`,
      },
    });



  // ─── Photo upload ──────────────────────────────────────────
  // Auto-convert Google Drive share links pasted into ImageUploader's URL
  // field into our proxy format, same pattern used by the other admin forms.
  useEffect(() => {
    if (photoUrl) {
      const converted = convertGoogleDriveUrl(photoUrl);
      if (converted !== photoUrl) {
        setPhotoUrl(converted);
        setValue("photo", converted);
      }
    }
  }, [photoUrl, setValue]);

  // ─── Submit ────────────────────────────────────────────────
  const onSubmit = async (data: StudentInput) => {
    setSubmitting(true);
    const cleaned = { ...data, photo: photoUrl || data.photo || undefined };
    if (!cleaned.date_of_birth) delete (cleaned as Record<string, unknown>).date_of_birth;
    if (!cleaned.card_issue_date) delete (cleaned as Record<string, unknown>).card_issue_date;
    if (!cleaned.card_expiry_date) delete (cleaned as Record<string, unknown>).card_expiry_date;

    const result = await createStudent(cleaned);
    setSubmitting(false);

    if (result.success) {
      toast.success("Student created successfully.");
      router.push(adminHref(locale, "students"));
    } else {
      toast.error(result.error ?? "Failed to create student");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ═══ Header ═══ */}
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
              <Link href={adminHref(locale, "students")}><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
              <p className="text-sm text-gray-500 mt-0.5">Fill in the student details below. Required fields are marked.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ═══ SECTION 1 — IDENTITY ═══ */}
          <Card className="border border-[#E5E7EB] shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-[#E5E7EB] px-6 py-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base font-semibold text-gray-900">Identity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Photo */}
                <div className="w-full lg:w-[240px] shrink-0">
                  <PhotoCropUploader
                    value={photoUrl}
                    onChange={(url) => { setPhotoUrl(url ?? ""); setValue("photo", url ?? ""); }}
                    bucket="STUDENT_PHOTOS"
                    folder="students"
                    label="Student Photo (upload, URL, or Google Drive link)"
                  />
                </div>

                <div className="flex-1 space-y-5">
                  {/* Student ID */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <IdCard className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">Student ID:</span>
                    <Input {...register("student_id")} readOnly className="font-mono text-sm h-8 max-w-[200px] bg-gray-100 text-gray-500" placeholder="Auto-generated" />
                  </div>

                  <Separator />

                  {/* Khmer names */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Khmer First Name *">
                      <Input {...register("khmer_first_name")} className="font-khmer h-12 rounded-xl" placeholder="នាមត្រកូល" />
                      {errors.khmer_first_name && <p className="text-xs text-red-500">{errors.khmer_first_name.message}</p>}
                    </FormField>
                    <FormField label="Khmer Last Name *">
                      <Input {...register("khmer_last_name")} className="font-khmer h-12 rounded-xl" placeholder="នាមខ្លួន" />
                      {errors.khmer_last_name && <p className="text-xs text-red-500">{errors.khmer_last_name.message}</p>}
                    </FormField>
                  </div>

                  {/* English names */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="English First Name *">
                      <Input {...register("english_first_name")} className="h-12 rounded-xl" placeholder="First name" />
                      {errors.english_first_name && <p className="text-xs text-red-500">{errors.english_first_name.message}</p>}
                    </FormField>
                    <FormField label="English Last Name *">
                      <Input {...register("english_last_name")} className="h-12 rounded-xl" placeholder="Last name" />
                      {errors.english_last_name && <p className="text-xs text-red-500">{errors.english_last_name.message}</p>}
                    </FormField>
                  </div>

                  <Separator />

                  {/* Gender, DOB, Place of Birth, Nationality */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField label="Gender">
                      <Controller name="gender" control={control} render={({ field }) => (
                        <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                          <SelectTrigger className="bg-white h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
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
                      <Input {...register("place_of_birth")} className="h-12 rounded-xl" placeholder="City / Province" />
                    </FormField>
                    <FormField label="Nationality">
                      <Input {...register("nationality")} className="h-12 rounded-xl" placeholder="Khmer" />
                    </FormField>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ═══ SECTION 2 — CONTACT & ADDRESS ═══ */}
          <Card className="border border-[#E5E7EB] shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-[#E5E7EB] px-6 py-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base font-semibold text-gray-900">Contact &amp; Address</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Phone Number">
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input {...register("phone_number")} placeholder="+855 12 345 678" className="pl-12 h-12 rounded-xl" />
                  </div>
                </FormField>
                <FormField label="Email">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input {...register("email")} type="email" placeholder="student@example.com" className="pl-12 h-12 rounded-xl" />
                  </div>
                </FormField>
              </div>
              <FormField label="Street Address">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input {...register("street_address")} placeholder="Street / House number" className="pl-12 h-12 rounded-xl" />
                </div>
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Province"><Input {...register("province")} placeholder="Enter province" className="h-12 rounded-xl" /></FormField>
                <FormField label="District"><Input {...register("district")} placeholder="Enter district" className="h-12 rounded-xl" /></FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Commune"><Input {...register("commune")} placeholder="Enter commune" className="h-12 rounded-xl" /></FormField>
                <FormField label="Village"><Input {...register("village")} placeholder="Enter village" className="h-12 rounded-xl" /></FormField>
              </div>
            </CardContent>
          </Card>

          {/* ═══ PARENT INFORMATION ═══ */}
          <Card className="border border-[#E5E7EB] shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-[#E5E7EB] px-6 py-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base font-semibold text-gray-900">Parent Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Father's Name (English) *">
                  <Input {...register("father_name")} className="h-12 rounded-xl" placeholder="Enter father's full name" />
                  {errors.father_name && <p className="text-xs text-red-500">{errors.father_name.message}</p>}
                </FormField>
                <FormField label="Father's Name (Khmer) *">
                  <Input {...register("father_name_km")} className="font-khmer h-12 rounded-xl" placeholder="ឈ្មោះឪពុក" />
                  {errors.father_name_km && <p className="text-xs text-red-500">{errors.father_name_km.message}</p>}
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField label="Mother's Name (English) *">
                  <Input {...register("mother_name")} className="h-12 rounded-xl" placeholder="Enter mother's full name" />
                  {errors.mother_name && <p className="text-xs text-red-500">{errors.mother_name.message}</p>}
                </FormField>
                <FormField label="Mother's Name (Khmer) *">
                  <Input {...register("mother_name_km")} className="font-khmer h-12 rounded-xl" placeholder="ឈ្មោះម្តាយ" />
                  {errors.mother_name_km && <p className="text-xs text-red-500">{errors.mother_name_km.message}</p>}
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* ═══ SECTION 3 — ACADEMIC PLACEMENT ═══ */}
          <Card className="border border-[#E5E7EB] shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-[#E5E7EB] px-6 py-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base font-semibold text-gray-900">Academic Placement</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="High School *">
                  <Input {...register("faculty")} placeholder="e.g. Kamreang High School" className="h-12 rounded-xl" />
                  {errors.faculty && <p className="text-xs text-red-500">{errors.faculty.message}</p>}
                </FormField>
                <FormField label="Study Track *">
                  <Controller name="major" control={control} render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white h-12 rounded-xl">
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
                  <Input {...register("academic_year")} placeholder="e.g. 2024-2025" className="h-12 rounded-xl" />
                  {errors.academic_year && <p className="text-xs text-red-500">{errors.academic_year.message}</p>}
                </FormField>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <FormField label="Class *">
                  <Input {...register("class_name")} placeholder="e.g. A, B, 1, 2" className="h-12 rounded-xl" />
                  {errors.class_name && <p className="text-xs text-red-500">{errors.class_name.message}</p>}
                </FormField>
                <FormField label="Grade">
                  <Controller name="study_year" control={control} render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white h-12 rounded-xl"><SelectValue placeholder="Select grade" /></SelectTrigger>
                      <SelectContent>
                        {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </FormField>
                <FormField label="Semester">
                  <Controller name="semester" control={control} render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
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
                      placeholder="0.00" className="h-12 rounded-xl" />
                  )} />
                </FormField>
                <FormField label="Credits">
                  <Controller name="credits_earned" control={control} render={({ field }) => (
                    <Input type="number" min="0"
                      value={field.value ?? ""}
                      onChange={(e) => { const v = e.target.value; field.onChange(v === "" ? undefined : Number(v)); }}
                      placeholder="0" className="h-12 rounded-xl" />
                  )} />
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* ═══ SECTION 4 — STATUS & CARD ═══ */}
          <Card className="border border-[#E5E7EB] shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-[#E5E7EB] px-6 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base font-semibold text-gray-900">Status &amp; Card Validity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Status *">
                  <Controller name="status" control={control} render={({ field }) => (
                    <Select value={field.value ?? "active"} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white h-12 rounded-xl"><SelectValue /></SelectTrigger>
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
            </CardContent>
          </Card>

          {/* ═══ Bottom Actions ═══ */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-8">
            <Button type="button" variant="outline"
              onClick={() => router.push(adminHref(locale, "students"))} className="h-12 px-8 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2 rounded-xl">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {submitting ? "Creating..." : "Create Student"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
