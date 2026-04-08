import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SETUP-ACADEMY] ${step}${detailsStr}`);
};

// This function is called after successful Stripe checkout to actually create the academy
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

    // Parse request body
    const { academy_name } = await req.json();
    if (!academy_name) throw new Error("Academy name is required");
    logStep("Academy name", { academy_name });

    // Check if user already belongs to an academy
    const { data: existingRole } = await supabaseClient
      .from('user_roles')
      .select('id, academy_id')
      .eq('user_id', user.id)
      .single();
    
    if (existingRole) {
      // User already has an academy, return it
      const { data: existingAcademy } = await supabaseClient
        .from('academies')
        .select('*')
        .eq('id', existingRole.academy_id)
        .single();
      
      return new Response(JSON.stringify({ 
        success: true, 
        academy: existingAcademy,
        message: "You already have an academy" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create the academy
    const { data: academy, error: academyError } = await supabaseClient
      .from('academies')
      .insert({
        name: academy_name,
        owner_id: user.id,
        subscription_status: 'active',
      })
      .select()
      .single();

    if (academyError) {
      throw new Error(`Failed to create academy: ${academyError.message}`);
    }
    logStep("Academy created", { academyId: academy.id });

    // Add user as admin of the academy
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: user.id,
        academy_id: academy.id,
        role: 'admin',
      });

    if (roleError) {
      // Rollback academy creation
      await supabaseClient.from('academies').delete().eq('id', academy.id);
      throw new Error(`Failed to set up admin role: ${roleError.message}`);
    }
    logStep("Admin role assigned");

    return new Response(JSON.stringify({ 
      success: true, 
      academy: academy,
      message: `Academy "${academy_name}" created successfully!` 
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
