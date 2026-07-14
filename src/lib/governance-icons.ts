import {
  ClipboardCheck,
  NotebookPen,
  Users2,
  FileSignature,
  Vote,
  LineChart,
  CalendarDays,
  Smartphone,
  Handshake,
  MessageCircleQuestion,
  FlaskConical,
  Presentation,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Megaphone,
  Landmark,
  Target,
  Lightbulb,
  Award,
  type LucideIcon,
} from "lucide-react";

export const GOVERNANCE_ICONS = {
  ClipboardCheck,
  NotebookPen,
  Users2,
  FileSignature,
  Vote,
  LineChart,
  CalendarDays,
  Smartphone,
  Handshake,
  MessageCircleQuestion,
  FlaskConical,
  Presentation,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Megaphone,
  Landmark,
  Target,
  Lightbulb,
  Award,
} satisfies Record<string, LucideIcon>;

export type GovernanceIconName = keyof typeof GOVERNANCE_ICONS;

export const GOVERNANCE_ICON_NAMES = Object.keys(GOVERNANCE_ICONS) as GovernanceIconName[];

export function getGovernanceIcon(name: string): LucideIcon {
  return GOVERNANCE_ICONS[name as GovernanceIconName] ?? ClipboardCheck;
}
