import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Academy {
  id: string;
  name: string;
  role: 'admin' | 'coach';
}

interface AcademyMember {
  id: string;
  user_id: string;
  role: 'admin' | 'coach';
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
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

interface AcademyContextType {
  academy: Academy | null;
  isAdmin: boolean;
  isCoach: boolean;
  members: AcademyMember[];
  invitations: AcademyInvitation[];
  stats: AcademyStats | null;
  loading: boolean;
  refreshAcademy: () => Promise<void>;
  inviteCoach: (email: string) => Promise<{ success: boolean; error?: string }>;
  removeCoach: (userId: string) => Promise<{ success: boolean; error?: string }>;
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined);

export const AcademyProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [members, setMembers] = useState<AcademyMember[]>([]);
  const [invitations, setInvitations] = useState<AcademyInvitation[]>([]);
  const [stats, setStats] = useState<AcademyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAcademy = useCallback(async () => {
    if (!user) {
      setAcademy(null);
      setMembers([]);
      setInvitations([]);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      // Get user's academy role
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('academy_id, role')
        .eq('user_id', user.id)
        .single();

      if (roleError || !userRole) {
        setAcademy(null);
        setMembers([]);
        setInvitations([]);
        setStats(null);
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
        setAcademy(null);
        setLoading(false);
        return;
      }

      setAcademy({
        id: academyData.id,
        name: academyData.name,
        role: userRole.role as 'admin' | 'coach',
      });

      // Get academy members with their profiles
      const { data: membersData } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at
        `)
        .eq('academy_id', userRole.academy_id);

      if (membersData) {
        // Fetch profiles for each member
        const memberIds = membersData.map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', memberIds);

        const membersWithProfiles = membersData.map(member => ({
          ...member,
          profiles: profilesData?.find(p => p.id === member.user_id) || null,
        }));

        setMembers(membersWithProfiles as AcademyMember[]);
      }

      // Get pending invitations (admin only)
      if (userRole.role === 'admin') {
        const { data: invitationsData } = await supabase
          .from('academy_invitations')
          .select('id, email, status, created_at, expires_at')
          .eq('academy_id', userRole.academy_id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        setInvitations(invitationsData || []);

        // Calculate academy stats (admin only)
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
  }, [user]);

  const inviteCoach = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!session || !academy) {
      return { success: false, error: 'Not authenticated or no academy' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('invite-coach', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { email },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await refreshAcademy();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const removeCoach = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (!academy || academy.role !== 'admin') {
      return { success: false, error: 'Not authorized' };
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('academy_id', academy.id);

      if (error) throw error;

      await refreshAcademy();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    refreshAcademy();
  }, [refreshAcademy]);

  const isAdmin = academy?.role === 'admin';
  const isCoach = academy?.role === 'coach';

  return (
    <AcademyContext.Provider
      value={{
        academy,
        isAdmin,
        isCoach,
        members,
        invitations,
        stats,
        loading,
        refreshAcademy,
        inviteCoach,
        removeCoach,
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (context === undefined) {
    throw new Error('useAcademy must be used within an AcademyProvider');
  }
  return context;
};
