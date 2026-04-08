import { Layout } from "@/components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, Calendar, Link2, Copy } from "lucide-react";
import { format } from "date-fns";
import { AddNoteDialog } from "@/components/AddNoteDialog";
import { AddVideoDialog } from "@/components/AddVideoDialog";
import { AddPaymentDialog } from "@/components/AddPaymentDialog";
import { NotesList } from "@/components/NotesList";
import { VideosList } from "@/components/VideosList";
import { PaymentsList } from "@/components/PaymentsList";
import { LessonPlansList } from "@/components/LessonPlansList";
import { useToast } from "@/hooks/use-toast";

const ClientDetails = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch coach profile separately as it's user-level data that can be cached
  const { data: coachProfile } = useQuery({
    queryKey: ["coach-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("cal_username")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Combine client and session balance queries for faster loading
  const { data: clientData, isLoading } = useQuery({
    queryKey: ["client-details", clientId, user?.id],
    queryFn: async () => {
      if (!user?.id || !clientId) return null;

      // Fetch client and payments in parallel
      const [clientResult, paymentsResult] = await Promise.all([
        supabase
          .from("clients")
          .select("*")
          .eq("id", clientId)
          .eq("coach_id", user.id)
          .single(),
        supabase
          .from("payments")
          .select("sessions_covered, sessions_remaining")
          .eq("client_id", clientId)
          .eq("coach_id", user.id)
          .eq("payment_status", "completed")
      ]);

      if (clientResult.error) throw clientResult.error;
      if (paymentsResult.error) throw paymentsResult.error;

      // Calculate session balance
      const payments = paymentsResult.data || [];
      const totalCovered = payments.reduce((sum, p) => sum + (p.sessions_covered || 0), 0);
      const totalRemaining = payments.reduce((sum, p) => sum + (p.sessions_remaining || 0), 0);
      const totalUsed = totalCovered - totalRemaining;

      return {
        client: clientResult.data,
        sessionBalance: { totalCovered, totalRemaining, totalUsed }
      };
    },
    enabled: !!user?.id && !!clientId,
  });

  const client = clientData?.client;
  const sessionBalance = clientData?.sessionBalance;

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Client not found</p>
          <Button onClick={() => navigate("/clients")} className="mt-4">
            Back to Clients
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{client.full_name}</h1>
            <p className="text-muted-foreground">Client Profile</p>
          </div>
          <Badge variant={client.status === "active" ? "default" : "secondary"}>
            {client.status}
          </Badge>
        </div>

        {/* Client Info Card */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.skill_level && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Skill Level:</span>
                    <Badge variant="secondary">{client.skill_level}</Badge>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {format(new Date(client.created_at), "MMM d, yyyy")}</span>
                </div>
              </div>
              {client.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Notes:</p>
                  <p className="text-sm">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionBalance ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {sessionBalance.totalRemaining}
                      </div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{sessionBalance.totalUsed}</div>
                      <p className="text-sm text-muted-foreground">Used</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{sessionBalance.totalCovered}</div>
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <AddPaymentDialog clientId={clientId!} clientName={client.full_name} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No payments recorded yet</p>
                  <AddPaymentDialog clientId={clientId!} clientName={client.full_name} />
                </div>
              )}
            </CardContent>
          </Card>

          {coachProfile?.cal_username && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Share Booking Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Share this link with {client.full_name} to let them book sessions directly
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`https://cal.com/${coachProfile.cal_username}`}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://cal.com/${coachProfile.cal_username}`);
                      toast({
                        title: "Copied!",
                        description: "Booking link copied to clipboard",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Bookings will automatically create sessions in your calendar
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs for Notes, Videos, Payments, and Lesson Plans */}
        <Tabs defaultValue="notes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="notes">Progress Notes</TabsTrigger>
            <TabsTrigger value="videos">Training Videos</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="lessonplans">Lesson Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Progress Notes</h2>
              <AddNoteDialog clientId={clientId!} clientName={client.full_name} />
            </div>
            <NotesList clientId={clientId!} />
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Training Videos</h2>
              <AddVideoDialog clientId={clientId!} clientName={client.full_name} />
            </div>
            <VideosList clientId={clientId!} />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Payment History</h2>
              <AddPaymentDialog clientId={clientId!} clientName={client.full_name} />
            </div>
            <PaymentsList clientId={clientId!} />
          </TabsContent>

          <TabsContent value="lessonplans" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lesson Plans</h2>
            </div>
            <LessonPlansList clientId={clientId!} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ClientDetails;
