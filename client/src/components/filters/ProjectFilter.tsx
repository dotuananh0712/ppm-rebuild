import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "@shared/schema";

interface ProjectFilterProps {
  value?: number;
  onChange: (value?: number) => void;
}

export function ProjectFilter({ value, onChange }: ProjectFilterProps) {
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">Project</label>
      <Select
        value={value?.toString() || "all"}
        onValueChange={(v) => onChange(v === "all" ? undefined : Number(v))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          {projects?.map((project) => (
            <SelectItem key={project.id} value={project.id.toString()}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
