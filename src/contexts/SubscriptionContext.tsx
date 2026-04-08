import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Academy {
  id: string;
  name: string;
  role: 'admin' | 'coach';
}

interface SubscriptionContextType {
  tier: 'free' | 'unlimited' | 'academy';
  subscribed: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  canAddClient: boolean;
  canAddTemplate: boolean;
  canAddLessonPlan: boolean;
  clientCount: number;
  templateCount: number;
  lessonPlanCount: number;
  refreshCounts: () => Promise<void>;
  academy: Academy | null;
}

const FREE_TIER_LIMITS = {
  clients: 1,
  templates: 1,
  lessonPlans: 1,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const [tier, setTier] = useState<'free' | 'unlimited' | 'academy'>('free');
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientCount, setClientCount] = useState(0);
  const [templateCount, setTemplateCount] = useState(0);
  const [lessonPlanCount, setLessonPlanCount] = useState(0);
  const [academy, setAcademy] = useState<Academy | null>(null);

  const refreshCounts = useCallback(async () => {
    if (!user) return;

    const [clientsRes, templatesRes, lessonsRes] = await Promise.all([
      supabase.from('clients').select('id', { count: 'exact', head: true }).eq('coach_id', user.id),
      supabase.from('lesson_templates').select('id', { count: 'exact', head: true }).eq('coach_id', user.id),
      supabase.from('client_lessons').select('id', { count: 'exact', head: true }).eq('coach_id', user.id),
    ]);

    setClientCount(clientsRes.count || 0);
    setTemplateCount(templatesRes.count || 0);
    setLessonPlanCount(lessonsRes.count || 0);
  }, [user]);

  const checkSubscription = useCallback(async () => {
    if (!session) {
      setTier('free');
      setSubscribed(false);
      setSubscriptionEnd(null);
      setAcademy(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setTier('free');
        setSubscribed(false);
        setAcademy(null);
      } else {
        setTier(data.tier || 'free');
        setSubscribed(data.subscribed || false);
        setSubscriptionEnd(data.subscription_end || null);
        setAcademy(data.academy || null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setTier('free');
      setSubscribed(false);
      setAcademy(null);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (user) {
      checkSubscription();
      refreshCounts();
    } else {
      setLoading(false);
    }
  }, [user, checkSubscription, refreshCounts]);

  // Refresh subscription status periodically
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60000); // Every minute
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const canAddClient = subscribed || clientCount < FREE_TIER_LIMITS.clients;
  const canAddTemplate = subscribed || templateCount < FREE_TIER_LIMITS.templates;
  const canAddLessonPlan = subscribed || lessonPlanCount < FREE_TIER_LIMITS.lessonPlans;

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        subscribed,
        subscriptionEnd,
        loading,
        checkSubscription,
        canAddClient,
        canAddTemplate,
        canAddLessonPlan,
        clientCount,
        templateCount,
        lessonPlanCount,
        refreshCounts,
        academy,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
