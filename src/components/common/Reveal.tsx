import { motion } from "framer-motion";
import type { ReactNode } from "react";

const elements = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
  aside: motion.aside,
  figure: motion.figure,
} as const;

/** Fades + lifts content in the first time it scrolls into view. */
export default function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  y = 20,
}: {
  as?: keyof typeof elements;
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const Element = elements[as] as typeof motion.div;
  return (
    <Element
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Element>
  );
}
