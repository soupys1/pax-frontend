"use client";

import { useState } from "react";
import { checkEligibility, ClaimInput, ClaimResult, ApiError } from "@/lib/api";
import VerdictStamp from "./VerdictStamp";
import RuleBreakdown from "./RuleBreakdown";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormFields {
  hts_code_import: string;
  hts_code_export: string;
  import_date: string;
  export_date: string;
  duty_paid_usd: string;
  was_used_in_us: boolean;
  quantity_imported: string;
  quantity_exported: string;
}

type FieldErrors = Partial<Record<keyof FormFields, string>>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMPTY: FormFields = {
  hts_code_import: "",
  hts_code_export: "",
  import_date: "",
  export_date: "",
  duty_paid_usd: "",
  was_used_in_us: false,
  quantity_imported: "",
  quantity_exported: "",
};

// Realistic example: laptop components, 3-year window, eligible scenario
const EXAMPLE: FormFields = {
  hts_code_import: "8471.30.0100",
  hts_code_export: "8471.30.0100",
  import_date: "2022-06-15",
  export_date: "2025-03-20",
  duty_paid_usd: "12500",
  was_used_in_us: false,
  quantity_imported: "100",
  quantity_exported: "80",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeStep(f: FormFields): number {
  const hasImport =
    f.hts_code_import && f.import_date && f.duty_paid_usd && f.quantity_imported;
  const hasBothDates = f.import_date && f.export_date;
  const hasExport = f.hts_code_export && f.export_date && f.quantity_exported;

  if (hasImport && hasExport) return 3;
  if (hasBothDates) return 2;
  if (hasImport) return 1;
  return 0;
}

function validate(f: FormFields): FieldErrors {
  const errs: FieldErrors = {};

  if (!f.hts_code_import.trim()) errs.hts_code_import = "Required";
  if (!f.hts_code_export.trim()) errs.hts_code_export = "Required";
  if (!f.import_date) errs.import_date = "Required";
  if (!f.export_date) errs.export_date = "Required";

  const duty = parseFloat(f.duty_paid_usd);
  if (!f.duty_paid_usd || isNaN(duty) || duty <= 0)
    errs.duty_paid_usd = "Enter a valid amount greater than zero";

  const qImp = parseFloat(f.quantity_imported);
  if (!f.quantity_imported || isNaN(qImp) || qImp <= 0)
    errs.quantity_imported = "Enter a valid quantity greater than zero";

  const qExp = parseFloat(f.quantity_exported);
  if (!f.quantity_exported || isNaN(qExp) || qExp <= 0)
    errs.quantity_exported = "Enter a valid quantity greater than zero";

  return errs;
}

// ---------------------------------------------------------------------------
// Shared input class builders
// ---------------------------------------------------------------------------

const BASE_INPUT =
  "w-full font-mono text-sm bg-ledger-navy border rounded-sm px-3 py-2 text-manifest-paper placeholder-ink-slate focus:outline-none focus:ring-1 transition-colors";
const INPUT_NORMAL = "border-ink-slate/40 focus:border-brass-stamp focus:ring-brass-stamp";
const INPUT_ERROR = "border-alert-rust focus:border-alert-rust focus:ring-alert-rust";

function inputCls(hasError: boolean) {
  return `${BASE_INPUT} ${hasError ? INPUT_ERROR : INPUT_NORMAL}`;
}

// ---------------------------------------------------------------------------
// ClaimForm
// ---------------------------------------------------------------------------

interface ClaimFormProps {
  onStepChange: (step: number) => void;
}

export default function ClaimForm({ onStepChange }: ClaimFormProps) {
  const [form, setForm] = useState<FormFields>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [resultKey, setResultKey] = useState(0);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  function update(field: keyof FormFields, value: string | boolean) {
    const next = { ...form, [field]: value };
    setForm(next);
    // Clear the individual field error on change
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    onStepChange(computeStep(next));
  }

  function loadExample() {
    setForm(EXAMPLE);
    setErrors({});
    setResult(null);
    setApiError(null);
    onStepChange(computeStep(EXAMPLE));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setResult(null);
    setApiError(null);

    const payload: ClaimInput = {
      hts_code_import: form.hts_code_import.trim(),
      hts_code_export: form.hts_code_export.trim(),
      import_date: form.import_date,
      export_date: form.export_date,
      duty_paid_usd: parseFloat(form.duty_paid_usd),
      was_used_in_us: form.was_used_in_us,
      quantity_imported: parseFloat(form.quantity_imported),
      quantity_exported: parseFloat(form.quantity_exported),
    };

    try {
      const res = await checkEligibility(payload);
      setResult(res);
      setResultKey((k) => k + 1);
      onStepChange(4);
    } catch (err) {
      setApiError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* ------------------------------------------------------------------ */}
      {/* Form card                                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-manifest-paper rounded-sm p-6">
        {/* Card header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink-slate">
            Claim Details
          </h2>
          <button
            type="button"
            onClick={loadExample}
            className="font-mono text-xs underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: "#4C7A6E" }}
          >
            Try an example
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-7">
          {/* ---------------------------------------------------------------- */}
          {/* Import section                                                    */}
          {/* ---------------------------------------------------------------- */}
          <fieldset className="space-y-4">
            <legend className="font-sans text-xs font-medium uppercase tracking-wider text-ink-slate pb-2 border-b border-ink-slate/20 w-full">
              Import Details
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="hts_import"
                  className="font-sans text-xs font-medium text-ink-slate block mb-1"
                >
                  HTS Code (Import)
                </label>
                <input
                  id="hts_import"
                  type="text"
                  placeholder="8471.30.0100"
                  autoComplete="off"
                  value={form.hts_code_import}
                  onChange={(e) => update("hts_code_import", e.target.value)}
                  className={inputCls(!!errors.hts_code_import)}
                />
                {errors.hts_code_import && (
                  <p className="font-mono text-xs mt-1" style={{ color: "#A6432F" }}>
                    {errors.hts_code_import}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="import_date"
                  className="font-sans text-xs font-medium text-ink-slate block mb-1"
                >
                  Import Date
                </label>
                <input
                  id="import_date"
                  type="date"
                  value={form.import_date}
                  onChange={(e) => update("import_date", e.target.value)}
                  className={inputCls(!!errors.import_date)}
                />
                {errors.import_date && (
                  <p className="font-mono text-xs mt-1" style={{ color: "#A6432F" }}>
                    {errors.import_date}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="duty_paid"
                  className="font-sans text-xs font-medium text-ink-slate block mb-1"
                >
                  Duties Paid (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-ink-slate pointer-events-none">
                    $
                  </span>
                  <input
                    id="duty_paid"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.duty_paid_usd}
                    onChange={(e) => update("duty_paid_usd", e.target.value)}
                    className={`${inputCls(!!errors.duty_paid_usd)} pl-6`}
                  />
                </div>
                {errors.duty_paid_usd && (
                  <p className="font-mono text-xs mt-1" style={{ color: "#A6432F" }}>
                    {errors.duty_paid_usd}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="qty_imported"
                  className="font-sans text-xs font-medium text-ink-slate block mb-1"
                >
                  Quantity Imported
                </label>
                <input
                  id="qty_imported"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={form.quantity_imported}
                  onChange={(e) => update("quantity_imported", e.target.value)}
                  className={inputCls(!!errors.quantity_imported)}
                />
                {errors.quantity_imported && (
                  <p className="font-mono text-xs mt-1" style={{ color: "#A6432F" }}>
                    {errors.quantity_imported}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* ---------------------------------------------------------------- */}
          {/* Export section                                                    */}
          {/* ---------------------------------------------------------------- */}
          <fieldset className="space-y-4">
            <legend className="font-sans text-xs font-medium uppercase tracking-wider text-ink-slate pb-2 border-b border-ink-slate/20 w-full">
              Export Details
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="hts_export"
                  className="font-sans text-xs font-medium text-ink-slate block mb-1"
                >
                  HTS Code (Export)
                </label>
                <input
                  id="hts_export"
                  type="text"
                  placeholder="8471.30.0100"
                  autoComplete="off"
                  value={form.hts_code_export}
                  onChange={(e) => update("hts_code_export", e.target.value)}
                  className={inputCls(!!errors.hts_code_export)}
                />
                {errors.hts_code_export && (
                  <p className="font-mono text-xs mt-1" style={{ color: "#A6432F" }}>
                    {errors.hts_code_export}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="export_date"
                  className="font-sans text-xs font-medium text-ink-slate block mb-1"
                >
                  Export Date
                </label>
                <input
                  id="export_date"
                  type="date"
                  value={form.export_date}
                  onChange={(e) => update("export_date", e.target.value)}
                  className={inputCls(!!errors.export_date)}
                />
                {errors.export_date && (
                  <p className="font-mono text-xs mt-1" style={{ color: "#A6432F" }}>
                    {errors.export_date}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:max-w-xs">
              <label
                htmlFor="qty_exported"
                className="font-sans text-xs font-medium text-ink-slate block mb-1"
              >
                Quantity Exported
              </label>
              <input
                id="qty_exported"
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={form.quantity_exported}
                onChange={(e) => update("quantity_exported", e.target.value)}
                className={inputCls(!!errors.quantity_exported)}
              />
              {errors.quantity_exported && (
                <p className="font-mono text-xs mt-1" style={{ color: "#A6432F" }}>
                  {errors.quantity_exported}
                </p>
              )}
            </div>
          </fieldset>

          {/* ---------------------------------------------------------------- */}
          {/* Condition toggle                                                   */}
          {/* ---------------------------------------------------------------- */}
          <fieldset className="space-y-3">
            <legend className="font-sans text-xs font-medium uppercase tracking-wider text-ink-slate pb-2 border-b border-ink-slate/20 w-full">
              Merchandise Condition
            </legend>

            <p className="font-sans text-sm font-medium text-ledger-navy">
              Was the merchandise used or altered in the U.S. before export?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => update("was_used_in_us", false)}
                className="flex-1 py-2.5 px-4 font-mono text-sm rounded-sm border transition-colors"
                style={
                  !form.was_used_in_us
                    ? {
                        backgroundColor: "rgba(76,122,110,0.18)",
                        borderColor: "#4C7A6E",
                        color: "#12213A",
                      }
                    : {
                        backgroundColor: "transparent",
                        borderColor: "rgba(91,107,125,0.35)",
                        color: "#5B6B7D",
                      }
                }
              >
                No — Unused
              </button>
              <button
                type="button"
                onClick={() => update("was_used_in_us", true)}
                className="flex-1 py-2.5 px-4 font-mono text-sm rounded-sm border transition-colors"
                style={
                  form.was_used_in_us
                    ? {
                        backgroundColor: "rgba(166,67,47,0.15)",
                        borderColor: "#A6432F",
                        color: "#12213A",
                      }
                    : {
                        backgroundColor: "transparent",
                        borderColor: "rgba(91,107,125,0.35)",
                        color: "#5B6B7D",
                      }
                }
              >
                Yes — Used
              </button>
            </div>
          </fieldset>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-sans font-semibold text-sm uppercase tracking-wider rounded-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#B8863B", color: "#12213A" }}
          >
            {loading ? "Checking…" : "Check Eligibility"}
          </button>
        </form>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* API error state                                                        */}
      {/* -------------------------------------------------------------------- */}
      {apiError && (
        <div
          className="mt-4 p-4 rounded-sm"
          style={{
            border: "1px solid rgba(166,67,47,0.6)",
            backgroundColor: "rgba(166,67,47,0.08)",
          }}
          role="alert"
        >
          <p
            className="font-mono text-xs font-medium uppercase tracking-wider mb-1"
            style={{ color: "#A6432F" }}
          >
            {apiError.type === "network"
              ? "Network Error"
              : apiError.type === "validation"
              ? "Validation Error"
              : "Server Error"}
          </p>
          <p className="font-mono text-xs text-manifest-paper/80">
            {apiError.message}
          </p>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* Results                                                               */}
      {/* -------------------------------------------------------------------- */}
      {result && !loading && (
        <div
          className="mt-6 p-6 rounded-sm"
          style={{
            backgroundColor: "rgba(232,228,216,0.04)",
            border: "1px solid rgba(91,107,125,0.3)",
          }}
        >
          <VerdictStamp key={resultKey} verdict={result.verdict} />
          <RuleBreakdown
            rules={result.rules}
            estimated_refund_usd={result.estimated_refund_usd}
            refund_basis_note={result.refund_basis_note}
          />
        </div>
      )}
    </div>
  );
}
