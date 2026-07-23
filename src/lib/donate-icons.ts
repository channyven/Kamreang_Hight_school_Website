import {
  BookOpen,
  Library,
  Laptop,
  Monitor,
  FlaskConical,
  Microscope,
  GraduationCap,
  Trophy,
  Award,
  School,
  Building2,
  Hammer,
  Palette,
  Bus,
  HeartPulse,
  Utensils,
  Sprout,
  Users,
  Wifi,
  Heart,
  type LucideIcon,
} from "lucide-react";

export const DONATE_ICONS = {
  BookOpen,
  Library,
  Laptop,
  Monitor,
  FlaskConical,
  Microscope,
  GraduationCap,
  Trophy,
  Award,
  School,
  Building2,
  Hammer,
  Palette,
  Bus,
  HeartPulse,
  Utensils,
  Sprout,
  Users,
  Wifi,
  Heart,
} satisfies Record<string, LucideIcon>;

export type DonateIconName = keyof typeof DONATE_ICONS;

export const DONATE_ICON_NAMES = Object.keys(DONATE_ICONS) as DonateIconName[];

export function getDonateIcon(name: string): LucideIcon {
  return DONATE_ICONS[name as DonateIconName] ?? Heart;
}
