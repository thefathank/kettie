import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("ResendKey");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  clientEmail: string;
  clientName: string;
  type: "note" | "video" | "lesson";
  title: string;
  content?: string;
  videoUrl?: string;
  date?: string;
  lesson?: {
    objectives?: string;
    exercises: Array<{
      name: string;
      description?: string;
      duration?: number;
      videoUrls?: string[];
    }>;
    duration_minutes?: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received email send request");
    const { clientEmail, clientName, type, title, content, videoUrl, date, lesson }: SendEmailRequest = await req.json();

    console.log(`Sending ${type} to ${clientEmail}`);

    let emailHtml = "";
    let subject = "";

    if (type === "note") {
      subject = `Progress Note: ${title}`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Progress Note from Your Coach</h1>
          <h2 style="color: #666;">${title}</h2>
          ${date ? `<p style="color: #888; font-size: 14px;">Date: ${date}</p>` : ""}
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="white-space: pre-wrap; line-height: 1.6;">${content}</p>
          </div>
          <p style="color: #666; margin-top: 30px;">Keep up the great work!</p>
          <p style="color: #666;">- Your Coach</p>
        </div>
      `;
    } else if (type === "video") {
      subject = `Training Video: ${title}`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Training Video from Your Coach</h1>
          <h2 style="color: #666;">${title}</h2>
          ${content ? `<p style="color: #666; margin: 20px 0;">${content}</p>` : ""}
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin-bottom: 15px;">Your coach has shared a training video with you.</p>
            <a href="${videoUrl}" 
               style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Watch Video
            </a>
          </div>
          <p style="color: #666; margin-top: 30px;">Keep training hard!</p>
          <p style="color: #666;">- Your Coach</p>
        </div>
      `;
    } else if (type === "lesson") {
      subject = `Lesson Plan: ${title}`;
      const exercisesHtml = lesson?.exercises.map((exercise, index) => `
        <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e0e0e0;">
          <h3 style="margin: 0 0 10px 0; color: #0066cc;">${index + 1}. ${exercise.name}</h3>
          ${exercise.description ? `<p style="margin: 5px 0; color: #666;">${exercise.description}</p>` : ""}
          ${exercise.duration ? `<p style="margin: 5px 0; color: #888;"><strong>Duration:</strong> ${exercise.duration} minutes</p>` : ""}
          ${exercise.videoUrls && exercise.videoUrls.length > 0 ? `
            <div style="margin-top: 10px;">
              <strong>Reference Videos:</strong>
              ${exercise.videoUrls.map((url, i) => `<br/><a href="${url}" style="color: #0066cc;">Video ${i + 1}</a>`).join("")}
            </div>
          ` : ""}
        </div>
      `).join("") || "";

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Lesson Plan from Your Coach</h1>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0; color: #0066cc;">${title}</h2>
            ${lesson?.duration_minutes ? `<p style="color: #666;"><strong>Duration:</strong> ${lesson.duration_minutes} minutes</p>` : ""}
            ${lesson?.objectives ? `<p style="margin-top: 10px;"><strong>Objectives:</strong> ${lesson.objectives}</p>` : ""}
          </div>
          ${exercisesHtml ? `<h3 style="color: #333;">Exercises:</h3>${exercisesHtml}` : ""}
          <p style="color: #666; margin-top: 30px;">Looking forward to working on these drills with you!</p>
          <p style="color: #666;">- Your Coach</p>
        </div>
      `;
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Pro Pointers Plus <noreply@mail.propointersplus.com>",
        to: [clientEmail],
        subject: subject,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-client-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
