import { Alert, AlertTitle } from "@/components/ui/alert";

interface ErrorAlertProps {
  message?: string;
  className?: string;
}

export function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertTitle className="text-xs md:text-sm">{message}</AlertTitle>
    </Alert>
  );
}
