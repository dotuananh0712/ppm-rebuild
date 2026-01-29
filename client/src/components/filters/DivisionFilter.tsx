import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrgUnit } from "@shared/schema";

interface DivisionFilterProps {
  value?: number;
  onChange: (value?: number) => void;
}

export function DivisionFilter({ value, onChange }: DivisionFilterProps) {
  const { data: orgUnits } = useQuery<OrgUnit[]>({
    queryKey: ["/api/org-units"],
  });

  const divisions = orgUnits?.filter((u) => u.type === "division") ?? [];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">Division</label>
      <Select
        value={value?.toString() || "all"}
        onValueChange={(v) => onChange(v === "all" ? undefined : Number(v))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Divisions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Divisions</SelectItem>
          {divisions.map((div) => (
            <SelectItem key={div.id} value={div.id.toString()}>
              {div.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
