import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log('Cal.com webhook received:', JSON.stringify(payload, null, 2));

    // Cal.com webhook payload structure for booking.created event
    const { triggerEvent, payload: bookingData } = payload;

    if (triggerEvent !== 'BOOKING_CREATED') {
      console.log('Ignoring non-booking event:', triggerEvent);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract booking details
    const {
      startTime,
      endTime,
      title,
      attendees,
      metadata,
      organizer,
    } = bookingData;

    // Find coach by Cal.com username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('cal_username', organizer.username)
      .single();

    if (profileError || !profile) {
      console.error('Coach not found for Cal.com user:', organizer.username);
      return new Response(
        JSON.stringify({ error: 'Coach not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get or create client by email
    const attendeeEmail = attendees[0]?.email;
    const attendeeName = attendees[0]?.name || 'Unknown Client';

    if (!attendeeEmail) {
      console.error('No attendee email in booking');
      return new Response(
        JSON.stringify({ error: 'No attendee email' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if client exists
    let { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('coach_id', profile.id)
      .eq('email', attendeeEmail)
      .maybeSingle();

    // Create client if doesn't exist
    if (!client) {
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          coach_id: profile.id,
          full_name: attendeeName,
          email: attendeeEmail,
          status: 'active',
          notes: 'Created from Cal.com booking',
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating client:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create client' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      client = newClient;
    }

    // Calculate duration in minutes
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

    // Create session
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert({
        coach_id: profile.id,
        client_id: client.id,
        session_date: startTime,
        duration_minutes: durationMinutes,
        status: 'scheduled',
        notes: `Booked via Cal.com: ${title || 'Session'}`,
        location: metadata?.location || 'To be determined',
      });

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Session created successfully from Cal.com booking');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Session created successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
