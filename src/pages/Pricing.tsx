import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, X, Crown, Zap, Tag, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
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
      // Store academy name and redirect to register
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
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1
              className="text-xl font-bold text-primary cursor-pointer"
              onClick={() => navigate('/')}
            >
              Pro Pointers Plus
            </h1>
            {user ? (
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>
        </header>

        {/* Pricing Content */}
        <main className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade when you're ready to grow your coaching business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <Card className={`relative ${tier === 'free' && user ? 'ring-2 ring-primary' : ''}`}>
              {tier === 'free' && user && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Your Plan
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {features.free.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6"
                  variant={tier === 'free' && !!user ? 'outline' : 'default'}
                  onClick={handleGetStartedFree}
                  disabled={tier === 'free' && !!user}
                >
                  {tier === 'free' && user ? 'Current Plan' : 'Get Started Free'}
                </Button>
              </CardContent>
            </Card>

            {/* Unlimited Tier */}
            <Card className={`relative border-primary ${tier === 'unlimited' ? 'ring-2 ring-primary' : ''}`}>
              {tier === 'unlimited' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Your Plan
                  </span>
                </div>
              )}
              <div className="absolute -top-3 right-4">
                <span className="bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Unlimited</CardTitle>
                <CardDescription>For growing coaches</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$10</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 italic">
                  Less than 10% of one lesson
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {features.unlimited.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                {tier !== 'unlimited' && tier !== 'academy' && (
                  <div className="flex items-center gap-2 mt-4">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                )}
                <Button
                  className="w-full mt-4"
                  onClick={tier === 'unlimited' || tier === 'academy' ? () => navigate('/dashboard') : handleUpgrade}
                  disabled={checkoutLoading || loading}
                >
                  {checkoutLoading ? 'Loading...' : tier === 'unlimited' || tier === 'academy' ? 'Go to Dashboard' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>

            {/* Academy Tier */}
            <Card className={`relative border-amber-500 ${tier === 'academy' ? 'ring-2 ring-amber-500' : ''}`}>
              {tier === 'academy' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Your Plan
                  </span>
                </div>
              )}
              <div className="absolute -top-3 right-4">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Teams
                </span>
              </div>
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-amber-500" />
                </div>
                <CardTitle className="text-2xl">Academy</CardTitle>
                <CardDescription>For tennis academies & clubs</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 italic">
                  Unlimited coaches, one subscription
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {features.academy.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <span className="text-foreground">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-4 bg-amber-500 hover:bg-amber-600"
                  onClick={tier === 'academy' ? () => navigate('/academy') : () => setAcademyDialogOpen(true)}
                  disabled={checkoutLoading || loading}
                >
                  {tier === 'academy' ? 'Go to Academy' : 'Get Started'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ or Additional Info */}
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
            <Button variant="outline" onClick={() => setAcademyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAcademyCheckout}
              disabled={checkoutLoading || !academyName.trim()}
              className="bg-amber-500 hover:bg-amber-600"
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
