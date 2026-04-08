import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Crown, Zap, Building2 } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { plan } = useParams<{ plan: string }>();
  const selectedPlan = plan || 'free';
  const { signUp, user, session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && session) {
      if (selectedPlan === 'unlimited' && !pendingCheckout) {
        handleCheckoutRedirect();
      } else if (selectedPlan === 'academy' && !pendingCheckout) {
        handleAcademyCheckoutRedirect();
      } else if (!pendingCheckout) {
        navigate('/');
      }
    }
  }, [user, session, selectedPlan, pendingCheckout]);

  const handleCheckoutRedirect = async () => {
    if (!session) return;
    
    setPendingCheckout(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Note",
        description: "Account created! You can upgrade to Unlimited anytime from Settings.",
      });
      navigate('/');
    } finally {
      setPendingCheckout(false);
    }
  };

  const handleAcademyCheckoutRedirect = async () => {
    if (!session) return;
    
    const academyName = sessionStorage.getItem('pendingAcademyName');
    if (!academyName) {
      toast({
        title: "Note",
        description: "Account created! You can set up your academy from the Pricing page.",
      });
      navigate('/pricing');
      return;
    }
    
    setPendingCheckout(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-academy', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          academy_name: academyName,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        sessionStorage.removeItem('pendingAcademyName');
        window.location.href = data.url;
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Academy checkout error:', error);
      toast({
        title: "Note",
        description: "Account created! You can set up your academy from the Pricing page.",
      });
      sessionStorage.removeItem('pendingAcademyName');
      navigate('/pricing');
    } finally {
      setPendingCheckout(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    } else {
      toast({
        title: "Success",
        description: selectedPlan === 'unlimited' || selectedPlan === 'academy'
          ? "Account created! Redirecting to payment..." 
          : "Account created successfully!"
      });
      if (selectedPlan !== 'unlimited' && selectedPlan !== 'academy') {
        navigate('/');
      }
      setLoading(false);
    }
  };

  const getPlanBadge = () => {
    if (selectedPlan === 'academy') {
      return (
        <Badge variant="default" className="flex items-center gap-1 px-3 py-1 bg-amber-500">
          <Building2 className="h-3 w-3" />
          Academy Plan - $49/mo
        </Badge>
      );
    }
    if (selectedPlan === 'unlimited') {
      return (
        <Badge variant="default" className="flex items-center gap-1 px-3 py-1">
          <Crown className="h-3 w-3" />
          Unlimited Plan - $10/mo
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
        <Zap className="h-3 w-3" />
        Free Plan
      </Badge>
    );
  };

  const isPaidPlan = selectedPlan === 'unlimited' || selectedPlan === 'academy';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4 relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/pricing')}
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Pricing
      </Button>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <span className="text-2xl">🎾</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Start managing your coaching business</CardDescription>
          
          {/* Show selected plan badge */}
          <div className="flex justify-center mt-4">
            {getPlanBadge()}
          </div>
          {isPaidPlan && (
            <p className="text-xs text-muted-foreground mt-2">
              You'll be redirected to complete payment after signing up
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <Input
                id="signup-name"
                name="fullName"
                type="text"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                placeholder="coach@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || pendingCheckout}>
              {loading ? "Creating account..." : pendingCheckout ? "Redirecting to payment..." : isPaidPlan ? "Sign Up & Continue to Payment" : "Sign Up"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth" className="text-primary hover:underline">
                Sign In
              </Link>
            </p>
            <p className="text-xs text-center text-muted-foreground mt-4">
              By signing up, you agree to our{" "}
              <Link to="/terms" target="_blank" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" target="_blank" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;