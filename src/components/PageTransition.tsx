"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const variants: Variants = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.12 } },
        exit: { opacity: 0, transition: { duration: 0.10 } },
      }
    : {
        initial: {
          opacity: 0,
          scale: 0.985,
          y: 8,
          filter: "blur(10px)",
        },
        animate: {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration: 0.22,
            ease: "easeOut",
          },
        },
        exit: {
          opacity: 0,
          scale: 0.995,
          y: -6,
          filter: "blur(6px)",
          transition: {
            duration: 0.16,
            ease: "easeOut",
          },
        },
      };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="pt-page min-h-full"
        style={{ willChange: "transform, opacity, filter" }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
