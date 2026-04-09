import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, CreditCard, BookOpen, Star } from "lucide-react";
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

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: "easeOut" },
};

const Landing = () => {
  const navigate = useNavigate();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [navOpaque, setNavOpaque] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavOpaque(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  const features = [
    { icon: Calendar, title: "Smart Scheduling", desc: "Manage sessions and track your coaching calendar efficiently." },
    { icon: Users, title: "Client Management", desc: "Keep detailed records of all your clients and their progress." },
    { icon: CreditCard, title: "Payment Tracking", desc: "Monitor payments and maintain financial records seamlessly." },
    { icon: BookOpen, title: "Lesson Builder", desc: "Create reusable lesson templates and assign custom plans to clients." },
  ];

  const steps = [
    { step: "1", title: "Add Your Clients", desc: "Build your client roster with detailed profiles including skill levels, contact info, and notes. Track each player's journey from day one.", img: mockupDashboard, alt: "Client management dashboard" },
    { step: "2", title: "Schedule Sessions", desc: "Set up one-time or recurring lessons with ease. Let clients self-book through Cal.com integration, or manually manage your calendar.", img: mockupSchedule, alt: "Schedule management interface" },
    { step: "3", title: "Build & Share Lesson Plans", desc: "Create reusable lesson templates with exercises, notes, and instructional videos. Email customized plans directly to your clients after each session.", img: mockupLessons, alt: "Lesson templates builder" },
  ];

  const coachTypes = [
    { img: coachPrivate, alt: "Private lesson coach", title: "Private Lesson Coach", desc: "Track individual client progress, manage payments per session or package, and send personalized lesson plans after each practice." },
    { img: coachSchool, alt: "School team coach", title: "High School / College Coach", desc: "Organize team rosters, schedule group sessions, and keep detailed notes on each player's development throughout the season." },
    { img: coachClub, alt: "Club pro", title: "Club Pro", desc: "Handle recurring clients with ease, track session packages, and let members book their own lessons through Cal.com integration." },
    { img: coachAcademy, alt: "Tennis academy", title: "Tennis Academies", desc: "Scale your operations with a centralized system for managing multiple coaches, students, and payment records all in one place." },
  ];

  const testimonials = [
    { quote: "Pro Pointers Plus has completely transformed how I manage my clients. The lesson builder alone saves me hours each week.", author: "Sarah M." },
    { quote: "Finally, a tool built by someone who understands tennis coaching. Payment tracking and scheduling in one place is a game changer.", author: "Marcus T." },
    { quote: "My students love receiving personalized lesson plans. It keeps them motivated and shows them I'm invested in their progress.", author: "Jennifer K." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          navOpaque
            ? "bg-black/80 backdrop-blur-xl border-white/[0.06]"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Logo size="md" />
            <span className="text-xl md:text-2xl font-bold font-heading text-foreground">Pro Pointers Plus</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button onClick={() => setWaitlistOpen(true)} variant="ghost" className="text-xs md:text-sm px-2 md:px-4">
              <span className="hidden sm:inline">Player? </span>Join Waitlist
            </Button>
            <Button onClick={() => navigate('/pricing')} variant="ghost" className="text-xs md:text-sm px-2 md:px-4">
              Pricing
            </Button>
            <Button onClick={() => navigate('/auth')} variant="outline" className="text-xs md:text-sm px-2 md:px-4">
              Sign In
            </Button>
          </div>
        </div>
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
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-16">
        {/* Animated mesh background */}
        <div className="hero-mesh">
          <div className="mesh-blob" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black font-heading text-foreground tracking-[-0.02em] mb-6 max-w-5xl mx-auto leading-[0.95]"
          >
            Professional Tennis Coaching Management
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Streamline your coaching business with powerful tools for scheduling, client management, and payment tracking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex items-center justify-center gap-4 mb-20"
          >
            <Button onClick={() => navigate('/pricing')} size="lg" className="text-lg px-8 btn-pulse-glow">
              Get Started Free
            </Button>
            <Button onClick={() => navigate('/demo/dashboard')} size="lg" variant="outline" className="text-lg px-8">
              See Demo
            </Button>
          </motion.div>

          {/* Floating mockup stack */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="relative max-w-4xl mx-auto h-[280px] md:h-[400px] lg:h-[480px]"
          >
            {/* Back card */}
            <div className="absolute left-[5%] top-[10%] w-[55%] glass rounded-2xl p-1.5 rotate-[-4deg] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <img src={mockupSchedule} alt="Schedule view" className="rounded-xl w-full" />
            </div>
            {/* Middle card */}
            <div className="absolute right-[5%] top-[5%] w-[55%] glass rounded-2xl p-1.5 rotate-[3deg] shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
              <img src={mockupLessons} alt="Lessons view" className="rounded-xl w-full" />
            </div>
            {/* Front card */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[0%] w-[60%] glass rounded-2xl p-1.5 shadow-[0_30px_80px_rgba(16,185,129,0.1)] z-10">
              <img src={mockupDashboard} alt="Dashboard view" className="rounded-xl w-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Powerful tools designed specifically for tennis coaches.</p>
          </motion.div>

          <div className="max-w-6xl mx-auto space-y-12">
            {features.map((feature, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}
                >
                  <div className="flex-1">
                    <div className="glass glass-hover rounded-2xl p-8 md:p-10">
                      <feature.icon className="h-10 w-10 text-primary mb-4" />
                      <h3 className="text-2xl font-bold font-heading text-foreground mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Get started in minutes and transform how you manage your coaching business.</p>
          </motion.div>

          <div className="max-w-6xl mx-auto space-y-20">
            {steps.map((item, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                  className={`grid lg:grid-cols-2 gap-10 items-center`}
                >
                  <div className={isEven ? "order-2 lg:order-1" : "order-2"}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm font-mono">{item.step}</span>
                      <h3 className="text-2xl font-bold font-heading text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">{item.desc}</p>
                  </div>
                  <div className={isEven ? "order-1 lg:order-2" : "order-1"}>
                    <div className="glass rounded-2xl p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                      <img src={item.img} alt={item.alt} className="rounded-xl w-full" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== WHO IT'S FOR ===== */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-foreground mb-4">Who It's For</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Whether you're teaching one-on-one or managing a full academy, Pro Pointers Plus adapts to your coaching style.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coachTypes.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass glass-hover rounded-2xl p-6 transition-transform duration-200 hover:scale-[1.02]"
              >
                <img src={item.img} alt={item.alt} className="w-14 h-14 rounded-xl object-cover mb-4" />
                <h3 className="text-lg font-semibold font-heading text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-foreground">What Coaches Are Saying</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass glass-hover rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-4 text-sm leading-relaxed">"{t.quote}"</p>
                <p className="font-semibold text-foreground text-sm">— {t.author}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeInUp} className="text-center mt-16">
            <Button onClick={() => navigate('/pricing')} size="lg" className="text-lg px-8 btn-pulse-glow">
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
