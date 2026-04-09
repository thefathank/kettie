import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Users, CreditCard, BookOpen, Video, Building2, BarChart3,
  ArrowRight, Play, ChevronRight, Zap, Shield, Clock, Menu, X,
  LayoutDashboard, DollarSign, TrendingUp, CheckCircle2
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import coachPrivate from "@/assets/coach-private.png";
import coachSchool from "@/assets/coach-school.png";
import coachClub from "@/assets/coach-club.png";
import coachAcademy from "@/assets/coach-academy.png";

const Landing = () => {
  const navigate = useNavigate();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [sessionsPerWeek, setSessionsPerWeek] = useState(15);

  const calcData = useMemo(() => {
    const manualMinPerSession = 18;
    const appMinPerSession = 4;
    const manualHrsWeek = (sessionsPerWeek * manualMinPerSession) / 60;
    const appHrsWeek = (sessionsPerWeek * appMinPerSession) / 60;
    const savedHrsWeek = manualHrsWeek - appHrsWeek;
    const savedHrsYear = savedHrsWeek * 50;
    const manualPct = 100;
    const appPct = (appHrsWeek / manualHrsWeek) * 100;
    return { manualHrsWeek: manualHrsWeek.toFixed(1), appHrsWeek: appHrsWeek.toFixed(1), savedHrsWeek: savedHrsWeek.toFixed(1), savedHrsYear: Math.round(savedHrsYear), manualPct, appPct };
  }, [sessionsPerWeek]);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!heroRef.current || window.innerWidth < 768) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('waitlist').insert({ email: email.trim() });
      
      if (error) {
        if (error.code === '23505') {
          toast.info("You're already on the waitlist!");
        } else {
          throw error;
        }
      } else {
        toast.success("You're on the waitlist! We'll be in touch.");
      }
      setWaitlistOpen(false);
      setEmail("");
    } catch (error) {
      console.error('Waitlist error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const bentoFeatures = [
    { icon: Users, title: "Client Management", desc: "Track every client with detailed profiles, skill levels, and progress history.", span: "md:col-span-2" },
    { icon: Calendar, title: "Smart Scheduling", desc: "Manage sessions, recurring bookings, and integrate with Cal.com.", span: "md:row-span-2" },
    { icon: BookOpen, title: "Lesson Plans", desc: "Reusable templates with exercises and drills.", span: "" },
    { icon: CreditCard, title: "Payment Tracking", desc: "Session packs, invoices, and payment history.", span: "" },
    { icon: Video, title: "Instruction Videos", desc: "Build a video library and share with clients.", span: "" },
    { icon: Building2, title: "Academy Mode", desc: "Multi-coach management under one roof.", span: "md:col-span-2" },
    { icon: BarChart3, title: "Analytics", desc: "Revenue, sessions, and client growth at a glance.", span: "" },
  ];

  const protoViews = ["Dashboard", "Clients", "Schedule", "Lessons", "Payments"] as const;
  const protoIcons = { Dashboard: LayoutDashboard, Clients: Users, Schedule: Calendar, Lessons: BookOpen, Payments: CreditCard };
  const [activeView, setActiveView] = useState<typeof protoViews[number]>("Dashboard");

  const coachTypes = [
    { img: coachPrivate, alt: "Private lesson coach", title: "Private Coach", desc: "One-on-one session management with personalized lesson plans." },
    { img: coachSchool, alt: "School team coach", title: "School Coach", desc: "Organize rosters and track player development across seasons." },
    { img: coachClub, alt: "Club pro", title: "Club Pro", desc: "Handle recurring clients with session packages and self-booking." },
    { img: coachAcademy, alt: "Tennis academy", title: "Academy", desc: "Multi-coach operations, shared clients, centralized billing." },
  ];

  const stats = [
    { value: "500+", label: "Sessions Tracked" },
    { value: "99.9%", label: "Uptime" },
    { value: "<1s", label: "Load Time" },
    { value: "256-bit", label: "Encryption" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ===== NAV ===== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${navScrolled ? "bg-black/80 backdrop-blur-xl border-white/[0.06] py-3" : "bg-transparent border-transparent py-5"}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/landing')}>
            <Logo size="sm" />
            <span className="text-xl font-bold font-heading text-foreground hidden sm:inline">Pro Pointers Plus</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">Features</a>
            <button onClick={() => navigate('/pricing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">Pricing</button>
            <button onClick={() => navigate('/blog')} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">Blog</button>
            <Button onClick={() => navigate('/auth')} variant="ghost" size="sm">Sign In</Button>
            <Button onClick={() => navigate('/pricing')} size="sm" className="btn-pulse-glow">Get Started</Button>
          </div>
          <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-6 space-y-4">
            <a href="#features" className="block text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <button onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }} className="block text-sm text-muted-foreground">Pricing</button>
            <button onClick={() => { navigate('/blog'); setMobileMenuOpen(false); }} className="block text-sm text-muted-foreground">Blog</button>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => navigate('/auth')} variant="outline" size="sm" className="flex-1">Sign In</Button>
              <Button onClick={() => navigate('/pricing')} size="sm" className="flex-1">Get Started</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Waitlist Dialog */}
      <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join the Virtual Coaching Waitlist</DialogTitle>
            <DialogDescription>
              Be the first to know when virtual coaching becomes available. Enter your email and we'll notify you!
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWaitlistSubmit} className="space-y-4">
            <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== HERO ===== */}
      <section ref={heroRef} onMouseMove={handleMouseMove} className="relative min-h-[100vh] flex flex-col items-center overflow-hidden pt-28 md:pt-36">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-primary/[0.05] blur-[180px]" />
        </div>

        {/* Centered text — tighter, no italic */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl lg:text-[80px] font-black font-heading text-foreground tracking-[-0.04em] leading-[0.95] mb-5"
          >
            Do what you love coaching.
            <br />
            <span className="text-muted-foreground">We handle the rest.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 font-medium tracking-[-0.01em]"
          >
            Modern coaching management for tennis pros and academies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-4"
          >
            <Button
              onClick={() => navigate('/pricing')}
              size="lg"
              className="btn-pulse-glow px-8 h-12 text-sm font-semibold"
            >
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigate('/demo/dashboard')}
              variant="outline"
              size="lg"
              className="px-8 h-12 text-sm font-semibold"
            >
              <Play className="mr-2 h-4 w-4" /> See Demo
            </Button>
          </motion.div>
        </div>

        {/* ===== FLOATING GLASS CARDS — 3D dashboard exploded view ===== */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="relative z-10 w-full max-w-5xl mx-auto mt-16 px-4"
          style={{ perspective: "1200px" }}
        >
          <div
            className="relative h-[340px] md:h-[420px]"
            style={{
              transform: `rotateY(${mousePos.x * 3}deg) rotateX(${-mousePos.y * 2}deg)`,
              transformStyle: "preserve-3d",
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* Card 1 — Stats row, front-left */}
            <div
              className="absolute left-[5%] top-[10%] w-[220px] glass rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
              style={{ transform: "translate3d(0, 0, 40px)" }}
            >
              <div className="text-xs text-muted-foreground mb-3">This Month</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xl font-bold font-mono text-foreground">24</div>
                  <div className="text-[10px] text-muted-foreground">Clients</div>
                </div>
                <div>
                  <div className="text-xl font-bold font-mono text-primary">128</div>
                  <div className="text-[10px] text-muted-foreground">Sessions</div>
                </div>
              </div>
            </div>

            {/* Card 2 — Revenue chart, center-back */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-[0%] w-[280px] glass rounded-2xl p-4 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
              style={{ transform: "translate3d(-50%, 0, 80px)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">Revenue</span>
                <span className="text-sm font-bold font-mono text-primary">$4,200</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {[35, 50, 42, 65, 55, 78, 60, 85, 72, 90, 68, 95].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-primary/40" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            {/* Card 3 — Schedule, front-right */}
            <div
              className="absolute right-[5%] top-[15%] w-[200px] glass rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
              style={{ transform: "translate3d(0, 0, 30px)" }}
            >
              <div className="text-xs text-muted-foreground mb-2">Today</div>
              {["9:00 — Alex M.", "10:30 — Sarah K.", "2:00 — Group"].map(r => (
                <div key={r} className="flex items-center gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[11px] text-foreground/80 font-mono">{r}</span>
                </div>
              ))}
            </div>

            {/* Card 4 — Lesson plan snippet, bottom-left */}
            <div
              className="absolute left-[15%] bottom-[5%] w-[200px] glass rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
              style={{ transform: "translate3d(0, 0, 20px)" }}
            >
              <div className="text-xs font-semibold text-foreground mb-2">Forehand Drill</div>
              {["Grip check — 5 min", "Shadow swings — 10 min", "Rally — 15 min"].map(ex => (
                <div key={ex} className="flex items-center gap-2 py-1">
                  <div className="w-2.5 h-2.5 rounded border border-primary/40 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-sm bg-primary" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{ex}</span>
                </div>
              ))}
            </div>

            {/* Card 5 — Payment badge, bottom-right */}
            <div
              className="absolute right-[12%] bottom-[10%] w-[180px] glass rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
              style={{ transform: "translate3d(0, 0, 50px)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">Payments</span>
              </div>
              <div className="text-lg font-bold font-mono text-foreground">$1,850</div>
              <div className="text-[10px] text-primary">+12% this month</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== BENTO FEATURE GRID ===== */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading text-foreground tracking-[-0.02em] mb-4">
              Everything you need.
              <br />
              <span className="text-muted-foreground">Nothing you don't.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bentoFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`glass rounded-2xl p-6 group hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(16,185,129,0.08)] hover:border-primary/20 transition-all duration-150 ${f.span}`}
              >
                <f.icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="text-lg font-bold font-heading text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE PROTOTYPE — LINEAR STYLE ===== */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black font-heading text-foreground tracking-[-0.02em] mb-16"
          >
            See it in action.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Glow behind */}
            <div className="absolute -inset-4 rounded-3xl bg-primary/[0.04] blur-[60px] pointer-events-none" />

            <div className="relative glass rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/[0.08]">
              {/* macOS title bar */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <div className="flex-1 mx-8 h-5 bg-white/[0.04] rounded-md flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground/40 font-mono">app.propointersplus.com</span>
                </div>
              </div>

              <div className="flex min-h-[420px] md:min-h-[480px]">
                {/* Sidebar — hidden on mobile, horizontal tabs instead */}
                <div className="hidden md:flex flex-col w-[200px] border-r border-white/[0.06] bg-white/[0.02] p-3 gap-1">
                  <div className="flex items-center gap-2 px-3 py-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">Pro Pointers</span>
                  </div>
                  {protoViews.map(view => {
                    const Icon = protoIcons[view];
                    return (
                      <button
                        key={view}
                        onClick={() => setActiveView(view)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left ${activeView === view ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'}`}
                      >
                        <Icon className="w-4 h-4" />
                        {view}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile tab bar */}
                <div className="md:hidden flex border-b border-white/[0.06] overflow-x-auto">
                  {protoViews.map(view => {
                    const Icon = protoIcons[view];
                    return (
                      <button
                        key={view}
                        onClick={() => setActiveView(view)}
                        className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all duration-150 border-b-2 ${activeView === view ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {view}
                      </button>
                    );
                  })}
                </div>

                {/* Main content area */}
                <div className="flex-1 p-5 md:p-6 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeView}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {activeView === "Dashboard" && (
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { label: "Active Clients", val: "24", icon: Users, change: "+3 this month" },
                              { label: "Sessions", val: "128", icon: Calendar, change: "+12 this week" },
                              { label: "Revenue", val: "$4,200", icon: DollarSign, change: "+18% vs last" },
                              { label: "Growth", val: "+18%", icon: TrendingUp, change: "steady trend" },
                            ].map(s => (
                              <div key={s.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
                                  <s.icon className="w-3.5 h-3.5 text-primary/60" />
                                </div>
                                <div className="text-xl font-bold font-mono text-foreground">{s.val}</div>
                                <div className="text-[10px] text-primary mt-1">{s.change}</div>
                              </div>
                            ))}
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                              <div className="text-xs text-muted-foreground mb-3">Revenue (12 weeks)</div>
                              <div className="flex items-end gap-1 h-24">
                                {[35, 50, 42, 65, 55, 78, 60, 85, 72, 90, 68, 95].map((h, i) => (
                                  <div key={i} className="flex-1 rounded-sm bg-primary/40 hover:bg-primary/60 transition-colors duration-150" style={{ height: `${h}%` }} />
                                ))}
                              </div>
                            </div>
                            <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                              <div className="text-xs text-muted-foreground mb-3">Today's Schedule</div>
                              {["9:00 AM — Alex M. · Private", "10:30 AM — Sarah K. · Private", "1:00 PM — Group Session", "3:30 PM — James R. · Trial"].map(r => (
                                <div key={r} className="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  <span className="text-xs text-foreground/80">{r}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeView === "Clients" && (
                        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
                          <div className="grid grid-cols-[1fr_1fr_80px_80px] md:grid-cols-[1fr_1.5fr_80px_80px_100px] gap-4 px-4 py-3 border-b border-white/[0.06] text-[10px] text-muted-foreground uppercase tracking-wider">
                            <span>Name</span>
                            <span className="hidden md:block">Email</span>
                            <span>Sessions</span>
                            <span>Level</span>
                            <span className="hidden md:block">Status</span>
                          </div>
                          {[
                            { name: "Alex Martinez", email: "alex@email.com", sessions: 32, level: "Advanced", status: "Active" },
                            { name: "Sarah Kim", email: "sarah@email.com", sessions: 18, level: "Intermediate", status: "Active" },
                            { name: "James Rivera", email: "james@email.com", sessions: 5, level: "Beginner", status: "Trial" },
                            { name: "Emma Chen", email: "emma@email.com", sessions: 24, level: "Advanced", status: "Active" },
                            { name: "David Okoro", email: "david@email.com", sessions: 11, level: "Intermediate", status: "Paused" },
                          ].map(c => (
                            <div key={c.name} className="grid grid-cols-[1fr_1fr_80px_80px] md:grid-cols-[1fr_1.5fr_80px_80px_100px] gap-4 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-primary/[0.03] transition-colors duration-150">
                              <span className="text-sm text-foreground font-medium">{c.name}</span>
                              <span className="text-xs text-muted-foreground hidden md:block">{c.email}</span>
                              <span className="text-xs font-mono text-foreground">{c.sessions}</span>
                              <span className="text-xs text-muted-foreground">{c.level}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit hidden md:block ${c.status === 'Active' ? 'bg-primary/15 text-primary' : c.status === 'Trial' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-white/[0.06] text-muted-foreground'}`}>{c.status}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeView === "Schedule" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-7 gap-1.5">
                            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                              <div key={d} className="text-center text-[10px] text-muted-foreground/60 pb-1 font-medium">{d}</div>
                            ))}
                            {Array.from({length: 21}, (_,i) => {
                              const hasSession = [2, 5, 7, 9, 12, 14, 16, 19].includes(i);
                              const isToday = i === 9;
                              return (
                                <div key={i} className={`aspect-square rounded-lg text-[11px] flex items-center justify-center font-mono transition-all duration-150 ${isToday ? 'bg-primary text-primary-foreground font-bold ring-2 ring-primary/30' : hasSession ? 'bg-primary/15 text-primary border border-primary/20' : 'bg-white/[0.03] text-muted-foreground/50 hover:bg-white/[0.06]'}`}>
                                  {i + 1}
                                </div>
                              );
                            })}
                          </div>
                          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                            <div className="text-xs text-muted-foreground mb-3">Wednesday, Jan 10</div>
                            {[
                              { time: "9:00", name: "Alex M.", type: "Private", dur: "60 min" },
                              { time: "10:30", name: "Sarah K.", type: "Private", dur: "60 min" },
                              { time: "1:00", name: "Group A", type: "Group", dur: "90 min" },
                              { time: "3:30", name: "James R.", type: "Trial", dur: "30 min" },
                            ].map(s => (
                              <div key={s.time} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono text-primary w-12">{s.time}</span>
                                  <span className="text-sm text-foreground">{s.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground">{s.dur}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.type === 'Private' ? 'bg-primary/15 text-primary' : s.type === 'Group' ? 'bg-blue-500/15 text-blue-400' : 'bg-yellow-500/15 text-yellow-400'}`}>{s.type}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeView === "Lessons" && (
                        <div className="grid md:grid-cols-2 gap-4">
                          {[
                            { title: "Forehand Mechanics", exercises: ["Grip adjustment drill — 10 min", "Shadow swings — 15 min", "Cross-court rally — 20 min"], dur: "45 min", tags: ["Technique", "Beginner"] },
                            { title: "Serve & Return", exercises: ["Toss consistency — 10 min", "Flat serve drill — 15 min", "Return positioning — 15 min", "Point play — 20 min"], dur: "60 min", tags: ["Serve", "Intermediate"] },
                            { title: "Net Play Basics", exercises: ["Split step drill — 10 min", "Volley technique — 15 min", "Approach shot sequence — 20 min"], dur: "45 min", tags: ["Net", "Beginner"] },
                            { title: "Match Strategy", exercises: ["Pattern recognition — 15 min", "Tactical rally — 20 min", "Pressure point play — 25 min"], dur: "60 min", tags: ["Strategy", "Advanced"] },
                          ].map(l => (
                            <div key={l.title} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 hover:border-primary/20 transition-all duration-150">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-foreground">{l.title}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">{l.dur}</span>
                              </div>
                              <div className="space-y-2 mb-3">
                                {l.exercises.map(ex => (
                                  <div key={ex} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-primary/50" />
                                    <span className="text-[11px] text-muted-foreground">{ex}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-1.5">
                                {l.tags.map(t => (
                                  <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.06] text-muted-foreground">{t}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeView === "Payments" && (
                        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
                          <div className="grid grid-cols-[1fr_100px_80px_80px] md:grid-cols-[1fr_120px_100px_100px_100px] gap-4 px-4 py-3 border-b border-white/[0.06] text-[10px] text-muted-foreground uppercase tracking-wider">
                            <span>Client</span>
                            <span>Amount</span>
                            <span>Type</span>
                            <span className="hidden md:block">Date</span>
                            <span>Status</span>
                          </div>
                          {[
                            { client: "Alex Martinez", amount: "$480", type: "8-Pack", date: "Jan 8", status: "Paid" },
                            { client: "Sarah Kim", amount: "$65", type: "Single", date: "Jan 7", status: "Paid" },
                            { client: "Emma Chen", amount: "$480", type: "8-Pack", date: "Jan 5", status: "Paid" },
                            { client: "James Rivera", amount: "$65", type: "Trial", date: "Jan 4", status: "Pending" },
                            { client: "David Okoro", amount: "$240", type: "4-Pack", date: "Jan 2", status: "Paid" },
                          ].map(p => (
                            <div key={p.client + p.date} className="grid grid-cols-[1fr_100px_80px_80px] md:grid-cols-[1fr_120px_100px_100px_100px] gap-4 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-primary/[0.03] transition-colors duration-150">
                              <span className="text-sm text-foreground font-medium">{p.client}</span>
                              <span className="text-sm font-mono text-foreground">{p.amount}</span>
                              <span className="text-xs text-muted-foreground">{p.type}</span>
                              <span className="text-xs text-muted-foreground hidden md:block">{p.date}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit ${p.status === 'Paid' ? 'bg-primary/15 text-primary' : 'bg-yellow-500/15 text-yellow-400'}`}>{p.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== WHO IT'S FOR ===== */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading text-foreground tracking-[-0.02em]">
              Built for every type of coach.
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {coachTypes.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass rounded-2xl overflow-hidden group hover:border-primary/20 hover:scale-[1.02] transition-all duration-200"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={c.img} alt={c.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold font-heading text-foreground mb-1">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-10"
          >
            <Button onClick={() => navigate('/pricing')} variant="outline" size="lg">
              See pricing for your setup <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== SAVE TIME CALCULATOR ===== */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Save Time</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-heading text-foreground tracking-[-0.02em] mb-4">
                More hours coaching,<br />less time on admin.
              </h2>
              <p className="text-muted-foreground mb-10 max-w-md leading-relaxed">
                Pro Pointers Plus automates scheduling, payment tracking, and lesson delivery — saving you hours every week on paperwork and follow-ups.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sessions per week:</span>
                  <span className="text-2xl font-bold font-mono text-foreground">{sessionsPerWeek}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={40}
                  value={sessionsPerWeek}
                  onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/[0.08] rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(16,185,129,0.5)] [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                />
                <p className="text-xs text-muted-foreground/50">Estimates based on average admin time per session.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-end gap-8 justify-center"
            >
              <div className="flex flex-col items-center gap-3">
                <span className="text-2xl md:text-3xl font-bold font-mono text-foreground">{calcData.manualHrsWeek}h</span>
                <span className="text-xs text-muted-foreground">admin / week</span>
                <div className="w-20 md:w-24 rounded-xl overflow-hidden bg-white/[0.06] border border-white/[0.08]" style={{ height: "200px" }}>
                  <div
                    className="w-full bg-white/[0.15] rounded-xl transition-all duration-300 ease-out"
                    style={{ height: `${calcData.manualPct}%`, marginTop: `${100 - calcData.manualPct}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground/60">Manual</span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <span className="text-2xl md:text-3xl font-bold font-mono text-primary">{calcData.appHrsWeek}h</span>
                <span className="text-xs text-muted-foreground">admin / week</span>
                <div className="w-20 md:w-24 rounded-xl overflow-hidden bg-white/[0.06] border border-primary/20" style={{ height: "200px" }}>
                  <div
                    className="w-full bg-primary/60 rounded-xl transition-all duration-300 ease-out"
                    style={{ height: `${calcData.appPct}%`, marginTop: `${100 - calcData.appPct}%` }}
                  />
                </div>
                <span className="text-xs text-primary">With P³</span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="glass rounded-2xl border-primary/30 p-6 md:p-8 text-center">
                  <div className="text-3xl md:text-4xl font-bold font-mono text-primary mb-1">{calcData.savedHrsYear}h</div>
                  <div className="text-xs text-muted-foreground font-medium">saved per year</div>
                </div>
                <span className="text-xs text-primary/60">annual savings</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="py-14 border-t border-b border-white/[0.04] bg-white/[0.02]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold font-mono text-foreground mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="w-8 h-0.5 bg-primary/40 mx-auto mt-3" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA / CLOSING ===== */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full bg-primary/[0.08] blur-[150px]" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black font-heading text-foreground tracking-[-0.02em] mb-6"
          >
            Ready to level up your coaching?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-lg text-muted-foreground mb-10"
          >
            Start free. No credit card required.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Button onClick={() => navigate('/pricing')} size="lg" className="text-lg px-10 h-14 btn-pulse-glow">
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
