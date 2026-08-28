"use client";

import Button from "@/components/ui/Button";
import { CategoryFiltersProps } from "@/types/product";


export default function CategoryFilters({
  options,
  activeId,
  onChange,
}: CategoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {options.map((option) => (
        <Button
          key={option.id}
          type="button"
          size="sm"
          variant={activeId === option.id ? "filterActive" : "filterInactive"}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
