import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[INVITE-COACH] ${step}${detailsStr}`);
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
    logStep("User authenticated", { userId: user.id });

    // Get user's academy and verify they're an admin
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('academy_id, role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !userRole) {
      throw new Error("You are not part of any academy");
    }
    if (userRole.role !== 'admin') {
      throw new Error("Only academy admins can invite coaches");
    }
    logStep("Admin verified", { academyId: userRole.academy_id });

    // Get academy details
    const { data: academy, error: academyError } = await supabaseClient
      .from('academies')
      .select('name')
      .eq('id', userRole.academy_id)
      .single();

    if (academyError || !academy) {
      throw new Error("Academy not found");
    }

    // Parse request body
    const { email } = await req.json();
    if (!email) throw new Error("Email is required");
    logStep("Invite email", { email });

    // Check if user is already in the academy
    const { data: existingUser } = await supabaseClient
      .from('user_roles')
      .select('id, user_id')
      .eq('academy_id', userRole.academy_id)
      .eq('user_id', (await supabaseClient.auth.admin.listUsers()).data.users.find(u => u.email === email)?.id || '');

    if (existingUser && existingUser.length > 0) {
      throw new Error("This user is already a member of your academy");
    }

    // Check if invitation already exists
    const { data: existingInvite } = await supabaseClient
      .from('academy_invitations')
      .select('id, status')
      .eq('academy_id', userRole.academy_id)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      throw new Error("An invitation is already pending for this email");
    }

    // Create invitation using service role to bypass RLS
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('academy_invitations')
      .insert({
        academy_id: userRole.academy_id,
        email: email,
        invited_by: user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (inviteError) {
      throw new Error(`Failed to create invitation: ${inviteError.message}`);
    }
    logStep("Invitation created", { invitationId: invitation.id });

    // Send invitation email
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const origin = req.headers.get("origin") || "https://propointersplus.com";
      const inviteLink = `${origin}/accept-invite?id=${invitation.id}`;

      await resend.emails.send({
        from: "Pro Pointers Plus <noreply@mail.propointersplus.com>",
        to: email,
        subject: `You're invited to join ${academy.name} on Pro Pointers Plus`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">You're Invited!</h1>
            <p>You've been invited to join <strong>${academy.name}</strong> as a coach on Pro Pointers Plus.</p>
            <p>Pro Pointers Plus is a tennis coaching management platform that helps coaches manage clients, schedules, lesson plans, and more.</p>
            <p style="margin: 24px 0;">
              <a href="${inviteLink}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accept Invitation
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        `,
      });
      logStep("Invitation email sent");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      invitation_id: invitation.id,
      message: `Invitation sent to ${email}` 
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
