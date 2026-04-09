import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const Settings = () => {
  const { user, session } = useAuth();
  const { tier, subscribed, subscriptionEnd, loading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (values: { full_name: string; phone: string; cal_username: string }) => {
      if (!user) throw new Error("No user");
      const { error } = await supabase.from("profiles").update(values).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast({ title: "Success", description: "Profile updated successfully" });
      setIsEditing(false);
    },
    onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }); },
  });

  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSaveClick = () => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    updateProfile.mutate({ full_name: formData.get("full_name") as string, phone: formData.get("phone") as string, cal_username: formData.get("cal_username") as string });
  };

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cal-webhook`;

  const handleManageSubscription = async () => {
    if (!session) return;
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Portal error:', error);
      toast({ title: "Error", description: "Failed to open subscription management. Please try again.", variant: "destructive" });
    } finally { setPortalLoading(false); }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Subscription
            </CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionLoading ? (
              <Skeleton className="h-20 w-full bg-white/[0.06]" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${subscribed ? 'bg-primary/10' : 'bg-white/[0.06]'}`}>
                      {subscribed ? <Crown className="w-5 h-5 text-primary" /> : <Check className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{tier === 'unlimited' ? 'Unlimited Plan' : 'Free Plan'}</span>
                        <Badge variant={subscribed ? 'default' : 'secondary'}>{subscribed ? 'Active' : 'Free'}</Badge>
                      </div>
                      {subscriptionEnd && <p className="text-sm text-muted-foreground">Renews on {format(new Date(subscriptionEnd), 'MMM d, yyyy')}</p>}
                      {!subscribed && <p className="text-sm text-muted-foreground">Limited to 1 client, 1 template, and 1 lesson plan</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {subscribed ? (
                      <Button variant="outline" onClick={handleManageSubscription} disabled={portalLoading}>
                        {portalLoading ? 'Loading...' : 'Manage Subscription'}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={() => navigate('/pricing')}>Upgrade to Unlimited</Button>
                    )}
                  </div>
                </div>
                {!subscribed && (
                  <div className="p-4 border border-primary/20 rounded-xl bg-primary/5">
                    <h4 className="font-medium mb-2">Upgrade to Unlimited for $10/month</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {["Unlimited clients", "Unlimited lesson templates", "Unlimited lesson plans", "Email clients directly"].map((item) => (
                        <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full bg-white/[0.06]" />)}
              </div>
            ) : (
              <form ref={formRef} key={profile?.updated_at} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ""} disabled={!isEditing} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={profile?.email || ""} disabled className="bg-white/[0.03]" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" defaultValue={profile?.phone || ""} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cal_username">Cal.com Username</Label>
                  <Input id="cal_username" name="cal_username" placeholder="your-username" defaultValue={profile?.cal_username || ""} disabled={!isEditing} />
                  <p className="text-xs text-muted-foreground">Your Cal.com username (e.g., if your booking link is cal.com/john, enter "john")</p>
                </div>
                {profile?.cal_username && (
                  <div className="space-y-2 p-4 bg-white/[0.03] rounded-xl">
                    <Label>Cal.com Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                      <Button type="button" variant="outline" onClick={() => { navigator.clipboard.writeText(webhookUrl); toast({ title: "Copied!", description: "Webhook URL copied to clipboard" }); }}>Copy</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Add this webhook URL to your Cal.com event type settings to automatically create sessions when clients book</p>
                  </div>
                )}
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button type="button" onClick={handleSaveClick} disabled={updateProfile.isPending}>{updateProfile.isPending ? "Saving..." : "Save Changes"}</Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={updateProfile.isPending}>Cancel</Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
