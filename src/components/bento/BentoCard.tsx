"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  glowColor?: "blue" | "gold" | "none";
  spotlight?: boolean;
}

export function BentoCard({
  children,
  className,
  glowColor = "none",
  spotlight = true,
  ...props
}: BentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!spotlight || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const glowBorderClass =
    glowColor === "gold"
      ? "hover:border-[rgba(212,175,55,0.4)]"
      : glowColor === "blue"
      ? "hover:border-[rgba(0,113,227,0.45)]"
      : "hover:border-white/[0.18]";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2, scale: 1.003 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white/[0.03] backdrop-blur-2xl",
        "border border-white/[0.08]",
        "shadow-[0_4px_24px_-2px_rgba(0,0,0,0.6)]",
        "transition-colors duration-300",
        glowBorderClass,
        className
      )}
      {...props}
    >
      {/* Luz reactiva al cursor (Spotlight Effect) */}
      {spotlight && isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-100"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${
              glowColor === "gold"
                ? "rgba(212, 175, 55, 0.08)"
                : glowColor === "blue"
                ? "rgba(0, 113, 227, 0.1)"
                : "rgba(255, 255, 255, 0.05)"
            }, transparent 80%)`,
          }}
        />
      )}

      {/* Bisel superior de luz fina */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {children}
    </motion.div>
  );
}
