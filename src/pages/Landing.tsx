import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Users, CreditCard, BookOpen, Video, Building2, BarChart3,
  ArrowRight, Play, ChevronRight, Zap, Shield, Clock, Menu, X
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
import mockupDashboard from "@/assets/mockup-dashboard.png";
import mockupSchedule from "@/assets/mockup-schedule.png";
import mockupLessons from "@/assets/mockup-lessons.png";

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
    const manualMinPerSession = 18; // scheduling, notes, follow-up, payment tracking
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

  const scenes = [
    { title: "Your command center", bullets: ["At-a-glance stats for sessions, revenue, and clients", "Today's schedule front and center", "Quick actions to add clients and sessions"], img: mockupDashboard, alt: "Dashboard" },
    { title: "Scheduling, simplified", bullets: ["Calendar view with drag-and-drop sessions", "Recurring session support", "Client self-booking via Cal.com integration"], img: mockupSchedule, alt: "Schedule" },
    { title: "Lessons that stick", bullets: ["Reusable lesson templates with exercises", "Assign plans to clients after each session", "Email lesson plans directly to clients"], img: mockupLessons, alt: "Lessons" },
  ];

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
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">Features</a>
            <button onClick={() => navigate('/pricing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">Pricing</button>
            <button onClick={() => navigate('/blog')} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">Blog</button>
            <Button onClick={() => navigate('/auth')} variant="ghost" size="sm">Sign In</Button>
            <Button onClick={() => navigate('/pricing')} size="sm" className="btn-pulse-glow">Get Started</Button>
          </div>
          {/* Mobile hamburger */}
          <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {/* Mobile menu */}
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
      <section ref={heroRef} className="relative min-h-[100vh] flex flex-col items-center overflow-hidden pt-32 md:pt-40">
        {/* Subtle background — no mesh, just a faint radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/[0.04] blur-[150px]" />
        </div>

        {/* Decorative arc lines behind the mockup */}
        <svg className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none opacity-20" viewBox="0 0 900 500" fill="none">
          <ellipse cx="450" cy="500" rx="400" ry="350" stroke="hsl(var(--primary))" strokeWidth="1" />
          <ellipse cx="450" cy="500" rx="320" ry="280" stroke="hsl(var(--primary) / 0.5)" strokeWidth="0.5" />
          <ellipse cx="550" cy="520" rx="350" ry="300" stroke="hsl(var(--destructive) / 0.3)" strokeWidth="0.5" />
        </svg>

        {/* Centered text */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-[76px] font-black font-heading text-foreground tracking-[-0.03em] leading-[1] mb-6 italic"
          >
            Do what you love coaching.<br />We'll handle the rest.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 font-medium"
          >
            Modern coaching management for tennis pros and academies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button
              onClick={() => navigate('/pricing')}
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 text-sm font-semibold uppercase tracking-wider h-12"
            >
              <ArrowRight className="mr-2 h-4 w-4" /> Get Started Free
            </Button>
          </motion.div>
        </div>

        {/* Large mockup — centered, bottom-aligned, bleeding below fold */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="relative z-10 w-full max-w-5xl mx-auto mt-16 px-4"
          onMouseMove={handleMouseMove}
        >
          <div style={{ perspective: "1200px" }}>
            <div
              className="relative rounded-xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)] border border-white/[0.08]"
              style={{
                transform: `rotateY(${mousePos.x * 4}deg) rotateX(${-mousePos.y * 3}deg)`,
                transformStyle: "preserve-3d",
                transition: "transform 0.1s ease-out",
              }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a1a1a]">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                <div className="flex-1 mx-6 h-6 bg-white/[0.06] rounded-md" />
              </div>
              <img src={mockupDashboard} alt="Pro Pointers Plus Dashboard" className="w-full block" loading="eager" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== BENTO FEATURE GRID ===== */}
      <section id="features" className="py-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-16"
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

      {/* ===== PRODUCT IN ACTION — SCROLL SCENES ===== */}
      <section className="py-28 border-t border-white/[0.04]">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black font-heading text-foreground tracking-[-0.02em] mb-20"
          >
            See it in action.
          </motion.h2>

          <div className="space-y-32">
            {scenes.map((scene, i) => (
              <motion.div
                key={scene.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "direction-rtl" : ""}`}
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <h3 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-6 tracking-[-0.01em]">{scene.title}</h3>
                  <ul className="space-y-3">
                    {scene.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="glass rounded-2xl p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                    <img src={scene.img} alt={scene.alt} className="rounded-xl w-full" loading="lazy" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHO IT'S FOR ===== */}
      <section className="py-28 border-t border-white/[0.04]">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
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
      <section className="py-28 border-t border-white/[0.04]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy + slider */}
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

            {/* Right — visual bars + savings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-end gap-8 justify-center"
            >
              {/* Manual bar */}
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

              {/* App bar */}
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

              {/* Annual savings box */}
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
      <section className="py-16 border-t border-b border-white/[0.04] bg-white/[0.02]">
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
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full bg-primary/8 blur-[150px]" />
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
