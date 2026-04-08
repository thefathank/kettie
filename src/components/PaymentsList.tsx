import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DollarSign } from "lucide-react";
import { EditPaymentDialog } from "./EditPaymentDialog";

interface PaymentsListProps {
  clientId: string;
}

export function PaymentsList({ clientId }: PaymentsListProps) {
  const { user } = useAuth();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments", clientId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("client_id", clientId)
        .eq("coach_id", user.id)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No payments recorded yet. Add your first payment to start tracking!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">
                  ${payment.amount} {payment.currency}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(payment.payment_date), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={payment.payment_status === "completed" ? "default" : "secondary"}>
                    {payment.payment_status}
                  </Badge>
                  <Badge variant="outline">{payment.payment_type}</Badge>
                </div>
                <EditPaymentDialog payment={payment} clientId={clientId} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Sessions Covered</p>
                <p className="text-lg font-semibold">{payment.sessions_covered || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions Used</p>
                <p className="text-lg font-semibold">
                  {(payment.sessions_covered || 0) - (payment.sessions_remaining || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions Remaining</p>
                <p className="text-lg font-semibold text-primary">
                  {payment.sessions_remaining || 0}
                </p>
              </div>
            </div>
            {payment.description && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Description:</p>
                <p className="text-sm">{payment.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
