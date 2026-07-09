"use client";

import { Tree, TreeNode } from "react-organizational-chart";
import {
  ShieldCheck,
  Users,
  UserCog,
  GraduationCap,
  Landmark,
  Wrench,
  BookOpen,
  UserCheck,
  Calculator,
  ClipboardList,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tier = "root" | "lead" | "head" | "member";

interface OrgNodeData {
  km: string;
  en: string;
  icon: LucideIcon;
  tier: Tier;
  children?: OrgNodeData[];
}

const TIER_STYLES: Record<Tier, { box: string; iconWrap: string; icon: string }> = {
  root: {
    box: "bg-school-blue-800 text-white border-transparent shadow-lg",
    iconWrap: "bg-white/15",
    icon: "text-school-gold-400",
  },
  lead: {
    box: "bg-white text-school-blue-800 border-2 border-school-blue-800 border-dashed shadow-sm",
    iconWrap: "bg-school-blue-50",
    icon: "text-school-blue-800",
  },
  head: {
    box: "bg-school-gold-500 text-white border-transparent shadow-md",
    iconWrap: "bg-white/20",
    icon: "text-white",
  },
  member: {
    box: "bg-white text-[#0d1c2f] border border-[#e6eeff] shadow-sm",
    iconWrap: "bg-[#eff4ff]",
    icon: "text-school-blue-800",
  },
};

function OrgNode({ data, km }: { data: OrgNodeData; km: boolean }) {
  const Icon = data.icon;
  const style = TIER_STYLES[data.tier];
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2.5 w-[168px] transition-transform duration-200 hover:-translate-y-0.5",
        style.box
      )}
    >
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", style.iconWrap)}>
        <Icon className={cn("w-3.5 h-3.5", style.icon)} />
      </div>
      <span className={cn("text-xs font-semibold text-left leading-snug", km && "font-khmer")}>
        {km ? data.km : data.en}
      </span>
    </div>
  );
}

const CHART: OrgNodeData = {
  km: "នាយក",
  en: "Director",
  icon: ShieldCheck,
  tier: "root",
  children: [
    {
      km: "គណៈកម្មការប្រឹក្សា",
      en: "Advisor Committee",
      icon: Users,
      tier: "lead",
    },
    {
      km: "អនុនាយក",
      en: "Deputy Director",
      icon: UserCog,
      tier: "head",
      children: [
        {
          km: "ប្រធានក្រុមអប់រំ",
          en: "Head of Education Team",
          icon: GraduationCap,
          tier: "head",
          children: [
            { km: "ក្រុមសាស្ត្រាចារ្យ", en: "Lectures Team", icon: BookOpen, tier: "member" },
            { km: "សម្របសម្រួលសិស្ស", en: "Student Coordinator", icon: UserCheck, tier: "member" },
          ],
        },
        {
          km: "ប្រធានការិយាល័យ និងគណនេយ្យ",
          en: "Head of Office & Accounting",
          icon: Landmark,
          tier: "head",
          children: [
            { km: "គណនេយ្យ", en: "Accounting", icon: Calculator, tier: "member" },
            { km: "បុគ្គលិកប្រតិបត្តិការ", en: "Operational Staff", icon: ClipboardList, tier: "member" },
            { km: "អ្នកគ្រប់គ្រងជាន់ខ្ពស់", en: "Senior Manager", icon: Briefcase, tier: "member" },
          ],
        },
        {
          km: "ជាងបច្ចេកទេស",
          en: "Technicians",
          icon: Wrench,
          tier: "head",
        },
      ],
    },
  ],
};

function renderNodes(nodes: OrgNodeData[], km: boolean) {
  return nodes.map((node) => (
    <TreeNode key={node.en} label={<OrgNode data={node} km={km} />}>
      {node.children ? renderNodes(node.children, km) : null}
    </TreeNode>
  ));
}

export default function OrgChart({ km }: { km: boolean }) {
  return (
    <div className="overflow-x-auto py-4">
      <div className="w-fit mx-auto">
        <Tree
          label={<OrgNode data={CHART} km={km} />}
          lineWidth="2px"
          lineColor="#c3d0e8"
          lineBorderRadius="8px"
          nodePadding="6px"
        >
          {renderNodes(CHART.children ?? [], km)}
        </Tree>
      </div>
    </div>
  );
}
