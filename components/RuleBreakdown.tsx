import { EligibilityRule } from "@/lib/api";

interface RuleBreakdownProps {
  rules: EligibilityRule[];
  estimated_refund_usd: number | null;
  refund_basis_note: string;
}

export default function RuleBreakdown({
  rules,
  estimated_refund_usd,
  refund_basis_note,
}: RuleBreakdownProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-slate">
        Rule Breakdown
      </h3>

      <div
        className="border rounded-sm overflow-hidden"
        style={{ borderColor: "rgba(91,107,125,0.35)" }}
      >
        {rules.map((rule, index) => (
          <div
            key={rule.rule_id}
            className="flex gap-3 p-4"
            style={{
              borderTop:
                index > 0 ? "1px solid rgba(91,107,125,0.2)" : undefined,
            }}
          >
            <span
              className="font-mono text-base flex-shrink-0 mt-0.5 leading-none"
              style={{ color: rule.passed ? "#B8863B" : "#A6432F" }}
              aria-label={rule.passed ? "Pass" : "Fail"}
            >
              {rule.passed ? "✓" : "✗"}
            </span>

            <div className="min-w-0">
              <p className="font-mono text-xs font-medium text-manifest-paper mb-1">
                {rule.label}
              </p>
              <p className="font-mono text-xs text-ink-slate leading-relaxed">
                {rule.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {estimated_refund_usd !== null && (
        <div
          className="rounded-sm p-4 mt-2"
          style={{
            border: "1px solid rgba(184,134,59,0.45)",
            backgroundColor: "rgba(184,134,59,0.07)",
          }}
        >
          <p className="font-sans text-xs uppercase tracking-wider text-ink-slate mb-1">
            Estimated Refund
          </p>
          <p
            className="font-mono text-2xl font-medium"
            style={{ color: "#B8863B" }}
          >
            $
            {estimated_refund_usd.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="font-mono text-xs text-ink-slate mt-2 leading-relaxed">
            {refund_basis_note}
          </p>
        </div>
      )}
    </div>
  );
}
