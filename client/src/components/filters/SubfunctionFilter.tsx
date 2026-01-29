import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrgUnit } from "@shared/schema";

interface SubfunctionFilterProps {
  value?: number;
  onChange: (value?: number) => void;
  divisionId?: number;
}

export function SubfunctionFilter({ value, onChange, divisionId }: SubfunctionFilterProps) {
  const { data: orgUnits } = useQuery<OrgUnit[]>({
    queryKey: ["/api/org-units"],
  });

  // Get functions and subfunctions under the selected division
  const getChildIds = (parentId: number, units: OrgUnit[]): number[] => {
    const children = units.filter((u) => u.parentId === parentId);
    const ids = children.map((c) => c.id);
    children.forEach((c) => {
      ids.push(...getChildIds(c.id, units));
    });
    return ids;
  };

  let subfunctions: OrgUnit[] = [];
  if (orgUnits) {
    if (divisionId) {
      // Get all descendants of the division that are subfunctions
      const descendantIds = getChildIds(divisionId, orgUnits);
      subfunctions = orgUnits.filter(
        (u) => u.type === "subfunction" && descendantIds.includes(u.id)
      );
    } else {
      // Get all subfunctions
      subfunctions = orgUnits.filter((u) => u.type === "subfunction");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">Subfunction</label>
      <Select
        value={value?.toString() || "all"}
        onValueChange={(v) => onChange(v === "all" ? undefined : Number(v))}
        disabled={divisionId !== undefined && subfunctions.length === 0}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Subfunctions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Subfunctions</SelectItem>
          {subfunctions.map((sub) => (
            <SelectItem key={sub.id} value={sub.id.toString()}>
              {sub.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
