import { BaseService } from "./base.service";
import type { NewsInput } from "@/schemas/validations";
import type { News } from "@/types";

function sanitizeInput(data: NewsInput): Record<string, unknown> {
  const record = { ...data } as Record<string, unknown>;
  for (const key of ["category_id", "featured_image", "publish_date"] as const) {
    if (record[key] === "") record[key] = null;
  }
  if (!Array.isArray(record.gallery_images)) {
    record.gallery_images = [];
  }
  if (data.status === "published" && (!data.publish_date || data.publish_date === "")) {
    record.publish_date = new Date().toISOString();
  }
  return record;
}

export class NewsService extends BaseService {
  async create(data: NewsInput, userId?: string): Promise<string | null> {
    const insertData = {
      ...sanitizeInput(data),
      created_by: userId ?? null,
      updated_by: userId ?? null,
    };
    const { error } = await this.insert<News>("news", insertData);
    return error;
  }

  async update(id: string, data: NewsInput, userId?: string): Promise<string | null> {
    const updateData = {
      ...sanitizeInput(data),
      updated_at: new Date().toISOString(),
      updated_by: userId ?? null,
    };
    const { error } = await this.update<News>("news", id, updateData);
    return error;
  }

  async remove(id: string): Promise<string | null> {
    return this.remove("news", id);
  }
}
