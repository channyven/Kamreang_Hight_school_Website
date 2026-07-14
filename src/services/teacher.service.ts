import { BaseService } from "./base.service";
import type { TeacherInput } from "@/schemas/validations";
import type { Teacher } from "@/types";

export class TeacherService extends BaseService {
  async create(data: TeacherInput): Promise<string | null> {
    const { error } = await this.insert<Teacher>("teachers", data as unknown as Record<string, unknown>);
    return error;
  }

  async update(id: string, data: TeacherInput): Promise<string | null> {
    const updateData = { ...data, updated_at: new Date().toISOString() } as unknown as Record<string, unknown>;
    const { error } = await this.update<Teacher>("teachers", id, updateData);
    return error;
  }

  async remove(id: string): Promise<string | null> {
    return this.remove("teachers", id);
  }
}
