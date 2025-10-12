import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Create Supabase client with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    console.log("[Personalized Roadmap] Generating for user:", userId);

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    // 1. Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error("[Personalized Roadmap] Profile error:", profileError);
      return NextResponse.json({ error: "Profile not found. Please complete onboarding first." }, { status: 404 });
    }

    console.log("[Personalized Roadmap] Profile loaded:", {
      age: profile.age,
      income_range: profile.income_range,
      primary_goal: profile.primary_goal
    });

    // 2. Build AI prompt
    const prompt = `You are a certified financial planner creating a personalized roadmap. Analyze this user's profile and generate a custom financial action plan.

**USER PROFILE:**
- Age: ${profile.age}
- Income: ${profile.income_range?.replace(/_/g, ' ')}
- Employment: ${profile.employment_status}
- Savings: $${profile.current_savings || 0}
- Debt: $${profile.current_debt || 0}
- Monthly Expenses: $${profile.monthly_expenses || 0}
- Has Emergency Fund: ${profile.has_emergency_fund ? 'Yes' : 'No'}
- Has 401(k): ${profile.has_401k ? 'Yes' : 'No'}
- Has IRA: ${profile.has_ira ? 'Yes' : 'No'}
- Primary Goal: ${profile.primary_goal?.replace(/_/g, ' ')}
- Risk Tolerance: ${profile.risk_tolerance}
- Time Horizon: ${profile.time_horizon}
- Knowledge Level: ${profile.difficulty_level}

**TASK:**
Generate 6-8 financial steps tailored to THIS user's situation. Order by priority (most urgent first).

For each step provide:
1. **title**: Short, actionable (e.g., "Build Your $${Math.ceil((profile.monthly_expenses || 2000) * 3)} Emergency Fund")
2. **description**: Specific to their situation (mention actual numbers from their profile)
3. **priority**: critical | high | medium | low
   - Use "critical" for urgent needs (no emergency fund, high-interest debt)
   - Use "high" for important foundations (401k match, IRA)
   - Use "medium" for optimization
   - Use "low" for advanced strategies
4. **estimated_duration**: e.g., "2-3 months", "6 months", "1 year"
5. **topics**: Array of 3-5 specific learning topics related to this step
6. **custom_advice**: A paragraph of personalized guidance (2-3 sentences, use their actual numbers)
7. **why_this_matters**: Explain why THIS step is prioritized for THEM specifically (1-2 sentences)

**IMPORTANT RULES:**
- Use their actual numbers (e.g., "$${profile.current_debt} debt" not "high debt")
- Prioritize based on their primary goal: ${profile.primary_goal}
- If they have >$5000 debt AND no emergency fund, debt payoff comes first
- If they have high-interest debt (>15%), make that critical priority
- If no emergency fund, that should be high priority
- Match complexity to their knowledge level: ${profile.difficulty_level}
- Be encouraging and specific
- For beginners, use simple language
- For advanced users, include optimization strategies

**OUTPUT FORMAT (valid JSON only, no markdown):**
{
  "steps": [
    {
      "title": "...",
      "description": "...",
      "priority": "critical",
      "estimated_duration": "2 months",
      "topics": ["topic1", "topic2", "topic3"],
      "custom_advice": "...",
      "why_this_matters": "..."
    }
  ],
  "overall_strategy": "A one-sentence summary of the recommended path",
  "key_insight": "One motivational insight based on their situation"
}`;

    console.log("[Personalized Roadmap] Sending prompt to Gemini...");

    // 3. Generate with Gemini
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    });
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("[Personalized Roadmap] Received response from Gemini");

    // Parse JSON (extract from markdown if needed)
    let jsonText = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    // Remove any leading/trailing whitespace
    jsonText = jsonText.trim();

    let roadmapData;
    try {
      roadmapData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("[Personalized Roadmap] JSON parse error:", parseError);
      console.error("[Personalized Roadmap] Response text:", responseText.substring(0, 500));
      return NextResponse.json({ 
        error: "Failed to parse AI response. Please try again." 
      }, { status: 500 });
    }

    if (!roadmapData.steps || !Array.isArray(roadmapData.steps)) {
      console.error("[Personalized Roadmap] Invalid response structure:", roadmapData);
      return NextResponse.json({ 
        error: "Invalid AI response structure. Please try again." 
      }, { status: 500 });
    }

    console.log("[Personalized Roadmap] Generated", roadmapData.steps.length, "steps");

    // 4. Delete existing personalized steps for this user
    const { error: deleteError } = await supabase
      .from('personalized_track_steps')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.warn("[Personalized Roadmap] Delete error (non-fatal):", deleteError);
    }

    // 5. Insert new steps
    const stepsToInsert = roadmapData.steps.map((step: any, index: number) => ({
      user_id: userId,
      step_order: index,
      title: step.title,
      description: step.description,
      priority: step.priority.toLowerCase(),
      estimated_duration: step.estimated_duration,
      topics: step.topics,
      custom_advice: step.custom_advice,
      why_this_matters: step.why_this_matters || null,
      ai_generated: true,
      generation_context: {
        profile_snapshot: {
          age: profile.age,
          income_range: profile.income_range,
          primary_goal: profile.primary_goal,
          current_savings: profile.current_savings,
          current_debt: profile.current_debt,
        },
        generated_at: new Date().toISOString(),
        model: "gemini-2.5-flash",
      },
      status: 'pending',
      has_quiz: true,
    }));

    const { data: insertedSteps, error: insertError } = await supabase
      .from('personalized_track_steps')
      .insert(stepsToInsert)
      .select();

    if (insertError) {
      console.error('[Personalized Roadmap] Insert error:', insertError);
      return NextResponse.json({ 
        error: "Failed to save roadmap to database.",
        details: insertError.message 
      }, { status: 500 });
    }

    console.log("[Personalized Roadmap] Successfully saved", insertedSteps?.length, "steps");

    // 6. Log activity
    await supabase.from('user_activity_log').insert({
      user_id: userId,
      activity_type: 'goal_updated',
      metadata: { 
        roadmap_generated: true, 
        steps_count: stepsToInsert.length,
        timestamp: new Date().toISOString() 
      }
    });

    return NextResponse.json({
      success: true,
      roadmap: roadmapData,
      steps_created: stepsToInsert.length,
      overall_strategy: roadmapData.overall_strategy,
      key_insight: roadmapData.key_insight,
    });

  } catch (error: any) {
    console.error('[Personalized Roadmap] Generation error:', error);
    return NextResponse.json(
      { 
        error: "Failed to generate roadmap",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

