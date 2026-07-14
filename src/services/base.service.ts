import { createServerClient } from "@/lib/supabase";

export class BaseService {
  protected supabase = createServerClient();

  protected async dbGetAll<T>(
    table: string,
    options?: {
      orderBy?: string;
      ascending?: boolean;
      filters?: Record<string, unknown>;
    }
  ): Promise<T[]> {
    let query = this.supabase.from(table).select("*");

    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true });
    }

    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    const { data } = await query;
    return (data ?? []) as T[];
  }

  protected async dbGetById<T>(table: string, id: string): Promise<T | null> {
    const { data } = await this.supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data as T | null;
  }

  protected async dbInsert<T>(
    table: string,
    values: Record<string, unknown>
  ): Promise<{ data: T | null; error: string | null }> {
    const { data, error } = await this.supabase
      .from(table)
      .insert(values)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as T, error: null };
  }

  protected async dbUpdate<T>(
    table: string,
    id: string,
    values: Record<string, unknown>
  ): Promise<{ data: T | null; error: string | null }> {
    const { data, error } = await this.supabase
      .from(table)
      .update(values)
      .eq("id", id)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as T, error: null };
  }

  protected async dbRemove(table: string, id: string): Promise<string | null> {
    const { error } = await this.supabase.from(table).delete().eq("id", id);
    return error?.message ?? null;
  }
}
