import { BaseService } from "./base.service";
import type { StudentInput } from "@/schemas/validations";
import type { Student } from "@/types";

export class StudentService extends BaseService {
  async generateNextStudentId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `STU-${year}-`;
    // Find the highest existing sequence number for this year
    const { data } = await this.supabase
      .from("students")
      .select("student_id")
      .like("student_id", `${prefix}%`)
      .order("student_id", { ascending: false })
      .limit(1);

    let nextNum = 1;
    if (data && data.length > 0) {
      const lastId = data[0].student_id as string;
      const lastNum = parseInt(lastId.replace(prefix, ""), 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }

    return `${prefix}${String(nextNum).padStart(4, "0")}`;
  }

  async create(data: StudentInput): Promise<{ id?: string; error: string | null }> {
    const insertData: Record<string, unknown> = {
      student_id: data.student_id,
      qr_token: data.qr_token || null,
      qr_code: data.qr_code || null,
      photo: data.photo || null,
      khmer_first_name: data.khmer_first_name || null,
      khmer_last_name: data.khmer_last_name || null,
      english_first_name: data.english_first_name,
      english_last_name: data.english_last_name,
      gender: data.gender || null,
      date_of_birth: data.date_of_birth || null,
      place_of_birth: data.place_of_birth || null,
      nationality: data.nationality ?? "Khmer",
      phone_number: data.phoneNumber || null,
      email: data.email || null,
      street_address: data.streetAddress || null,
      province: data.province || null,
      district: data.district || null,
      commune: data.commune || null,
      village: data.village || null,
      faculty: data.faculty || null,
      major: data.major || null,
      academic_year: data.academic_year || null,
      class_name: data.class_name || null,
      study_year: data.study_year || null,
      semester: data.semester || null,
      gpa: data.gpa ?? null,
      credits_earned: data.credits_earned ?? null,
      status: data.status ?? "active",
      card_issue_date: data.card_issue_date || null,
      card_expiry_date: data.card_expiry_date || null,
    };
    const { data: inserted, error } = await this.supabase
      .from("students")
      .insert(insertData)
      .select("id")
      .single();

    return { id: (inserted as { id?: string } | null)?.id, error: error?.message ?? null };
  }

  async updateQrCode(id: string, qrDataUrl: string): Promise<string | null> {
    const { error } = await this.supabase
      .from("students")
      .update({ qr_code: qrDataUrl })
      .eq("id", id);
    return error?.message ?? null;
  }

  async update(id: string, data: StudentInput): Promise<string | null> {
    const updateData: Record<string, unknown> = {
      student_id: data.student_id,
      qr_code: data.qr_code || null,
      photo: data.photo || null,
      khmer_first_name: data.khmer_first_name || null,
      khmer_last_name: data.khmer_last_name || null,
      english_first_name: data.english_first_name,
      english_last_name: data.english_last_name,
      gender: data.gender || null,
      date_of_birth: data.date_of_birth || null,
      place_of_birth: data.place_of_birth || null,
      nationality: data.nationality ?? "Khmer",
      phone_number: data.phoneNumber || null,
      email: data.email || null,
      street_address: data.streetAddress || null,
      province: data.province || null,
      district: data.district || null,
      commune: data.commune || null,
      village: data.village || null,
      faculty: data.faculty || null,
      major: data.major || null,
      academic_year: data.academic_year || null,
      class_name: data.class_name || null,
      study_year: data.study_year || null,
      semester: data.semester || null,
      gpa: data.gpa ?? null,
      credits_earned: data.credits_earned ?? null,
      status: data.status ?? "active",
      card_issue_date: data.card_issue_date || null,
      card_expiry_date: data.card_expiry_date || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await this.dbUpdate<Student>("students", id, updateData);
    return error;
  }

  async remove(id: string): Promise<string | null> {
    return this.dbRemove("students", id);
  }

  async getAll(options?: {
    status?: string;
    faculty?: string;
    search?: string;
  }): Promise<Student[]> {
    let query = this.supabase
      .from("students")
      .select("*")
      .order("english_last_name", { ascending: true });

    if (options?.status) {
      query = query.eq("status", options.status);
    }
    if (options?.faculty) {
      query = query.eq("faculty", options.faculty);
    }

    const { data } = await query;
    const students = (data ?? []) as Student[];

    if (options?.search) {
      const q = options.search.toLowerCase();
      return students.filter(
        (s) =>
          s.student_id?.toLowerCase().includes(q) ||
          s.english_first_name?.toLowerCase().includes(q) ||
          s.english_last_name?.toLowerCase().includes(q) ||
          s.khmer_first_name?.toLowerCase().includes(q) ||
          s.khmer_last_name?.toLowerCase().includes(q)
      );
    }

    return students;
  }

  async getById(id: string): Promise<Student | null> {
    return this.dbGetById<Student>("students", id);
  }
}
