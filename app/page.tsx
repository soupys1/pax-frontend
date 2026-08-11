"use client";

import { useState } from "react";
import ClaimForm from "@/components/ClaimForm";
import ProgressRail from "@/components/ProgressRail";
import ScopeDisclaimer from "@/components/ScopeDisclaimer";

export default function Home() {
  const [step, setStep] = useState(0);

  return (
    <main className="min-h-screen bg-ledger-navy px-4 py-10 md:py-14">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="font-display font-black text-4xl md:text-5xl text-manifest-paper tracking-tight leading-none">
            Drawback Ledger
          </h1>
          <p className="font-mono text-sm text-ink-slate mt-3">
            Duty drawback eligibility checker &mdash; 19 U.S.C. § 1313(j)
          </p>
        </header>

        {/* Two-column layout: progress rail + form */}
        <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-8 lg:gap-12 items-start">
          {/* Progress rail */}
          <aside className="pt-1">
            <ProgressRail step={step} />
          </aside>

          {/* Form + disclaimer */}
          <div>
            <ClaimForm onStepChange={setStep} />
            <ScopeDisclaimer />
          </div>
        </div>
      </div>
    </main>
  );
}
