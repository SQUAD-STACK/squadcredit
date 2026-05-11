"use client";

import { useState } from "react";
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
}

export default function VerifyFlow({
  traderId,
  initialStep,
  traderData,
}: VerifyFlowProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [maxStep, setMaxStep] = useState(initialStep);
  const [businessType, setBusinessType] = useState(traderData.businessType);
  const router = useRouter();

  const advanceStep = () => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      setMaxStep((m) => Math.max(m, next));
      return next;
    });
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
            businessType={businessType}
            onComplete={advanceStep}
          />
        );
      case 6:
        return <StepComplete />;
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
          onStepClick={(step) => setCurrentStep(step)}
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
