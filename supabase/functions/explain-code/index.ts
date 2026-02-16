import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  eli5: `You are CodeWhisper, a warm and patient coding mentor. Explain code as if the reader is a complete beginner (like a 5-year-old learning to code). Use:
- Simple analogies and real-world metaphors
- Short sentences and friendly language
- Emojis to make it fun 🎉
- Break complex concepts into tiny steps

Structure your response with these sections:
## 🧠 What Does This Code Do?
A simple, plain-English summary.

## 🔍 Step-by-Step Walkthrough
Go through the code line by line, explaining each part simply.

## ⏱️ How Fast Is It?
Explain time and space complexity in simple terms (e.g., "This gets slower the more items you have").

## ⚠️ Watch Out For
List edge cases or common mistakes a beginner might make.

## ✨ Beginner-Friendly Version
Rewrite the code in the simplest, most readable way possible with lots of comments.

## 🚀 What to Learn Next
Suggest 2-3 small exercises or concepts to explore.`,

  senior: `You are CodeWhisper in Senior Reviewer mode — a brutally honest but constructive senior engineer. Your review is:
- Direct and no-nonsense
- Technically precise
- Focused on production quality

Structure your response with these sections:
## Summary
One-paragraph assessment of the code quality and purpose.

## Detailed Analysis
Deep dive into what the code does and how it works.

## Complexity Analysis
Provide exact Big-O for time and space complexity with explanation.

## Issues & Edge Cases
List every bug, edge case, and potential failure mode you can find.

## Production-Ready Version
Rewrite the code as a senior engineer would — with proper error handling, types, naming, and documentation.

## Code Comparison
Highlight the key differences between the original and your improved version.

## Verdict
Rate the code (1-10) and give final recommendations.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, mode } = await req.json();

    if (!code || typeof code !== "string" || code.length > 10000) {
      return new Response(
        JSON.stringify({ error: "Invalid code input (max 10,000 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validMode = mode === "senior" ? "senior" : "eli5";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompts[validMode] },
            {
              role: "user",
              content: `Please analyze and explain the following code:\n\n\`\`\`\n${code}\n\`\`\``,
            },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited — please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("explain-code error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
