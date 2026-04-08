import { DemoLayout } from "@/components/DemoLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Link2, Check, Plus } from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";

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

// Mock sessions for demo
const mockSessions: Record<string, { clientName: string; duration: number }> = {
  "0-9:00 AM": { clientName: "Sarah Johnson", duration: 60 },
  "0-11:00 AM": { clientName: "Mike Chen", duration: 60 },
  "1-10:00 AM": { clientName: "Emily Davis", duration: 90 },
  "2-9:00 AM": { clientName: "John Smith", duration: 60 },
  "2-3:00 PM": { clientName: "Lisa Wang", duration: 60 },
  "3-11:00 AM": { clientName: "Tom Brown", duration: 60 },
  "4-2:00 PM": { clientName: "Anna Lee", duration: 90 },
  "4-4:00 PM": { clientName: "Sarah Johnson", duration: 60 },
  "5-10:00 AM": { clientName: "David Kim", duration: 60 },
};

const DemoSchedule = () => {
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  return (
    <DemoLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
            <p className="text-muted-foreground">Manage your coaching calendar and sessions.</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Session
          </Button>
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
              <Button variant="secondary" className="shrink-0">
                <Check className="h-4 w-4 mr-2" />
                Cal.com Connected
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Navigation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Week of {format(currentWeekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline">Today</Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2">
              {/* Time column header */}
              <div className="text-sm font-medium text-muted-foreground">Time</div>
              {/* Day headers */}
              {weekDays.map((day, i) => {
                const dayDate = addDays(currentWeekStart, i);
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
                    const sessionKey = `${dayIndex}-${time}`;
                    const session = mockSessions[sessionKey];
                    return (
                      <div
                        key={`${dayIndex}-${time}`}
                        className="border border-border rounded-lg min-h-[80px] p-2 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        {session && (
                          <div className="bg-primary text-primary-foreground rounded p-2 text-sm">
                            <div className="font-semibold">{session.clientName}</div>
                            <div className="text-xs mt-1 opacity-90">
                              {session.duration} min
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DemoLayout>
  );
};

export default DemoSchedule;
