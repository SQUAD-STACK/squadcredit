"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import KycProgressBar from "@/components/kyc/progress-bar";
import StepPersonal from "@/components/kyc/step-personal";
import StepDocument from "@/components/kyc/step-document";
import dynamic from "next/dynamic";
const StepLiveness = dynamic(() => import("@/components/kyc/step-liveness"), { ssr: false });
import StepWorkspace from "@/components/kyc/step-workspace";
import StepMerchandise from "@/components/kyc/step-merchandise";
import StepComplete from "@/components/kyc/step-complete";

interface VerifyFlowProps {
  traderId: string;
  initialStep: number;
  traderData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    market: string;
    businessType: string;
  };
  activeStep?: number;
  onStepChange?: (step: number) => void;
  completionHref?: string;
}

export default function VerifyFlow({
  traderId,
  initialStep,
  traderData,
  activeStep,
  onStepChange,
  completionHref = "/dashboard",
}: VerifyFlowProps) {
  const [internalStep, setInternalStep] = useState(initialStep);
  const [maxStep, setMaxStep] = useState(initialStep);
  const router = useRouter();

  const currentStep = activeStep ?? internalStep;
  const setCurrentStep = onStepChange ?? setInternalStep;

  useEffect(() => {
    if (activeStep === undefined) {
      setInternalStep(initialStep);
    }
  }, [activeStep, initialStep]);

  const advanceStep = () => {
    const updateStep = (prev: number) => {
      const next = prev + 1;
      setMaxStep((m) => Math.max(m, next));
      return next;
    };

    if (onStepChange) {
      setCurrentStep(updateStep(currentStep));
      return;
    }

    setInternalStep(updateStep);
  };

  const goToStep = (step: number) => {
    const nextStep = Math.max(1, Math.min(6, step));
    setMaxStep((m) => Math.max(m, nextStep));
    if (onStepChange) {
      setCurrentStep(nextStep);
      return;
    }
    setInternalStep(nextStep);
  };

  // Step 6 = completion screen
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepPersonal
            traderId={traderId}
            initialData={traderData}
            onComplete={() => {
              advanceStep();
            }}
          />
        );
      case 2:
        return (
          <StepDocument
            traderId={traderId}
            onComplete={advanceStep}
          />
        );
      case 3:
        return (
          <StepLiveness
            traderId={traderId}
            onComplete={advanceStep}
          />
        );
      case 4:
        return (
          <StepWorkspace
            traderId={traderId}
            onComplete={advanceStep}
          />
        );
      case 5:
        return (
          <StepMerchandise
            traderId={traderId}
            businessType={traderData.businessType}
            onComplete={advanceStep}
          />
        );
      case 6:
        return <StepComplete dashboardHref={completionHref} />;
      default:
        router.push("/dashboard");
        return null;
    }
  };

  return (
    <>
      {currentStep <= 5 && (
        <KycProgressBar 
          currentStep={currentStep} 
          highestStep={maxStep}
          onStepClick={goToStep}
        />
      )}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
