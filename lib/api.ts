const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ClaimInput {
  hts_code_import: string;
  hts_code_export: string;
  import_date: string;
  export_date: string;
  duty_paid_usd: number;
  was_used_in_us: boolean;
  quantity_imported: number;
  quantity_exported: number;
}

export interface EligibilityRule {
  rule_id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface ClaimResult {
  verdict: "eligible" | "not_eligible" | "needs_review";
  rules: EligibilityRule[];
  estimated_refund_usd: number | null;
  refund_basis_note: string;
}

export type ApiError =
  | { type: "network"; message: string }
  | { type: "validation"; message: string; details?: unknown }
  | { type: "server"; message: string; status: number };

export async function checkEligibility(
  input: ClaimInput
): Promise<ClaimResult> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/api/check-eligibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw {
      type: "network",
      message:
        "Could not reach the eligibility service. Check your connection and try again.",
    } satisfies ApiError;
  }

  if (response.status === 422) {
    const body = await response.json().catch(() => ({}));
    throw {
      type: "validation",
      message: "One or more input values are invalid. Please check the form.",
      details: body,
    } satisfies ApiError;
  }

  if (!response.ok) {
    throw {
      type: "server",
      message: `The eligibility service returned an error (HTTP ${response.status}). Try again in a moment.`,
      status: response.status,
    } satisfies ApiError;
  }

  return response.json() as Promise<ClaimResult>;
}
