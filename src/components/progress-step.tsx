"use client";

import { cn } from "@/lib/utils";
import { TransferStep, ResumeStep } from "@/hooks/use-cross-chain-transfer";

interface ProgressStepsProps {
  currentStep: TransferStep | ResumeStep;
  type: "transfer" | "resume";
}

const TRANSFER_STEPS = [
  { id: "approving", label: "Approving" },
  { id: "burning", label: "Burning" },
  { id: "waiting-attestation", label: "Attestation" },
  { id: "minting", label: "Minting" },
  { id: "completed", label: "Completed" },
];

const RESUME_STEPS = [
  { id: "waiting-attestation", label: "Attestation" },
  { id: "minting", label: "Minting" },
  { id: "completed", label: "Completed" },
];

export function ProgressSteps({ currentStep, type }: ProgressStepsProps) {
  const steps = type === "transfer" ? TRANSFER_STEPS : RESUME_STEPS;
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="space-y-8 mb-8">
      <div className="flex items-center justify-center gap-8 mb-6">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex flex-col items-center ${
              index <= currentIndex ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                index <= currentIndex
                  ? "bg-green-600 text-white"
                  : "bg-muted"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-sm">{step.label}</span>
          </div>
        ))}
      </div>
      {/*
      <div className="relative h-1">
        <div className="absolute top-0 left-0 h-1 bg-muted w-full" />
        <div
          className="absolute top-0 left-0 h-1 bg-green-600 transition-all duration-300"
          style={{
            width: `${(currentIndex / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>
      */}
    </div>
  );
}