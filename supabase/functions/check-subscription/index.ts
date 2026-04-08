import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user is part of an academy (use limit(1) instead of single() to avoid errors with multiple rows)
    const { data: userRoles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('academy_id, role')
      .eq('user_id', user.id)
      .limit(1);

    const userRole = userRoles?.[0];
    
    if (roleError) {
      logStep("Error checking user roles", { error: roleError.message });
    }

    if (userRole) {
      // Get academy details
      const { data: academyData } = await supabaseClient
        .from('academies')
        .select('id, name, subscription_status')
        .eq('id', userRole.academy_id)
        .single();

      if (academyData) {
        logStep("User is part of academy", { 
          academyId: userRole.academy_id, 
          role: userRole.role,
          academyName: academyData.name 
        });
        
        // Academy tier - all academy members have full access
        return new Response(JSON.stringify({
          subscribed: true,
          tier: "academy",
          subscription_end: null,
          academy: {
            id: userRole.academy_id,
            name: academyData.name,
            role: userRole.role,
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // Check individual Stripe subscription
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning free tier");
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end 
      });
      
      // Safely handle the timestamp
      if (subscription.current_period_end) {
        try {
          const timestamp = typeof subscription.current_period_end === 'number' 
            ? subscription.current_period_end 
            : parseInt(subscription.current_period_end);
          subscriptionEnd = new Date(timestamp * 1000).toISOString();
          logStep("Subscription end date calculated", { subscriptionEnd });
        } catch (dateError) {
          logStep("Could not parse subscription end date, continuing without it");
        }
      }
    } else {
      logStep("No active subscription found");
    }

    const response = {
      subscribed: hasActiveSub,
      tier: hasActiveSub ? "unlimited" : "free",
      subscription_end: subscriptionEnd
    };
    
    logStep("Returning response", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
