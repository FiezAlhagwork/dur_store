"use client"

import { revealVariants } from "@/constants/motion";
import { RevealProps } from "@/types";
import { motion } from "motion/react";

export default function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.5,
  once = true,
  margin = "-80px",
  whileHover,
}: RevealProps) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      whileHover={whileHover}
      viewport={{ once, margin }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
