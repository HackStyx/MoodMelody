"use client";

import React from "react";

interface EmotionalIntelligenceIconProps {
  className?: string;
  size?: number;
}

/**
 * Custom icon for AI Emotional Intelligence: heart + spark.
 * Represents emotional clarity and insight — unique, modern, no brain.
 */
export function EmotionalIntelligenceIcon({ className = "", size = 32 }: EmotionalIntelligenceIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Soft outer circle */}
      <circle cx="16" cy="16" r="14" fill="currentColor" fillOpacity="0.08" />
      {/* Abstract heart (two lobes + point) */}
      <path
        d="M16 25C16 25 6 18 6 12a5 5 0 0 1 10 0c0-2.5 1.5-5 4-6.5 2.5 1.5 4 4 4 6.5a5 5 0 0 1 10 0c0 6-10 13-10 13z"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Central diamond spark — insight */}
      <path
        d="M16 10 L20 16 L16 22 L12 16 Z"
        fill="currentColor"
      />
    </svg>
  );
}
