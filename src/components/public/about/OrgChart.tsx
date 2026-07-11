"use client";

import { Tree, TreeNode } from "react-organizational-chart";
import {
  ShieldCheck,
  GraduationCap,
  UserCog,
  Calculator,
  Users,
  Landmark,
  UserCheck,
  Wrench,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrgNodeData } from "@/types";

const getIcon = (name?: string) => {
  switch (name) {
    case "ShieldCheck": return ShieldCheck;
    case "GraduationCap": return GraduationCap;
    case "UserCog": return UserCog;
    case "Calculator": return Calculator;
    case "Users": return Users;
    case "Landmark": return Landmark;
    case "UserCheck": return UserCheck;
    case "Wrench": return Wrench;
    case "BookOpen": return BookOpen;
    default: return Users;
  }
};

const TIER_STYLES: Record<OrgNodeData["tier"], { box: string; icon: string; text: string; sub: string }> = {
  root: {
    box: "bg-[#1e3a8a] text-white border-transparent shadow-lg py-3",
    icon: "bg-white/20 text-white",
    text: "text-sm",
    sub: "text-white/80",
  },
  vice: {
    box: "bg-[#f59e0b] text-white border-transparent shadow-md py-2.5",
    icon: "bg-white/20 text-white",
    text: "text-[13px]",
    sub: "text-white/90",
  },
  head: {
    box: "bg-[#f59e0b] text-white border-transparent shadow-md py-2.5",
    icon: "bg-white/20 text-white",
    text: "text-[13px]",
    sub: "text-white/90",
  },
  leaf: {
    box: "bg-white text-[#0d1c2f] border border-[#e6eeff] shadow-sm py-2",
    icon: "bg-[#eff4ff] text-[#1e3a8a]",
    text: "text-[12px]",
    sub: "text-gray-400",
  },
};

function OrgNode({ data, km }: { data: OrgNodeData; km: boolean }) {
  const Icon = getIcon(data.icon);
  const styles = TIER_STYLES[data.tier];
  
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-xl px-4 min-w-[190px] max-w-[240px] transition-transform duration-200 hover:-translate-y-0.5 text-left",
        styles.box
      )}
    >
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", styles.icon)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className={cn("font-bold leading-tight truncate", styles.text, km && "font-khmer")}>
          {km ? data.name_km : data.name_en}
        </span>
        {(data.description_km || data.description_en) && (
          <span className={cn("text-[10px] font-medium mt-0.5", styles.sub, km && "font-khmer")}>
            {km ? data.description_km : data.description_en}
          </span>
        )}
      </div>
    </div>
  );
}

function renderNodes(nodes: OrgNodeData[], km: boolean) {
  return nodes.map((node) => (
    <TreeNode 
      key={node.id} 
      label={<OrgNode data={node} km={km} />}
    >
      {node.children ? renderNodes(node.children, km) : null}
    </TreeNode>
  ));
}

interface OrgChartProps {
  data: OrgNodeData;
  km: boolean;
}

export default function OrgChart({ data, km }: OrgChartProps) {
  return (
    <div className="overflow-x-auto py-8 scrollbar-none">
      <div className="w-fit mx-auto min-w-full md:min-w-0 flex justify-center">
        <Tree
          label={<OrgNode data={data} km={km} />}
          lineWidth="2px"
          lineColor="#c3d0e8"
          lineBorderRadius="12px"
          nodePadding="12px"
        >
          {data.children ? renderNodes(data.children, km) : null}
        </Tree>
      </div>
    </div>
  );
}
