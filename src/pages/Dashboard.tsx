import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react";
import { AddSessionDialog } from "@/components/AddSessionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Handle checkout success
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast({
        title: "Welcome to Unlimited! 🎉",
        description: "Your subscription is now active. Enjoy unlimited access to all features!",
      });
      // Remove the query param from URL
      searchParams.delete('checkout');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const now = new Date();
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const [clientsRes, sessionsRes, revenueRes] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact" }).eq("coach_id", user.id),
        supabase
          .from("sessions")
          .select("id", { count: "exact" })
          .eq("coach_id", user.id)
          .gte("session_date", weekStart.toISOString())
          .lte("session_date", weekEnd.toISOString()),
        supabase
          .from("payments")
          .select("amount")
          .eq("coach_id", user.id)
          .gte("payment_date", monthStart.toISOString())
          .lte("payment_date", monthEnd.toISOString()),
      ]);

      const totalRevenue = revenueRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        totalClients: clientsRes.count || 0,
        sessionsThisWeek: sessionsRes.count || 0,
        monthlyRevenue: totalRevenue,
      };
    },
    enabled: !!user?.id,
  });

  const { data: todaysSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["todays-sessions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from("sessions")
        .select(
          `
          *,
          clients!sessions_client_id_fkey (full_name)
        `
        )
        .eq("coach_id", user.id)
        .eq("status", "scheduled")
        .gte("session_date", today.toISOString())
        .lt("session_date", tomorrow.toISOString())
        .order("session_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your coaching overview.</p>
          </div>
          <AddSessionDialog />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24 bg-white/[0.06]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 bg-white/[0.06]" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Clients"
                value={stats?.totalClients || 0}
                icon={Users}
              />
              <StatCard
                title="Sessions This Week"
                value={stats?.sessionsThisWeek || 0}
                icon={Calendar}
              />
              <StatCard
                title="Monthly Revenue"
                value={`$${stats?.monthlyRevenue.toFixed(2) || "0.00"}`}
                icon={DollarSign}
              />
              <StatCard
                title="Total Sessions"
                value={stats?.sessionsThisWeek || 0}
                icon={TrendingUp}
              />
            </>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full bg-white/[0.06]" />
                  ))}
                </div>
              ) : todaysSessions && todaysSessions.length > 0 ? (
                <>
                  {todaysSessions.map((session, idx) => (
                    <div
                      key={session.id}
                      className={`flex items-center justify-between p-4 rounded-xl bg-white/[0.03] transition-colors duration-150 hover:bg-white/[0.06] ${
                        idx < todaysSessions.length - 1 ? "border-b border-white/[0.04]" : ""
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{session.clients?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.duration_minutes} min {session.location ? `• ${session.location}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold font-mono text-primary">
                          {format(new Date(session.session_date), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => navigate("/schedule")}>
                    View Full Schedule
                  </Button>
                </>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-white/[0.15]" />
                  <p className="text-muted-foreground">No sessions scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-white/[0.06]" />
                  ))}
                </div>
              ) : todaysSessions && todaysSessions.length > 0 ? (
                <div className="space-y-4">
                  {todaysSessions.slice(0, 4).map((session) => (
                    <div key={session.id} className="flex items-start gap-4">
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm text-foreground">Session with {session.clients?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(session.session_date), "MMM d 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-white/[0.15]" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
