import { Label } from "@/components/ui/label";
import { FieldError } from "react-hook-form";

interface FormFieldProps {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Label className="text-xs md:text-sm">{label}</Label>
      {children}
      {error && (
        <span className="text-destructive text-[10px] md:text-xs mt-2">
          {error.message}
        </span>
      )}
    </div>
  );
}
