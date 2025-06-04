
"use client";
import React from 'react'; // Added import
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: React.ElementType;
  unit?: string;
  helpText?: string;
  min?: string;
  step?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = "number",
  icon: IconComponent,
  unit,
  helpText,
  min,
  step
}) => {
  const id = React.useId();
  return (
    <div className="mb-4">
      <Label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">
        <div className="flex items-center">
          {IconComponent && <IconComponent className="mr-2 h-5 w-5 text-primary" />}
          {label} {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
        </div>
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1 w-full"
        min={min}
        step={step}
        aria-describedby={helpText ? `${id}-help` : undefined}
      />
      {helpText && <p id={`${id}-help`} className="mt-1 text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
};

export default InputField;
