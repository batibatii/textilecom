"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export function FilterSection({
  title,
  options,
  selected,
  onChange,
}: FilterSectionProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option}
            className="flex items-center gap-2 hover:bg-muted/50 p-1 transition-colors"
          >
            <Input
              type="checkbox"
              id={`${title}-${option}`}
              checked={selected.includes(option)}
              onChange={() => handleToggle(option)}
              className="w-4 h-4 cursor-pointer"
            />
            <Label
              htmlFor={`${title}-${option}`}
              className="text-sm cursor-pointer"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
