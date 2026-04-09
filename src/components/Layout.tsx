import { useState } from "react";
import { Home, Users, Calendar, CreditCard, Settings, TrendingUp, LogOut, Menu, Video, DollarSign, BookOpen, Building2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Instruction Videos", href: "/instruction-videos", icon: Video },
  { name: "Lessons", href: "/lessons", icon: BookOpen },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Earn", href: "/earn", icon: DollarSign },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();
  const { academy } = useSubscription();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    try {
      await signOut();
      navigate('/landing', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      navigate('/landing', { replace: true });
    }
  };

  const navItems = academy 
    ? [
        { name: "Dashboard", href: "/", icon: Home },
        { name: "Academy", href: "/academy", icon: Building2 },
        { name: "Clients", href: "/clients", icon: Users },
        { name: "Schedule", href: "/schedule", icon: Calendar },
        { name: "Instruction Videos", href: "/instruction-videos", icon: Video },
        { name: "Lessons", href: "/lessons", icon: BookOpen },
        { name: "Payments", href: "/payments", icon: CreditCard },
        { name: "Analytics", href: "/analytics", icon: TrendingUp },
        { name: "Earn", href: "/earn", icon: DollarSign },
        { name: "Settings", href: "/settings", icon: Settings },
      ]
    : navigation;

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-white/[0.06] px-6">
        <Logo size="sm" />
        <span className="text-lg font-bold font-heading text-foreground">Pro Pointers Plus</span>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-150 hover:bg-white/[0.04] hover:text-foreground"
            activeClassName="bg-white/[0.06] text-primary font-medium border-l-[3px] border-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-4 z-50">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-black/90 backdrop-blur-xl border-white/[0.06]">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 ml-4">
          <Logo size="sm" />
          <span className="text-lg font-bold font-heading text-foreground">Pro Pointers Plus</span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col bg-black/80 backdrop-blur-xl border-r border-white/[0.06]">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="md:pl-64 pt-16 md:pt-0">
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};
