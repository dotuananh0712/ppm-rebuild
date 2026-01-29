import { Input } from "@/components/ui/input";

interface MonthRangeFilterProps {
  startMonth?: string;
  endMonth?: string;
  onStartChange: (value?: string) => void;
  onEndChange: (value?: string) => void;
}

export function MonthRangeFilter({
  startMonth,
  endMonth,
  onStartChange,
  onEndChange,
}: MonthRangeFilterProps) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">From</label>
        <Input
          type="month"
          value={startMonth || ""}
          onChange={(e) => onStartChange(e.target.value || undefined)}
          className="w-[150px]"
        />
      </div>
      <span className="pb-2 text-muted-foreground">→</span>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">To</label>
        <Input
          type="month"
          value={endMonth || ""}
          onChange={(e) => onEndChange(e.target.value || undefined)}
          className="w-[150px]"
          min={startMonth}
        />
      </div>
    </div>
  );
}
