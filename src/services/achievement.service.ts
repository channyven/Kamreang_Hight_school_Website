import { BaseService } from "./base.service";
import type { AchievementInput } from "@/schemas/validations";
import type { Achievement } from "@/types";

export class AchievementService extends BaseService {
  async create(data: AchievementInput): Promise<string | null> {
    const { error } = await this.insert<Achievement>("achievements", data as unknown as Record<string, unknown>);
    return error;
  }

  async update(id: string, data: AchievementInput): Promise<string | null> {
    const updateData = { ...data, updated_at: new Date().toISOString() } as unknown as Record<string, unknown>;
    const { error } = await this.update<Achievement>("achievements", id, updateData);
    return error;
  }

  async remove(id: string): Promise<string | null> {
    return this.remove("achievements", id);
  }
}
