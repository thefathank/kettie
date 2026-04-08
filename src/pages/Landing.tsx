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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <Logo size="md" />
            <span className="text-xl md:text-2xl font-bold text-foreground">Pro Pointers Plus</span>
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

        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Professional Tennis Coaching Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Streamline your coaching business with powerful tools for scheduling, client management, and payment tracking.
          </p>
          <Button onClick={() => navigate('/pricing')} size="lg" className="text-lg px-8">
            Get Started Free
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <Calendar className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Smart Scheduling</h3>
            <p className="text-muted-foreground">Manage sessions and track your coaching calendar efficiently.</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Client Management</h3>
            <p className="text-muted-foreground">Keep detailed records of all your clients and their progress.</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <CreditCard className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Payment Tracking</h3>
            <p className="text-muted-foreground">Monitor payments and maintain financial records seamlessly.</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Lesson Builder</h3>
            <p className="text-muted-foreground">Create reusable lesson templates and assign custom plans to clients.</p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-6xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">How It Works</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Get started in minutes and transform how you manage your coaching business.
          </p>
          
          <div className="space-y-16">
            {/* Step 1 */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</span>
                  <h3 className="text-xl font-semibold text-foreground">Add Your Clients</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Build your client roster with detailed profiles including skill levels, contact info, and notes. Track each player's journey from day one.
                </p>
              </div>
              <div className="order-1 lg:order-2">
                <img 
                  src={mockupDashboard} 
                  alt="Client management dashboard" 
                  className="rounded-xl shadow-2xl border border-border w-full"
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-1 lg:order-1">
                <img 
                  src={mockupSchedule} 
                  alt="Schedule management interface" 
                  className="rounded-xl shadow-2xl border border-border w-full"
                />
              </div>
              <div className="order-2 lg:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">2</span>
                  <h3 className="text-xl font-semibold text-foreground">Schedule Sessions</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Set up one-time or recurring lessons with ease. Let clients self-book through Cal.com integration, or manually manage your calendar.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">3</span>
                  <h3 className="text-xl font-semibold text-foreground">Build & Share Lesson Plans</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Create reusable lesson templates with exercises, notes, and instructional videos. Email customized plans directly to your clients after each session.
                </p>
              </div>
              <div className="order-1 lg:order-2">
                <img 
                  src={mockupLessons} 
                  alt="Lesson templates builder" 
                  className="rounded-xl shadow-2xl border border-border w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Who It's For Section */}
      </div>
      <div className="bg-secondary/30 py-16 mt-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">Who It's For</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Whether you're teaching one-on-one or managing a full academy, Pro Pointers Plus adapts to your coaching style.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <img src={coachPrivate} alt="Private lesson coach" className="w-12 h-12 rounded-lg object-cover mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Private Lesson Coach</h3>
              <p className="text-sm text-muted-foreground">
                Track individual client progress, manage payments per session or package, and send personalized lesson plans after each practice.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <img src={coachSchool} alt="School team coach" className="w-12 h-12 rounded-lg object-cover mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">High School / College Coach</h3>
              <p className="text-sm text-muted-foreground">
                Organize team rosters, schedule group sessions, and keep detailed notes on each player's development throughout the season.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <img src={coachClub} alt="Club pro" className="w-12 h-12 rounded-lg object-cover mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Club Pro</h3>
              <p className="text-sm text-muted-foreground">
                Handle recurring clients with ease, track session packages, and let members book their own lessons through Cal.com integration.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <img src={coachAcademy} alt="Tennis academy" className="w-12 h-12 rounded-lg object-cover mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Tennis Academies</h3>
              <p className="text-sm text-muted-foreground">
                Scale your operations with a centralized system for managing multiple coaches, students, and payment records all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Testimonials Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">What Coaches Are Saying</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground italic mb-4">"Pro Pointers Plus has completely transformed how I manage my clients. The lesson builder alone saves me hours each week."</p>
              <p className="font-semibold text-card-foreground">— Sarah M.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground italic mb-4">"Finally, a tool built by someone who understands tennis coaching. Payment tracking and scheduling in one place is a game changer."</p>
              <p className="font-semibold text-card-foreground">— Marcus T.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground italic mb-4">"My students love receiving personalized lesson plans. It keeps them motivated and shows them I'm invested in their progress."</p>
              <p className="font-semibold text-card-foreground">— Jennifer K.</p>
            </div>
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
