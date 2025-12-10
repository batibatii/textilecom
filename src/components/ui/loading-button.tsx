import * as React from "react";
import { Button } from "@/components/ui/button";

export interface LoadingButtonProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  loading?: boolean;
  loadingText?: string;
  success?: boolean;
  successText?: string;
  children: React.ReactNode;
}

export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(
  (
    {
      loading = false,
      loadingText,
      success = false,
      successText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const getButtonText = () => {
      if (loading && loadingText) return loadingText;
      if (success && successText) return successText;
      return children;
    };

    return (
      <Button ref={ref} disabled={disabled || loading || success} {...props}>
        {getButtonText()}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";
