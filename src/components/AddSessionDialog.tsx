import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { trackEvent } from "@/lib/posthog";

const formSchema = z.object({
  client_id: z.string().min(1, "Please select a client"),
  session_date: z.string().min(1, "Session date is required"),
  session_time: z.string().min(1, "Session time is required"),
  duration_minutes: z.number().min(15, "Duration must be at least 15 minutes"),
  location: z.string().max(255, "Location must be less than 255 characters").optional(),
  notes: z.string().max(5000, "Notes must be less than 5,000 characters").optional(),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.enum(["daily", "weekly", "biweekly", "monthly"]).optional(),
  recurrence_end_date: z.string().optional(),
  recurrence_count: z.number().min(1).max(52).optional(),
  no_end_date: z.boolean().default(false),
}).refine((data) => {
  if (data.is_recurring) {
    return data.recurrence_pattern;
  }
  return true;
}, {
  message: "Please specify recurrence pattern",
  path: ["recurrence_pattern"],
});

type FormValues = z.infer<typeof formSchema>;

interface Client {
  id: string;
  full_name: string;
}

export function AddSessionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: "",
      session_date: "",
      session_time: "",
      duration_minutes: 60,
      location: "",
      notes: "",
      is_recurring: false,
      recurrence_pattern: undefined,
      recurrence_end_date: "",
      recurrence_count: undefined,
      no_end_date: false,
    },
  });

  const isRecurring = form.watch("is_recurring");
  const noEndDate = form.watch("no_end_date");

  useEffect(() => {
    if (open) {
      loadClients();
    }
  }, [open]);

  const loadClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("clients")
        .select("id, full_name")
        .eq("coach_id", user.id)
        .eq("status", "active")
        .order("full_name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to schedule sessions",
          variant: "destructive",
        });
        return;
      }

      // Combine date and time into a single timestamp
      const sessionDateTime = new Date(`${data.session_date}T${data.session_time}`);

      if (!data.is_recurring) {
        // Single session
        const { error } = await supabase.from("sessions").insert({
          coach_id: user.id,
          client_id: data.client_id,
          session_date: sessionDateTime.toISOString(),
          duration_minutes: data.duration_minutes,
          location: data.location || null,
          notes: data.notes || null,
          status: "scheduled",
        });

        if (error) throw error;

        trackEvent('session_scheduled', {
          is_recurring: false,
          duration_minutes: data.duration_minutes,
        });

        toast({
          title: "Success",
          description: "Session scheduled successfully",
        });
      } else {
        // Recurring sessions
        const sessions = [];
        let currentDate = new Date(sessionDateTime);
        
        // For no end date, create sessions for 1 year ahead (reasonable limit)
        let maxOccurrences = 52; // default 1 year of weekly sessions
        if (data.no_end_date) {
          maxOccurrences = data.recurrence_pattern === "daily" ? 365 : 
                          data.recurrence_pattern === "weekly" ? 52 : 
                          data.recurrence_pattern === "biweekly" ? 26 : 12; // monthly
        } else {
          maxOccurrences = data.recurrence_count || 52;
        }
        
        const endDate = data.recurrence_end_date ? new Date(data.recurrence_end_date) : null;

        for (let i = 0; i < maxOccurrences; i++) {
          if (endDate && currentDate > endDate) break;

          sessions.push({
            coach_id: user.id,
            client_id: data.client_id,
            session_date: currentDate.toISOString(),
            duration_minutes: data.duration_minutes,
            location: data.location || null,
            notes: data.notes || null,
            status: "scheduled",
          });

          // Calculate next occurrence
          switch (data.recurrence_pattern) {
            case "daily":
              currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
              break;
            case "weekly":
              currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
              break;
            case "biweekly":
              currentDate = new Date(currentDate.setDate(currentDate.getDate() + 14));
              break;
            case "monthly":
              currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
              break;
          }
        }

        const { error } = await supabase.from("sessions").insert(sessions);

        if (error) throw error;

        trackEvent('session_scheduled', {
          is_recurring: true,
          duration_minutes: data.duration_minutes,
          recurrence_pattern: data.recurrence_pattern,
          session_count: sessions.length,
        });

        toast({
          title: "Success",
          description: data.no_end_date 
            ? `${sessions.length} recurring sessions scheduled (1 year ahead)` 
            : `${sessions.length} recurring sessions scheduled successfully`,
        });
      }
      
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error scheduling session:", error);
      toast({
        title: "Error",
        description: "Failed to schedule session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Session</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="session_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="session_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Court 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Session details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_recurring"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Recurring Session</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Schedule multiple sessions at regular intervals
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isRecurring && (
              <>
                <FormField
                  control={form.control}
                  name="recurrence_pattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurrence Pattern</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="no_end_date"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">No End Date</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Continue scheduling for 1 year ahead
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              form.setValue("recurrence_end_date", "");
                              form.setValue("recurrence_count", undefined);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!noEndDate && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recurrence_end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurrence_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Occurrences</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={52}
                              placeholder="e.g., 10"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </>
            )}
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Scheduling..." : isRecurring ? "Schedule Recurring Sessions" : "Schedule Session"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
