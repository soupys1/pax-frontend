"use client";

interface ProgressRailProps {
  step: number; // 0=empty 1=import 2=window 3=export 4=verdict
}

const STOPS = [
  { id: 1, label: "Import" },
  { id: 2, label: "Hold Window" },
  { id: 3, label: "Export" },
  { id: 4, label: "Verdict" },
];

export default function ProgressRail({ step }: ProgressRailProps) {
  return (
    <nav aria-label="Progress" className="flex flex-col">
      {STOPS.map((stop, index) => {
        const filled = step >= stop.id;
        const connectorFilled = step > stop.id;
        const isLast = index === STOPS.length - 1;

        return (
          <div key={stop.id} className="flex flex-row items-stretch gap-3">
            {/* Track column */}
            <div className="flex flex-col items-center w-3">
              <div
                className="w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1 transition-colors duration-300"
                style={{
                  backgroundColor: filled ? "#B8863B" : "transparent",
                  borderColor: filled ? "#B8863B" : "#5B6B7D",
                }}
              />
              {!isLast && (
                <div
                  className="w-0.5 flex-1 min-h-[2.5rem] transition-colors duration-300"
                  style={{
                    backgroundColor: connectorFilled
                      ? "#B8863B"
                      : "rgba(91,107,125,0.3)",
                  }}
                />
              )}
            </div>

            {/* Label column */}
            <div className={`pb-10 ${isLast ? "pb-0" : ""}`}>
              <span
                className="font-mono text-xs leading-none transition-colors duration-300"
                style={{ color: filled ? "#B8863B" : "#5B6B7D" }}
              >
                {stop.label}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
