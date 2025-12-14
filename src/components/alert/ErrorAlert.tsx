import { Alert, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  message?: string;
  className?: string;
}

export function ErrorAlert({ message, className }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <Alert variant="destructive" className={cn(className)}>
      <AlertTitle className="text-xs md:text-sm rounded-none">{message}</AlertTitle>
    </Alert>
  );
}
