import * as React from "react";
import { Button } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

export interface LoadingButtonProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children">,
    VariantProps<typeof buttonVariants> {
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
      variant,
      size,
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
      <Button
        ref={ref}
        disabled={disabled || loading || success}
        variant={variant}
        size={size}
        {...props}
      >
        {getButtonText()}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";
