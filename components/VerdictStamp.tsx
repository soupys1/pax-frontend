"use client";

import { useEffect, useState } from "react";

interface VerdictStampProps {
  verdict: "eligible" | "not_eligible" | "needs_review";
}

const LABELS = {
  eligible: "ELIGIBLE",
  not_eligible: "NOT ELIGIBLE",
  needs_review: "NEEDS REVIEW",
};

const COLORS = {
  eligible: { bg: "#B8863B", text: "#12213A", ring: "#B8863B" },
  not_eligible: { bg: "#A6432F", text: "#E8E4D8", ring: "#A6432F" },
  needs_review: { bg: "#4C7A6E", text: "#E8E4D8", ring: "#4C7A6E" },
};

export default function VerdictStamp({ verdict }: VerdictStampProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay so the element is in the DOM before the animation fires
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const { bg, text, ring } = COLORS[verdict];

  return (
    <div className="flex justify-center my-8">
      <div
        className={visible ? "stamp-animate" : "opacity-0"}
        style={{ display: "inline-block", position: "relative" }}
      >
        {/* Outer ink ring — faint double-border to suggest a real stamp edge */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "-5px",
            border: `1px solid ${ring}`,
            borderRadius: "4px",
            opacity: 0.35,
          }}
        />

        {/* Stamp body */}
        <div
          style={{
            backgroundColor: bg,
            border: `3px solid ${ring}`,
            padding: "14px 36px",
            borderRadius: "3px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle grain texture (CSS-only radial pattern) */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "5px 5px",
              backgroundPosition: "0 0",
              pointerEvents: "none",
            }}
          />

          <span
            className="font-display font-black tracking-widest relative z-10"
            style={{
              color: text,
              fontSize: "1.375rem",
              letterSpacing: "0.18em",
            }}
          >
            {LABELS[verdict]}
          </span>
        </div>
      </div>
    </div>
  );
}
