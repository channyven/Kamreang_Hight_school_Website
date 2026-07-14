import { BaseService } from "./base.service";
import type { AuditAction } from "@/types";

export class AuditService extends BaseService {
  async log(params: {
    userId?: string;
    userEmail?: string;
    action: AuditAction;
    tableName: string;
    recordId?: string;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
  }): Promise<void> {
    if (!params.userId) return;
    await this.supabase.from("admin_audit_logs").insert({
      user_id: params.userId,
      user_email: params.userEmail,
      action: params.action,
      table_name: params.tableName,
      record_id: params.recordId,
      old_data: params.oldData,
      new_data: params.newData,
    });
  }
}
