"use client";

import { motion } from "framer-motion";
import { cn, getScoreTier } from "@/lib/utils";

interface FandomScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showTier?: boolean;
  showBenefits?: boolean;
  animated?: boolean;
}

export function FandomScore({
  score,
  size = "md",
  showTier = true,
  showBenefits = false,
  animated = true,
}: FandomScoreProps) {
  const tier = getScoreTier(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const sizeClasses = {
    sm: { container: "w-20 h-20", text: "text-xl", tierText: "text-xs" },
    md: { container: "w-32 h-32", text: "text-3xl", tierText: "text-sm" },
    lg: { container: "w-44 h-44", text: "text-4xl", tierText: "text-base" },
  };

  return (
    <div className="flex flex-col items-center">
      <div className={cn("relative", sizeClasses[size].container)}>
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--secondary)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn("font-bold", sizeClasses[size].text)}
            initial={animated ? { opacity: 0, scale: 0.5 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {score}
          </motion.span>
          {showTier && (
            <motion.span
              className={cn("font-medium", tier.color, sizeClasses[size].tierText)}
              initial={animated ? { opacity: 0 } : {}}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              {tier.tier}
            </motion.span>
          )}
        </div>
      </div>

      {showBenefits && (
        <motion.div
          className="mt-4 space-y-2"
          initial={animated ? { opacity: 0, y: 10 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          <p className="text-sm font-medium text-center">Your Benefits:</p>
          <ul className="space-y-1">
            {tier.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {benefit}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
