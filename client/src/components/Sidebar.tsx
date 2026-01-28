import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  CalendarRange,
  GitBranch,
  BarChart3,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Organization", href: "/organization", icon: Building2 },
  { name: "Resources", href: "/resources", icon: Users },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Allocations", href: "/allocations", icon: CalendarRange },
  { name: "Scenarios", href: "/scenarios", icon: GitBranch },
  { name: "Capacity", href: "/capacity", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">PPM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={() => {
            const isDark = document.documentElement.classList.toggle("dark");
            localStorage.setItem("theme", isDark ? "dark" : "light");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <div className="h-5 w-5 flex items-center justify-center">
            {/* Simple sun/moon icon logic would go here, using a generic icon for now */}
            <span className="dark:hidden">☀️</span>
            <span className="hidden dark:inline">🌙</span>
          </div>
          Toggle Theme
        </button>
        <Link href="/settings">
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </a>
        </Link>
      </div>
    </aside>
  );
}

// Add init logic to main app or here
if (typeof window !== 'undefined') {
  const theme = localStorage.getItem("theme");
  if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
}
