"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Plus, Search, Edit, Trash2, Loader2, Landmark, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { BankAccount, DonationPurpose, DonationQr } from "@/types";
import { getLocalizedText, cn } from "@/utils";
import { getDonateIcon } from "@/lib/donate-icons";
import { toast } from "sonner";
import {
  deleteBankAccount,
  getAllBankAccounts,
  deleteDonationPurpose,
  getAllDonationPurposes,
  deleteDonationQr,
  getAllDonationQrCodes,
} from "@/actions/donate";

type DonateTab = "bank-accounts" | "why-donate" | "qr-code";

const TABS: { value: DonateTab; label_km: string; label_en: string }[] = [
  { value: "bank-accounts", label_km: "គណនីធនាគារ", label_en: "Bank Accounts" },
  { value: "why-donate", label_km: "ហេតុអ្វីបរិច្ចាគ", label_en: "Why Donate" },
  { value: "qr-code", label_km: "កូដ QR", label_en: "QR Code" },
];

export default function AdminDonatePage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: DonateTab =
    tabParam === "why-donate" || tabParam === "qr-code" ? tabParam : "bank-accounts";
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [purposes, setPurposes] = useState<DonationPurpose[]>([]);
  const [qrCodes, setQrCodes] = useState<DonationQr[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<DonateTab>(initialTab);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [accountData, purposeData, qrData] = await Promise.all([
      getAllBankAccounts(),
      getAllDonationPurposes(),
      getAllDonationQrCodes(),
    ]);
    setAccounts(accountData);
    setPurposes(purposeData);
    setQrCodes(qrData);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const visibleAccounts = useMemo(() => {
    let list = accounts;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.bank_name_en?.toLowerCase().includes(q) ||
          a.bank_name_km?.toLowerCase().includes(q) ||
          a.account_number?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [accounts, search]);

  const visiblePurposes = useMemo(() => {
    let list = purposes;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.title_en?.toLowerCase().includes(q) || p.title_km?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [purposes, search]);

  const handleDeleteAccount = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const result = await deleteBankAccount(id);
    if (result.success) { toast.success(locale === "km" ? "គណនីធនាគារត្រូវបានលុប" : "Bank account deleted"); fetchData(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  const handleDeletePurpose = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const result = await deleteDonationPurpose(id);
    if (result.success) { toast.success(locale === "km" ? "កាតត្រូវបានលុប" : "Card deleted"); fetchData(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  const handleDeleteQr = async (id: string, label: string) => {
    if (!confirm(`Delete "${label || "QR code"}"?`)) return;
    const result = await deleteDonationQr(id);
    if (result.success) { toast.success(locale === "km" ? "កូដ QR ត្រូវបានលុប" : "QR code deleted"); fetchData(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  const visibleQrCodes = useMemo(() => {
    let list = qrCodes;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.label_en?.toLowerCase().includes(q) || c.label_km?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [qrCodes, search]);

  const isBankTab = tab === "bank-accounts";
  const isQrTab = tab === "qr-code";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === "km" ? "គ្រប់គ្រងទំព័របរិច្ចាគ" : "Donate Page Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {locale === "km" ? "កែសម្រួលព័ត៌មានលើទំព័របរិច្ចាគសាធារណៈ" : "Edit the information shown on the public Donate page"}
          </p>
        </div>
        <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900">
          <Link href={`/${locale}/admin/donate/${isBankTab ? "bank" : isQrTab ? "qr" : "purpose"}/new`}>
            <Plus className="w-4 h-4 mr-2" />
            {isBankTab
              ? (locale === "km" ? "បន្ថែមគណនីធនាគារ" : "Add Bank Account")
              : isQrTab
                ? (locale === "km" ? "បន្ថែមកូដ QR" : "Add QR Code")
                : (locale === "km" ? "បន្ថែមកាត" : "Add Card")}
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.value
                ? "border-school-blue-800 text-school-blue-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {locale === "km" ? t.label_km : t.label_en}
          </button>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input placeholder={locale === "km" ? "ស្វែងរក..." : "Search..."} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>
        ) : isQrTab ? (
          visibleQrCodes.length === 0 ? (
            <div className="text-center py-20 text-gray-400">{locale === "km" ? "រកមិនឃើញកូដ QR" : "No QR codes found"}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-20">QR Code</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Label</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleQrCodes.map((qr, i) => {
                    const label = getLocalizedText(qr.label_km, qr.label_en, locale);
                    return (
                      <tr key={qr.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 rounded-lg border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={qr.image_url} alt={label || "QR code"} className="w-full h-full object-contain" />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {label ? (
                            <p className={`font-medium text-gray-900 max-w-md truncate ${locale === "km" ? "font-khmer" : ""}`}>{label}</p>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs">
                              <QrCode className="w-3.5 h-3.5" />
                              {locale === "km" ? "គ្មានស្លាក" : "No label"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={qr.is_active ? "success" : "danger"} className="text-xs">
                            {qr.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                              <Link href={`/${locale}/admin/donate/qr/${qr.id}`}><Edit className="w-4 h-4 text-blue-500" /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteQr(qr.id, label ?? "")}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : isBankTab ? (
          visibleAccounts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">{locale === "km" ? "រកមិនឃើញគណនីធនាគារ" : "No bank accounts found"}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Bank Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Account Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Account Number</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleAccounts.map((acc, i) => {
                    const bankName = getLocalizedText(acc.bank_name_km, acc.bank_name_en, locale);
                    const accountName = getLocalizedText(acc.account_name_km, acc.account_name_en, locale);
                    return (
                      <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {acc.logo_url ? (
                              <div className="w-8 h-8 rounded-lg border border-gray-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={acc.logo_url} alt={bankName ?? "Bank logo"} className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                                style={{ background: acc.logo_color || "#00376f" }}
                              >
                                <Landmark className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className={`font-medium text-gray-900 truncate max-w-[180px] ${locale === "km" ? "font-khmer" : ""}`}>{bankName}</p>
                              <p className="text-[11px] text-gray-400">{acc.currency}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className={`text-gray-700 truncate max-w-[200px] ${locale === "km" ? "font-khmer" : ""}`}>{accountName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-semibold text-school-blue-800">{acc.account_number}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={acc.is_active ? "success" : "danger"} className="text-xs">
                            {acc.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                              <Link href={`/${locale}/admin/donate/bank/${acc.id}`}><Edit className="w-4 h-4 text-blue-500" /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteAccount(acc.id, bankName ?? "")}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : visiblePurposes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">{locale === "km" ? "រកមិនឃើញកាត" : "No cards found"}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-16">Icon</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visiblePurposes.map((p, i) => {
                  const title = getLocalizedText(p.title_km, p.title_en, locale);
                  const Icon = getDonateIcon(p.icon);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-school-blue-800" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`font-medium text-gray-900 max-w-md truncate ${locale === "km" ? "font-khmer" : ""}`}>{title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.is_active ? "success" : "danger"} className="text-xs">
                          {p.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/${locale}/admin/donate/purpose/${p.id}`}><Edit className="w-4 h-4 text-blue-500" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeletePurpose(p.id, title ?? "")}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
