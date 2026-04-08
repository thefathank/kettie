import { DemoLayout } from "@/components/DemoLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, TrendingUp, Clock, Plus } from "lucide-react";

// Mock data for demo
const mockStats = {
  totalClients: 12,
  sessionsThisWeek: 8,
  monthlyRevenue: 2450,
  totalSessions: 47,
};

const mockTodaysSessions = [
  { id: "1", clientName: "Sarah Johnson", time: "9:00 AM", duration: 60, location: "Court 1" },
  { id: "2", clientName: "Mike Chen", time: "11:30 AM", duration: 60, location: "Court 2" },
  { id: "3", clientName: "Emily Davis", time: "3:00 PM", duration: 90, location: "Court 1" },
];

const mockRecentSessions = [
  { id: "1", clientName: "John Smith", date: "Yesterday at 2:00 PM" },
  { id: "2", clientName: "Lisa Wang", date: "Dec 1 at 10:00 AM" },
  { id: "3", clientName: "Tom Brown", date: "Nov 30 at 4:00 PM" },
  { id: "4", clientName: "Anna Lee", date: "Nov 29 at 11:00 AM" },
];

const DemoDashboard = () => {
  return (
    <DemoLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your coaching overview.</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Clients"
            value={mockStats.totalClients}
            icon={Users}
          />
          <StatCard
            title="Sessions This Week"
            value={mockStats.sessionsThisWeek}
            icon={Calendar}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${mockStats.monthlyRevenue.toFixed(2)}`}
            icon={DollarSign}
          />
          <StatCard
            title="Total Sessions"
            value={mockStats.totalSessions}
            icon={TrendingUp}
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockTodaysSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{session.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.duration} min • {session.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{session.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View Full Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentSessions.map((session) => (
                  <div key={session.id} className="flex items-start gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">Session with {session.clientName}</p>
                      <p className="text-xs text-muted-foreground">{session.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DemoLayout>
  );
};

export default DemoDashboard;
