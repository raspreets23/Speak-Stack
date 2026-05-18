"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function GenerateButton({
  size,
  disabled,
  isSubmitting,
  onSubmit,
  className,
}: {
  size?: "default" | "sm";
  disabled: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  className?: string;
}) {
  console.log("🟢 [BUTTON] Render - disabled:", disabled, "isSubmitting:", isSubmitting, "onSubmit exists:", !!onSubmit);
  
  const handleClick = () => {
    console.log("🟢 [BUTTON] 🖱️ Button CLICKED!");
    console.log("🟢 [BUTTON] onSubmit exists:", !!onSubmit);
    if (onSubmit) {
      console.log("🟢 [BUTTON] Calling onSubmit...");
      onSubmit();
    } else {
      console.warn("🟡 [BUTTON] No onSubmit prop provided!");
    }
  };

  return (
    <Button
      size={size}
      disabled={disabled || isSubmitting}
      className={className}
      onClick={handleClick}
    >
      {isSubmitting ? (
        <>
          <Spinner className="size-3"/>
          Generating...
        </>
      ) : (
        "Generate speech"
      )}
    </Button>
  );
}