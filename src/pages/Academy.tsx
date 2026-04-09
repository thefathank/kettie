import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  DollarSign,
  Calendar,
  UserPlus,
  Trash2,
  Mail,
  Building2,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AcademyMember {
  id: string;
  user_id: string;
  role: 'admin' | 'coach';
  created_at: string;
  profile?: {
    full_name: string;
    email: string;
  };
}

interface AcademyInvitation {
  id: string;
  email: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface AcademyStats {
  totalClients: number;
  totalSessions: number;
  totalRevenue: number;
  coachCount: number;
}

const Academy = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, session } = useAuth();
  const { tier, academy: subscriptionAcademy, checkSubscription } = useSubscription();
  
  const [loading, setLoading] = useState(true);
  const [settingUp, setSettingUp] = useState(false);
  const [academy, setAcademy] = useState<{ id: string; name: string; role: 'admin' | 'coach' } | null>(null);
  const [members, setMembers] = useState<AcademyMember[]>([]);
  const [invitations, setInvitations] = useState<AcademyInvitation[]>([]);
  const [stats, setStats] = useState<AcademyStats | null>(null);
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  // Check if we're in checkout flow
  const isCheckoutFlow = searchParams.get('checkout') === 'success' && searchParams.get('academy_name');

  const isAdmin = academy?.role === 'admin';

  // Handle checkout success
  useEffect(() => {
    const checkoutSuccess = searchParams.get('checkout');
    const academyName = searchParams.get('academy_name');
    
    if (checkoutSuccess === 'success' && academyName && session) {
      setSettingUp(true);
      // Set up the academy after successful checkout
      const setupAcademy = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('setup-academy', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            body: { academy_name: decodeURIComponent(academyName) },
          });
          
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          
          toast.success(`Welcome to ${decodeURIComponent(academyName)}! 🎉`);
          await checkSubscription();
          setSettingUp(false);
          // Clear the search params and reload data
          navigate('/academy', { replace: true });
        } catch (error: any) {
          console.error('Setup academy error:', error);
          toast.error(error.message || 'Failed to set up academy');
          setSettingUp(false);
          setLoading(false);
        }
      };
      
      setupAcademy();
    }
  }, [searchParams, session, navigate, checkSubscription]);

  // Fetch academy data (only when not in checkout flow)
  useEffect(() => {
    // Skip if we're setting up or still in checkout flow
    if (settingUp || isCheckoutFlow) {
      return;
    }
    
    const fetchAcademyData = async () => {
      if (!user) return;

      try {
        // Get user's role
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select('academy_id, role')
          .eq('user_id', user.id)
          .single();

        if (roleError || !userRole) {
          setLoading(false);
          return;
        }

        // Get academy details
        const { data: academyData, error: academyError } = await supabase
          .from('academies')
          .select('id, name')
          .eq('id', userRole.academy_id)
          .single();

        if (academyError || !academyData) {
          setLoading(false);
          return;
        }

        setAcademy({
          id: academyData.id,
          name: academyData.name,
          role: userRole.role as 'admin' | 'coach',
        });

        // Get members
        const { data: membersData } = await supabase
          .from('user_roles')
          .select('id, user_id, role, created_at')
          .eq('academy_id', userRole.academy_id);

        if (membersData) {
          const memberIds = membersData.map(m => m.user_id);
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', memberIds);

          const membersWithProfiles = membersData.map(member => ({
            ...member,
            profile: profilesData?.find(p => p.id === member.user_id),
          })) as AcademyMember[];

          setMembers(membersWithProfiles);
        }

        // Admin-only data
        if (userRole.role === 'admin') {
          // Get invitations
          const { data: invitationsData } = await supabase
            .from('academy_invitations')
            .select('id, email, status, created_at, expires_at')
            .eq('academy_id', userRole.academy_id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

          setInvitations(invitationsData || []);

          // Calculate stats
          const [clientsRes, sessionsRes, paymentsRes] = await Promise.all([
            supabase.from('clients').select('id', { count: 'exact', head: true }).eq('academy_id', userRole.academy_id),
            supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('academy_id', userRole.academy_id),
            supabase.from('payments').select('amount').eq('academy_id', userRole.academy_id),
          ]);

          const totalRevenue = paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

          setStats({
            totalClients: clientsRes.count || 0,
            totalSessions: sessionsRes.count || 0,
            totalRevenue,
            coachCount: membersData?.length || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching academy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademyData();
  }, [user, settingUp, isCheckoutFlow]);

  const handleInviteCoach = async () => {
    if (!inviteEmail.trim() || !session) return;

    setInviteLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('invite-coach', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { email: inviteEmail.trim() },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteDialogOpen(false);
      
      // Refresh invitations
      const { data: newInvitations } = await supabase
        .from('academy_invitations')
        .select('id, email, status, created_at, expires_at')
        .eq('academy_id', academy?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      setInvitations(newInvitations || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveCoach = async (userId: string, userName: string) => {
    if (!academy) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('academy_id', academy.id);

      if (error) throw error;

      toast.success(`${userName} has been removed from the academy`);
      setMembers(members.filter(m => m.user_id !== userId));
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove coach');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('academy_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast.success('Invitation cancelled');
      setInvitations(invitations.filter(i => i.id !== invitationId));
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel invitation');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  if (!academy) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Academy Found</h2>
          <p className="text-muted-foreground mb-6">
            You're not part of any academy yet. Create one or accept an invitation.
          </p>
          <Button onClick={() => navigate('/pricing')}>
            View Academy Plans
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight flex items-center gap-2">
              <Building2 className="w-8 h-8 text-accent" />
              {academy.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin ? 'Academy Admin Dashboard' : 'Academy Coach View'}
            </p>
          </div>
          {isAdmin && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Coach
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite a Coach</DialogTitle>
                  <DialogDescription>
                    Send an email invitation to add a new coach to your academy.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="coach@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInviteCoach}
                    disabled={inviteLoading || !inviteEmail.trim()}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats - Admin only */}
        {isAdmin && stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Coaches</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{stats.coachCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{stats.totalClients}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{stats.totalSessions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">${stats.totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {isAdmin ? 'Manage your academy coaching staff' : 'Your academy team'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.profile?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>{member.profile?.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {member.role !== 'admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Coach</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.profile?.full_name} from the academy? 
                                  Their data will remain but they will lose access.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveCoach(member.user_id, member.profile?.full_name || 'this coach')}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Coaches Overview - Admin only */}
        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  Coaches Overview
                </CardTitle>
                <CardDescription>
                  {members.filter(m => m.role === 'coach').length} coach{members.filter(m => m.role === 'coach').length !== 1 ? 'es' : ''} registered
                </CardDescription>
              </div>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Send Invite Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite a Coach</DialogTitle>
                    <DialogDescription>
                      Send an email invitation link to add a new coach to your academy.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email-2">Email Address</Label>
                      <Input
                        id="invite-email-2"
                        type="email"
                        placeholder="coach@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInviteCoach}
                      disabled={inviteLoading || !inviteEmail.trim()}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      {inviteLoading ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {members.filter(m => m.role === 'coach').length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {members.filter(m => m.role === 'coach').map((coach) => (
                    <div key={coach.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{coach.profile?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground truncate">{coach.profile?.email || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No coaches registered yet</p>
                  <p className="text-sm">Send an invite link to add coaches to your academy</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pending Invitations - Admin only */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Pending Invitations
              </CardTitle>
              <CardDescription>
                {invitations.length > 0 
                  ? `${invitations.length} invitation${invitations.length !== 1 ? 's' : ''} waiting to be accepted`
                  : 'No pending invitations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">{invitation.email}</TableCell>
                        <TableCell>{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {new Date(invitation.expires_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleCancelInvitation(invitation.id)}
                          >
                            Cancel
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Mail className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending invitations</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions for Coaches */}
        {!isAdmin && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/clients')}>
              <CardHeader>
                <CardTitle className="text-lg">My Clients</CardTitle>
                <CardDescription>Manage your client roster</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/schedule')}>
              <CardHeader>
                <CardTitle className="text-lg">My Schedule</CardTitle>
                <CardDescription>View and manage your sessions</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/lessons')}>
              <CardHeader>
                <CardTitle className="text-lg">Lesson Plans</CardTitle>
                <CardDescription>Create and view lesson templates</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Academy;
