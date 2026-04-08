import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2, Building2 } from "lucide-react";
import { Footer } from "@/components/Footer";

const AcceptInvite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, session } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not-logged-in'>('loading');
  const [message, setMessage] = useState("");
  const [academyName, setAcademyName] = useState("");

  const invitationId = searchParams.get('id');

  useEffect(() => {
    if (!invitationId) {
      setStatus('error');
      setMessage('Invalid invitation link');
      return;
    }

    if (!user || !session) {
      setStatus('not-logged-in');
      setMessage('Please sign in or create an account to accept this invitation');
      return;
    }

    const acceptInvitation = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('accept-invitation', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: { invitation_id: invitationId },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setStatus('success');
        setMessage(data.message || 'You have joined the academy!');
        setAcademyName(data.academy_name || '');
        toast.success(data.message || 'Welcome to the academy!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to accept invitation');
      }
    };

    acceptInvitation();
  }, [invitationId, user, session]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {status === 'loading' && (
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="w-16 h-16 text-green-500" />
              )}
              {status === 'error' && (
                <XCircle className="w-16 h-16 text-destructive" />
              )}
              {status === 'not-logged-in' && (
                <Building2 className="w-16 h-16 text-amber-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && 'Processing Invitation...'}
              {status === 'success' && 'Welcome to the Team!'}
              {status === 'error' && 'Invitation Error'}
              {status === 'not-logged-in' && 'Academy Invitation'}
            </CardTitle>
            <CardDescription className="mt-2">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'success' && (
              <>
                {academyName && (
                  <p className="text-center text-lg font-medium">
                    You've joined <span className="text-amber-500">{academyName}</span>
                  </p>
                )}
                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600"
                  onClick={() => navigate('/academy')}
                >
                  Go to Academy Dashboard
                </Button>
              </>
            )}
            {status === 'error' && (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            )}
            {status === 'not-logged-in' && (
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => navigate(`/auth?redirect=/accept-invite?id=${invitationId}`)}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate(`/register/free?redirect=/accept-invite?id=${invitationId}`)}
                >
                  Create Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AcceptInvite;
