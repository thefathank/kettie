import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ACCEPT-INVITATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { invitation_id } = await req.json();
    if (!invitation_id) throw new Error("Invitation ID is required");
    logStep("Invitation ID received", { invitation_id });

    // Check if user already belongs to an academy
    const { data: existingRole } = await supabaseClient
      .from('user_roles')
      .select('id, academy_id')
      .eq('user_id', user.id)
      .single();
    
    if (existingRole) {
      throw new Error("You already belong to an academy. A user can only be part of one academy.");
    }

    // Get the invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('academy_invitations')
      .select('*, academies(name)')
      .eq('id', invitation_id)
      .single();

    if (inviteError || !invitation) {
      throw new Error("Invitation not found");
    }
    logStep("Invitation found", { academyId: invitation.academy_id, status: invitation.status });

    // Verify invitation is for this user's email
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error("This invitation was sent to a different email address");
    }

    // Check invitation status
    if (invitation.status !== 'pending') {
      throw new Error(`Invitation has already been ${invitation.status}`);
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error("This invitation has expired");
    }

    // Add user to academy as coach
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: user.id,
        academy_id: invitation.academy_id,
        role: 'coach',
      });

    if (roleError) {
      throw new Error(`Failed to add you to the academy: ${roleError.message}`);
    }
    logStep("User added to academy as coach");

    // Update invitation status
    await supabaseClient
      .from('academy_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation_id);
    logStep("Invitation marked as accepted");

    return new Response(JSON.stringify({ 
      success: true, 
      academy_id: invitation.academy_id,
      academy_name: invitation.academies?.name,
      message: `Welcome to ${invitation.academies?.name || 'the academy'}!` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
