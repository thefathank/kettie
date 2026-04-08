import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

const formSchema = z.object({
  sessions_covered: z.string().min(1, "Number of sessions is required"),
  sessions_remaining: z.string().min(1, "Sessions remaining is required"),
}).refine((data) => {
  const covered = parseInt(data.sessions_covered);
  const remaining = parseInt(data.sessions_remaining);
  return remaining <= covered;
}, {
  message: "Sessions remaining cannot exceed sessions covered",
  path: ["sessions_remaining"],
});

type FormValues = z.infer<typeof formSchema>;

interface EditPaymentDialogProps {
  payment: {
    id: string;
    sessions_covered: number | null;
    sessions_remaining: number | null;
  };
  clientId: string;
}

export function EditPaymentDialog({ payment, clientId }: EditPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessions_covered: String(payment.sessions_covered || 0),
      sessions_remaining: String(payment.sessions_remaining || 0),
    },
  });

  // Reset form when dialog opens with current payment data
  useEffect(() => {
    if (open) {
      form.reset({
        sessions_covered: String(payment.sessions_covered || 0),
        sessions_remaining: String(payment.sessions_remaining || 0),
      });
    }
  }, [open, payment, form]);

  const onSubmit = async (values: FormValues) => {
    if (!user?.id) {
      toast.error("You must be logged in");
      return;
    }

    setIsLoading(true);
    try {
      const sessionsCovered = parseInt(values.sessions_covered);
      const sessionsRemaining = parseInt(values.sessions_remaining);

      const { error } = await supabase
        .from("payments")
        .update({
          sessions_covered: sessionsCovered,
          sessions_remaining: sessionsRemaining,
        })
        .eq("id", payment.id)
        .eq("coach_id", user.id);

      if (error) throw error;

      toast.success("Payment updated successfully");
      queryClient.invalidateQueries({ queryKey: ["payments", clientId] });
      queryClient.invalidateQueries({ queryKey: ["client-session-balance", clientId] });
      setOpen(false);
    } catch (error: any) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Session Balance</DialogTitle>
          <DialogDescription>
            Adjust the session count for this payment
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sessions_covered"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sessions Covered</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="10"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Total number of sessions this payment covers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sessions_remaining"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sessions Remaining</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="5"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of sessions not yet used from this payment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
