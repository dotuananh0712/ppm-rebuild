import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role } from "@shared/schema";

interface RoleFilterProps {
  value?: number;
  onChange: (value?: number) => void;
}

export function RoleFilter({ value, onChange }: RoleFilterProps) {
  const { data: roles } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">Role</label>
      <Select
        value={value?.toString() || "all"}
        onValueChange={(v) => onChange(v === "all" ? undefined : Number(v))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {roles?.map((role) => (
            <SelectItem key={role.id} value={role.id.toString()}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
