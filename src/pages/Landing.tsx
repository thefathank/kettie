import { useState } from "react";
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

const Landing = () => {
  const navigate = useNavigate();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/[0.06]">
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

      {/* Hero */}
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 text-foreground tracking-tight">
              Professional Tennis Coaching Management
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Streamline your coaching business with powerful tools for scheduling, client management, and payment tracking.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={() => navigate('/pricing')} size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
              <Button onClick={() => navigate('/demo/dashboard')} size="lg" variant="outline" className="text-lg px-8">
                See Demo
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Calendar, title: "Smart Scheduling", desc: "Manage sessions and track your coaching calendar efficiently." },
              { icon: Users, title: "Client Management", desc: "Keep detailed records of all your clients and their progress." },
              { icon: CreditCard, title: "Payment Tracking", desc: "Monitor payments and maintain financial records seamlessly." },
              { icon: BookOpen, title: "Lesson Builder", desc: "Create reusable lesson templates and assign custom plans to clients." },
            ].map((feature) => (
              <div key={feature.title} className="glass glass-hover rounded-2xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  <feature.icon className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold font-heading mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="max-w-6xl mx-auto mt-24">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-4 text-foreground">How It Works</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Get started in minutes and transform how you manage your coaching business.
            </p>
            
            <div className="space-y-16">
              {[
                { step: "1", title: "Add Your Clients", desc: "Build your client roster with detailed profiles including skill levels, contact info, and notes. Track each player's journey from day one.", img: mockupDashboard, alt: "Client management dashboard", reverse: false },
                { step: "2", title: "Schedule Sessions", desc: "Set up one-time or recurring lessons with ease. Let clients self-book through Cal.com integration, or manually manage your calendar.", img: mockupSchedule, alt: "Schedule management interface", reverse: true },
                { step: "3", title: "Build & Share Lesson Plans", desc: "Create reusable lesson templates with exercises, notes, and instructional videos. Email customized plans directly to your clients after each session.", img: mockupLessons, alt: "Lesson templates builder", reverse: false },
              ].map((item) => (
                <div key={item.step} className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className={item.reverse ? "order-2" : "order-2 lg:order-1"}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm font-mono">{item.step}</span>
                      <h3 className="text-xl font-semibold font-heading text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">{item.desc}</p>
                  </div>
                  <div className={item.reverse ? "order-1" : "order-1 lg:order-2"}>
                    <img 
                      src={item.img} 
                      alt={item.alt} 
                      className="rounded-2xl border border-white/[0.06] w-full shadow-[0_0_40px_rgba(16,185,129,0.05)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Who It's For */}
      <div className="py-20 border-t border-white/[0.06]">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-4 text-foreground">Who It's For</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Whether you're teaching one-on-one or managing a full academy, Pro Pointers Plus adapts to your coaching style.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: coachPrivate, alt: "Private lesson coach", title: "Private Lesson Coach", desc: "Track individual client progress, manage payments per session or package, and send personalized lesson plans after each practice." },
              { img: coachSchool, alt: "School team coach", title: "High School / College Coach", desc: "Organize team rosters, schedule group sessions, and keep detailed notes on each player's development throughout the season." },
              { img: coachClub, alt: "Club pro", title: "Club Pro", desc: "Handle recurring clients with ease, track session packages, and let members book their own lessons through Cal.com integration." },
              { img: coachAcademy, alt: "Tennis academy", title: "Tennis Academies", desc: "Scale your operations with a centralized system for managing multiple coaches, students, and payment records all in one place." },
            ].map((item) => (
              <div key={item.title} className="glass glass-hover rounded-2xl p-6 transition-all duration-150 hover:scale-[1.02]">
                <img src={item.img} alt={item.alt} className="w-12 h-12 rounded-lg object-cover mb-4" />
                <h3 className="text-lg font-semibold font-heading mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto py-20">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-12 text-foreground">What Coaches Are Saying</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Pro Pointers Plus has completely transformed how I manage my clients. The lesson builder alone saves me hours each week.", author: "Sarah M." },
              { quote: "Finally, a tool built by someone who understands tennis coaching. Payment tracking and scheduling in one place is a game changer.", author: "Marcus T." },
              { quote: "My students love receiving personalized lesson plans. It keeps them motivated and shows them I'm invested in their progress.", author: "Jennifer K." },
            ].map((t) => (
              <div key={t.author} className="glass glass-hover rounded-2xl p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-4">"{t.quote}"</p>
                <p className="font-semibold text-foreground">— {t.author}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button onClick={() => navigate('/pricing')} size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Landing;
