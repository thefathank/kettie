import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Analytics = () => {
  const { user } = useAuth();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["analytics", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data: clients } = await supabase.from("clients").select("*").eq("coach_id", user.id);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: sessions } = await supabase.from("sessions").select("*").eq("coach_id", user.id).gte("session_date", thirtyDaysAgo.toISOString());
      const { data: payments } = await supabase.from("payments").select("*").eq("coach_id", user.id).gte("payment_date", thirtyDaysAgo.toISOString());
      const totalClients = clients?.length || 0;
      const activeClients = clients?.filter((c) => c.status === "active").length || 0;
      const completedSessions = sessions?.filter((s) => s.status === "completed").length || 0;
      const scheduledSessions = sessions?.filter((s) => s.status === "scheduled").length || 0;
      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const avgSessionValue = completedSessions > 0 ? totalRevenue / completedSessions : 0;
      const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
      return { totalClients, activeClients, completedSessions, scheduledSessions, totalRevenue, avgSessionValue, retentionRate };
    },
    enabled: !!user,
  });

  const getRecommendations = () => {
    if (!metrics) return [];
    const recommendations = [];
    if (metrics.retentionRate < 80) recommendations.push({ type: "warning", title: "Low Client Retention", description: `Your retention rate is ${metrics.retentionRate.toFixed(1)}%. Consider sending regular check-ins and progress updates to keep clients engaged.` });
    if (metrics.scheduledSessions < 5) recommendations.push({ type: "warning", title: "Low Booking Volume", description: "You have few upcoming sessions scheduled. Reach out to clients to book more sessions or consider promotional offers." });
    if (metrics.avgSessionValue < 100) recommendations.push({ type: "info", title: "Revenue Optimization", description: `Average session value is $${metrics.avgSessionValue.toFixed(2)}. Consider offering package deals or premium services to increase revenue per session.` });
    if (metrics.activeClients > 0 && metrics.completedSessions / metrics.activeClients < 2) recommendations.push({ type: "info", title: "Session Frequency", description: "Average session frequency is low. Consider implementing recurring session schedules to increase consistency." });
    if (recommendations.length === 0) recommendations.push({ type: "success", title: "Great Performance!", description: "Your coaching business metrics look strong. Keep up the excellent work!" });
    return recommendations;
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Business Analytics</h1>
          <p className="text-muted-foreground">Track your coaching business performance and get optimization recommendations</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Clients", value: metrics?.totalClients || 0, sub: `${metrics?.activeClients || 0} active` },
            { title: "Retention Rate", value: `${metrics?.retentionRate.toFixed(1) || 0}%`, sub: "Last 30 days", icon: metrics && metrics.retentionRate >= 80 ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" /> },
            { title: "Sessions Completed", value: metrics?.completedSessions || 0, sub: `${metrics?.scheduledSessions || 0} scheduled` },
            { title: "Avg. Session Value", value: `$${metrics?.avgSessionValue.toFixed(2) || "0.00"}`, sub: "Last 30 days" },
          ].map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 bg-white/[0.06]" />
                ) : (
                  <>
                    <div className="text-2xl font-bold font-mono flex items-center gap-2">
                      {card.value}
                      {card.icon}
                    </div>
                    <p className="text-xs text-muted-foreground">{card.sub}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold font-heading">Optimization Recommendations</h2>
          {isLoading ? (
            <Skeleton className="h-24 w-full bg-white/[0.06]" />
          ) : (
            <div className="space-y-3">
              {getRecommendations().map((rec, index) => (
                <Alert key={index} variant={rec.type === "warning" ? "destructive" : "default"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{rec.title}</AlertTitle>
                  <AlertDescription>{rec.description}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
