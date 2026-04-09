import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, Users, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddClientDialog } from "@/components/AddClientDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { format } from "date-fns";

const Clients = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: clientsData, error } = await supabase
        .from("clients")
        .select(`
          *,
          sessions!sessions_client_id_fkey (
            id,
            session_date,
            status
          )
        `)
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return clientsData.map((client) => {
        const sessions = client.sessions || [];
        const totalSessions = sessions.length;
        const nextSession = sessions
          .filter((s: any) => s.status === "scheduled" && new Date(s.session_date) > new Date())
          .sort((a: any, b: any) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())[0];

        return {
          ...client,
          totalSessions,
          nextSession: nextSession
            ? format(new Date(nextSession.session_date), "MMM d, h:mm a")
            : "No upcoming sessions",
        };
      });
    },
    enabled: !!user?.id,
  });

  const filteredClients = clients?.filter((client) =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight">Clients</h1>
            <p className="text-muted-foreground">Manage your player roster and track their progress.</p>
          </div>
          <AddClientDialog />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search clients..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Clients Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-48 w-full bg-white/[0.06]" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-16">
              <Users className="h-12 w-12 mx-auto mb-4 text-white/[0.15]" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No clients found matching your search." : "No clients yet. Add your first client to get started!"}
              </p>
              {!searchTerm && <AddClientDialog />}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <Card key={client.id} className="cursor-pointer transition-all duration-150 hover:bg-white/[0.06]">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold font-heading text-lg text-foreground">{client.full_name}</h3>
                        {client.skill_level && (
                          <Badge variant="secondary" className="mt-1">
                            {client.skill_level}
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant={client.status === "active" ? "default" : "secondary"}
                      >
                        {client.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      {client.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/[0.06]">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Sessions</span>
                        <span className="font-semibold font-mono">{client.totalSessions}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-muted-foreground">Next Session</span>
                        <span className="font-semibold text-primary">{client.nextSession}</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => window.location.href = `/clients/${client.id}`}
                    >
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Clients;
