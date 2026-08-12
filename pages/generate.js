import Anthropic from "@anthropic-ai/sdk";

const systemPrompt = `You are a senior product analyst specializing in financial services and branch banking operations. 
Your job is to generate well-structured product artifacts from feature descriptions.

When given a feature description, persona, and product area, output ONLY valid JSON — no markdown, no explanation, no preamble.

The JSON must follow this exact structure:
{
  "epic": {
    "title": "Short epic title (5-8 words)",
    "description": "One clear sentence describing the epic's business objective and value."
  },
  "stories": [
    {
      "id": "US-01",
      "title": "Short story title",
      "story": "As a [persona], I want [specific goal], so that [clear business benefit].",
      "priority": "High|Medium|Low",
      "storyPoints": 3,
      "acceptanceCriteria": [
        "Given [initial context], When [action is taken], Then [expected outcome].",
        "Given [another context], When [another action], Then [another outcome]."
      ],
      "invest": {
        "independent": true,
        "negotiable": true,
        "valuable": true,
        "estimable": true,
        "small": true,
        "testable": true
      },
      "investNotes": "One sentence on any INVEST concern, or confirming quality."
    }
  ]
}

Generate 3 to 4 stories. Make them specific to financial services and branch banking.
Ensure acceptance criteria use real Given/When/Then format with concrete, testable conditions.
Story points should be realistic: 1, 2, 3, 5, or 8.
Set invest criteria honestly — if a story is too large, mark small as false.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { feature, persona, area } = req.body;

  if (!feature || !persona || !area) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Feature Description: ${feature}\nPrimary Persona: ${persona}\nProduct Area: ${area}\n\nGenerate the epic and user stories for this feature.`
        }
      ]
    });

    const raw = message.content[0]?.text || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Generation error:", error);
    return res.status(500).json({ error: "Failed to generate stories. Please try again." });
  }
}
