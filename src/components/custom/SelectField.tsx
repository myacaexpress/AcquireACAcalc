
"use client";
import React from 'react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ElementType;
  helpText?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  icon: IconComponent,
  helpText,
}) => {
  const id = React.useId();
  return (
    <div className="mb-4">
      <Label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">
        <div className="flex items-center">
          {IconComponent && <IconComponent className="mr-2 h-5 w-5 text-primary" />}
          {label}
        </div>
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="mt-1 w-full" aria-describedby={helpText ? `${id}-help` : undefined}>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {helpText && <p id={`${id}-help`} className="mt-1 text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
};

export default SelectField;
