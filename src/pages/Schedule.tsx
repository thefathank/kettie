import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Link2, Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddSessionDialog } from "@/components/AddSessionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, getDay, getHours, getMinutes } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeSlots = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

const Schedule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

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

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", user?.id, currentWeekStart],
    queryFn: async () => {
      if (!user?.id) return [];

      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

      const { data, error } = await supabase
        .from("sessions")
        .select(
          `
          *,
          clients!sessions_client_id_fkey (full_name)
        `
        )
        .eq("coach_id", user.id)
        .gte("session_date", currentWeekStart.toISOString())
        .lte("session_date", weekEnd.toISOString())
        .order("session_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const getSessionForSlot = (dayIndex: number, timeSlot: string) => {
    if (!sessions) return null;

    return sessions.find((session) => {
      const sessionDate = new Date(session.session_date);
      const sessionDay = (getDay(sessionDate) + 6) % 7; // Convert Sunday=0 to Monday=0
      const sessionHour = getHours(sessionDate);
      const sessionMinute = getMinutes(sessionDate);
      
      const slotHour = timeSlot.includes("PM") && !timeSlot.startsWith("12")
        ? parseInt(timeSlot) + 12
        : timeSlot.startsWith("12") && timeSlot.includes("AM")
        ? 0
        : parseInt(timeSlot);

      return sessionDay === dayIndex && sessionHour === slotHour && sessionMinute === 0;
    });
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
            <p className="text-muted-foreground">Manage your coaching calendar and sessions.</p>
          </div>
          <AddSessionDialog />
        </div>

        {/* Cal.com Integration Info */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Schedule Sessions Two Ways</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add sessions manually using the "Add Session" button, or connect Cal.com to let clients book available times directly. Bookings automatically appear in your schedule.
                </p>
              </div>
              <Button
                variant={coachProfile?.cal_username ? "secondary" : "default"}
                onClick={() => navigate("/settings")}
                className="shrink-0"
              >
                {coachProfile?.cal_username ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Cal.com Connected
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect Cal.com
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Booking Link */}
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
                Share this link with clients to let them book sessions directly
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
            </CardContent>
          </Card>
        )}

        {/* Calendar Navigation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Week of {format(currentWeekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleToday}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[600px] w-full" />
            ) : (
              <div className="grid grid-cols-8 gap-2">
                {/* Time column header */}
                <div className="text-sm font-medium text-muted-foreground">Time</div>
                {/* Day headers */}
                {weekDays.map((day, i) => {
                  const dayDate = new Date(currentWeekStart);
                  dayDate.setDate(dayDate.getDate() + i);
                  return (
                    <div key={day} className="text-center">
                      <div className="text-sm font-medium">{day}</div>
                      <div className="text-xs text-muted-foreground">{format(dayDate, "d")}</div>
                    </div>
                  );
                })}

                {/* Calendar rows */}
                {timeSlots.map((time) => (
                  <>
                    <div key={time} className="text-xs text-muted-foreground py-4 pr-2 text-right">
                      {time}
                    </div>
                    {weekDays.map((_, dayIndex) => {
                      const session = getSessionForSlot(dayIndex, time);
                      return (
                        <div
                          key={`${dayIndex}-${time}`}
                          className="border border-border rounded-lg min-h-[80px] p-2 hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          {session && (
                            <div className="bg-primary text-primary-foreground rounded p-2 text-sm">
                              <div className="font-semibold">{session.clients?.full_name}</div>
                              <div className="text-xs mt-1 opacity-90">
                                {session.duration_minutes} min
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Schedule;
