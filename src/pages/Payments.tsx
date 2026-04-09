import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const Payments = () => {
  const { user } = useAuth();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`*, clients (full_name)`)
        .eq('coach_id', user?.id)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const avgSessionValue = payments?.length ? totalRevenue / payments.length : 0;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Track revenue and manage client subscriptions.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary/60" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24 bg-white/[0.06]" />
              ) : (
                <>
                  <div className="text-2xl font-bold font-mono">${totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary/60" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-white/[0.06]" />
              ) : (
                <>
                  <div className="text-2xl font-bold font-mono">{payments?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Payment Value</CardTitle>
              <CreditCard className="h-4 w-4 text-primary/60" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20 bg-white/[0.06]" />
              ) : (
                <>
                  <div className="text-2xl font-bold font-mono">${avgSessionValue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Per payment</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full bg-white/[0.06]" />
                ))}
              </div>
            ) : payments && payments.length > 0 ? (
              <div className="divide-y divide-white/[0.05]">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0 transition-colors duration-150 hover:bg-white/[0.03] -mx-4 px-4 rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{payment.clients?.full_name || 'Unknown Client'}</p>
                      <p className="text-sm text-muted-foreground">{payment.payment_type}</p>
                      {payment.description && (
                        <p className="text-xs text-muted-foreground">{payment.description}</p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold font-mono text-primary">{payment.currency} {Number(payment.amount).toFixed(2)}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={payment.payment_status === 'completed' ? 'default' : 'secondary'}>
                          {payment.payment_status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {payment.payment_date ? format(new Date(payment.payment_date), 'MMM d, yyyy') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-white/[0.15]" />
                <p className="text-lg font-medium text-foreground mb-2">No payments yet</p>
                <p className="text-sm text-muted-foreground">Payment records will appear here once you start tracking them.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Payments;
