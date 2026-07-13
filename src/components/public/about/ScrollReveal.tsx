"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

type AnimationVariant = "fade-up" | "fade-left" | "fade-right" | "fade-in" | "scale-in";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  margin?: string;
}

const variantConfig: Record<
  AnimationVariant,
  { hidden: Record<string, number>; visible: Record<string, number> }
> = {
  "fade-up": {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-in": {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "scale-in": {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
};

export default function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.6,
  className,
  once = true,
  margin = "-60px",
}: ScrollRevealProps) {
  const v = variantConfig[variant];

  return (
    <motion.div
      className={className}
      initial={v.hidden}
      whileInView={v.visible}
      viewport={{ once, margin }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
