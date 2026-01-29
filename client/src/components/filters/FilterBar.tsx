import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterBarProps {
  children: ReactNode;
  onClear?: () => void;
  hasActiveFilters?: boolean;
}

export function FilterBar({ children, onClear, hasActiveFilters }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg">
      {children}
      {hasActiveFilters && onClear && (
        <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto gap-2">
          <X className="w-4 h-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
