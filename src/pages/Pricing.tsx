import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Crown, Zap, Tag, Building2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const Pricing = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { tier, subscribed, loading } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [academyCouponCode, setAcademyCouponCode] = useState("");
  const [academyDialogOpen, setAcademyDialogOpen] = useState(false);
  const [academyName, setAcademyName] = useState("");

  const handleUpgrade = async () => {
    if (!user || !session) {
      navigate('/register/unlimited');
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: couponCode.trim() ? { coupon_code: couponCode.trim() } : undefined,
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleAcademyCheckout = async () => {
    if (!academyName.trim()) {
      toast.error('Please enter your academy name');
      return;
    }

    if (!user || !session) {
      sessionStorage.setItem('pendingAcademyName', academyName);
      navigate('/register/academy');
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-academy', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          academy_name: academyName.trim(),
          coupon_code: academyCouponCode.trim() || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Academy checkout error:', error);
      toast.error(error.message || 'Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
      setAcademyDialogOpen(false);
    }
  };

  const handleGetStartedFree = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register/free');
    }
  };

  const features = {
    free: [
      { text: "1 Client", included: true },
      { text: "1 Lesson Template", included: true },
      { text: "1 Lesson Plan", included: true },
      { text: "Session Scheduling", included: true },
      { text: "Payment Tracking", included: true },
      { text: "Progress Notes", included: true },
      { text: "Unlimited Clients", included: false },
      { text: "Unlimited Templates", included: false },
      { text: "Unlimited Lesson Plans", included: false },
    ],
    unlimited: [
      { text: "Unlimited Clients", included: true },
      { text: "Unlimited Lesson Templates", included: true },
      { text: "Unlimited Lesson Plans", included: true },
      { text: "Session Scheduling", included: true },
      { text: "Payment Tracking", included: true },
      { text: "Progress Notes", included: true },
      { text: "Email Clients Directly", included: true },
      { text: "Instruction Video Library", included: true },
      { text: "Priority Support", included: true },
    ],
    academy: [
      { text: "Everything in Unlimited", included: true },
      { text: "Unlimited Coaches", included: true },
      { text: "Team Dashboard & Overview", included: true },
      { text: "User Management", included: true },
      { text: "Shared Client Visibility", included: true },
      { text: "Shared Lesson Templates", included: true },
      { text: "Individual Coach Schedules", included: true },
      { text: "Centralized Payment Tracking", included: true },
      { text: "Email Invitations for Coaches", included: true },
    ],
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-white/[0.06] bg-black/60 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/landing')} className="text-muted-foreground hover:text-foreground transition-colors duration-150">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/landing')}>
                <Logo size="sm" />
                <span className="text-xl font-bold font-heading text-foreground">Pro Pointers Plus</span>
              </div>
            </div>
            {user ? (
              <Button variant="outline" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            ) : (
              <Button variant="outline" onClick={() => navigate('/auth')}>Sign In</Button>
            )}
          </div>
        </header>

        {/* Pricing Content */}
        <main className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading text-foreground mb-4 tracking-[-0.02em]">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade when you're ready to grow your coaching business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className={`glass rounded-2xl p-8 relative ${tier === 'free' && user ? 'ring-2 ring-primary' : ''}`}>
              {tier === 'free' && user && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">Your Plan</span>
                </div>
              )}
              <div className="w-10 h-10 bg-white/[0.06] rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground mb-1">Free</h3>
              <p className="text-sm text-muted-foreground mb-6">Perfect for getting started</p>
              <div className="mb-8">
                <span className="text-5xl font-bold font-mono text-foreground">$0</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-foreground' : 'text-muted-foreground/50'}>{feature.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={tier === 'free' && !!user ? 'outline' : 'default'}
                onClick={handleGetStartedFree}
                disabled={tier === 'free' && !!user}
              >
                {tier === 'free' && user ? 'Current Plan' : 'Get Started Free'}
              </Button>
            </div>

            {/* Unlimited Tier */}
            <div className={`glass rounded-2xl p-8 relative border-primary/30 shadow-[0_0_60px_rgba(16,185,129,0.06)] ${tier === 'unlimited' ? 'ring-2 ring-primary' : ''}`}>
              {tier === 'unlimited' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">Your Plan</span>
                </div>
              )}
              <div className="absolute -top-3 right-4">
                <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">Most Popular</span>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground mb-1">Unlimited</h3>
              <p className="text-sm text-muted-foreground mb-6">For growing coaches</p>
              <div className="mb-2">
                <span className="text-5xl font-bold font-mono text-foreground">$10</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mb-8 italic">Less than 10% of one lesson</p>
              <ul className="space-y-3 mb-8">
                {features.unlimited.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground">{feature.text}</span>
                  </li>
                ))}
              </ul>
              {tier !== 'unlimited' && tier !== 'academy' && (
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1" />
                </div>
              )}
              <Button
                className="w-full"
                onClick={tier === 'unlimited' || tier === 'academy' ? () => navigate('/dashboard') : handleUpgrade}
                disabled={checkoutLoading || loading}
              >
                {checkoutLoading ? 'Loading...' : tier === 'unlimited' || tier === 'academy' ? 'Go to Dashboard' : 'Upgrade Now'}
              </Button>
            </div>

            {/* Academy Tier */}
            <div className={`glass rounded-2xl p-8 relative border-accent/20 ${tier === 'academy' ? 'ring-2 ring-accent' : ''}`}>
              {tier === 'academy' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">Your Plan</span>
                </div>
              )}
              <div className="absolute -top-3 right-4">
                <span className="bg-accent/90 text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">Teams</span>
              </div>
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground mb-1">Academy</h3>
              <p className="text-sm text-muted-foreground mb-6">For tennis academies & clubs</p>
              <div className="mb-2">
                <span className="text-5xl font-bold font-mono text-foreground">$49</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mb-8 italic">Unlimited coaches, one subscription</p>
              <ul className="space-y-3 mb-8">
                {features.academy.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-foreground">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={tier === 'academy' ? () => navigate('/academy') : () => setAcademyDialogOpen(true)}
                disabled={checkoutLoading || loading}
              >
                {tier === 'academy' ? 'Go to Academy' : 'Get Started'}
              </Button>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              Questions? Contact us at{' '}
              <a href="mailto:propointers.tennis@gmail.com" className="text-primary hover:underline">
                propointers.tennis@gmail.com
              </a>
            </p>
          </div>
        </main>
      </div>
      <Footer />

      {/* Academy Name Dialog */}
      <Dialog open={academyDialogOpen} onOpenChange={setAcademyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Your Academy</DialogTitle>
            <DialogDescription>
              Enter your academy or club name to get started. You'll be the admin and can invite coaches after setup.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="academy-name">Academy Name</Label>
              <Input
                id="academy-name"
                placeholder="e.g., Sunshine Tennis Academy"
                value={academyName}
                onChange={(e) => setAcademyName(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Coupon code (optional)"
                value={academyCouponCode}
                onChange={(e) => setAcademyCouponCode(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcademyDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAcademyCheckout}
              disabled={checkoutLoading || !academyName.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {checkoutLoading ? 'Loading...' : 'Continue to Checkout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
