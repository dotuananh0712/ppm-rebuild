import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PriorityFilterProps {
  value?: number;
  onChange: (value?: number) => void;
}

const PRIORITIES = [
  { value: 1, label: "P1 - Critical" },
  { value: 2, label: "P2 - High" },
  { value: 3, label: "P3 - Medium" },
  { value: 4, label: "P4 - Low" },
  { value: 5, label: "P5 - Minimal" },
];

export function PriorityFilter({ value, onChange }: PriorityFilterProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">Priority</label>
      <Select
        value={value?.toString() || "all"}
        onValueChange={(v) => onChange(v === "all" ? undefined : Number(v))}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          {PRIORITIES.map((priority) => (
            <SelectItem key={priority.value} value={priority.value.toString()}>
              {priority.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
