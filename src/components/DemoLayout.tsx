import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Video,
  BookOpen,
  CreditCard,
  TrendingUp,
  DollarSign,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";

interface DemoLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/demo/dashboard" },
  { icon: Users, label: "Clients", href: "/demo/dashboard" },
  { icon: Calendar, label: "Schedule", href: "/demo/schedule" },
  { icon: Video, label: "Instruction Videos", href: "/demo/dashboard" },
  { icon: BookOpen, label: "Lessons", href: "/demo/lessons" },
  { icon: CreditCard, label: "Payments", href: "/demo/dashboard" },
  { icon: TrendingUp, label: "Analytics", href: "/demo/dashboard" },
  { icon: DollarSign, label: "Earn", href: "/demo/dashboard" },
  { icon: Settings, label: "Settings", href: "/demo/dashboard" },
];

export function DemoLayout({ children }: DemoLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-primary">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 px-4">
            <Logo size="md" />
            <span className="text-xl font-bold text-primary-foreground">Pro Pointers Plus</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Demo Badge */}
          <div className="p-4">
            <Badge variant="secondary" className="w-full justify-center py-2">
              Demo Mode
            </Badge>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 bg-background">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
