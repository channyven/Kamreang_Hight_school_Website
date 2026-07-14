"use client";

import { Tree, TreeNode } from "react-organizational-chart";
import {
  ShieldCheck,
  GraduationCap,
  UserCog,
  Calculator,
  Users,
  Building2,
  UserCheck,
  Wrench,
  BookOpen,
} from "lucide-react";
import { cn } from "@/utils";
import type { OrgNodeData } from "@/types";

const getIcon = (name?: string) => {
  switch (name) {
    case "ShieldCheck": return ShieldCheck;
    case "GraduationCap": return GraduationCap;
    case "UserCog": return UserCog;
    case "Calculator": return Calculator;
    case "Users": return Users;
    case "Landmark":
    case "Building2": return Building2;
    case "UserCheck": return UserCheck;
    case "Wrench": return Wrench;
    case "BookOpen": return BookOpen;
    default: return Users;
  }
};

const NODE_STYLES: Record<OrgNodeData["tier"], { wrapper: string; icon: string }> = {
  root: {
    wrapper: "bg-school-blue-800 text-white border-transparent shadow-[0_4px_12px_rgba(30,58,138,0.25)]",
    icon: "bg-white/20 text-white",
  },
  vice: {
    wrapper: "bg-school-goldMain text-white border-transparent shadow-[0_4px_10px_rgba(253,188,19,0.2)]",
    icon: "bg-white/20 text-white",
  },
  head: {
    wrapper: "bg-school-goldMain text-white border-transparent shadow-[0_4px_10px_rgba(253,188,19,0.2)]",
    icon: "bg-white/20 text-white",
  },
  leaf: {
    wrapper: "bg-white text-school-navy border border-[#e6eeff] shadow-[0_2px_8px_rgba(30,78,140,0.05)]",
    icon: "bg-school-blue-50 text-school-blue-800",
  },
};

function NodeBadge({ data, km }: { data: OrgNodeData; km: boolean }) {
  const Icon = getIcon(data.icon);
  const styles = NODE_STYLES[data.tier] || NODE_STYLES.leaf;
  const isRoot = data.tier === "root";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        isRoot ? "px-6 py-3" : "px-4 py-2",
        styles.wrapper
      )}
    >
      <div className={cn(
        "flex items-center justify-center shrink-0",
        isRoot ? "w-6 h-6 rounded-lg" : "w-5 h-5 rounded-md",
        styles.icon
      )}>
        <Icon className={isRoot ? "w-4 h-4" : "w-3 h-3"} />
      </div>
      <div className="flex flex-col items-start min-w-0 text-left">
        <span className={cn(
          "font-bold leading-tight",
          isRoot ? "text-[13px]" : "text-[10px]",
          km && "font-khmer"
        )}>
          {km ? data.name_km : data.name_en}
        </span>
        {(data.description_km || data.description_en) && (
          <span className={cn("text-[9px] font-medium opacity-90 leading-tight mt-0.5", km && "font-khmer")}>
            {km ? data.description_km : data.description_en}
          </span>
        )}
      </div>
    </div>
  );
}

function OrgTreeNode({ node, km }: { node: OrgNodeData; km: boolean }) {
  const hasChildren = node.children && node.children.length > 0;
  const content = <NodeBadge data={node} km={km} />;

  if (!hasChildren) {
    return <TreeNode label={content} />;
  }

  return (
    <TreeNode label={content}>
      {node.children!.map((child) => (
        <OrgTreeNode key={child.id} node={child} km={km} />
      ))}
    </TreeNode>
  );
}

interface OrgChartProps {
  data: OrgNodeData;
  km: boolean;
}

export default function OrgChart({ data, km }: OrgChartProps) {
  if (!data) return null;

  return (
    <div className="w-full py-12 overflow-x-auto scrollbar-none">
      <div className="min-w-[1000px] flex justify-center px-4">
        <Tree
          lineWidth={"1.5px"}
          lineColor={"#cbd5e1"}
          lineHeight={"35px"}
          lineBorderRadius={"12px"}
          label={<NodeBadge data={data} km={km} />}
        >
          {data.children?.map((child) => (
            <OrgTreeNode key={child.id} node={child} km={km} />
          ))}
        </Tree>
      </div>
    </div>
  );
}
