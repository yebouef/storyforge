import { useState } from "react";
import Head from "next/head";

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

const INVEST = ["Independent", "Negotiable", "Valuable", "Estimable", "Small", "Testable"];
const PERSONAS = ["Branch Employee", "Branch Manager", "Customer", "Operations Analyst", "Regional Director"];
const AREAS = ["Account Management", "Customer Onboarding", "Teller Operations", "Loan Processing", "Reporting & Analytics", "Employee Experience", "Digital Banking"];

export default function Home() {
  const [feature, setFeature] = useState("");
  const [persona, setPersona] = useState("Branch Employee");
  const [area, setArea] = useState("Teller Operations");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [expanded, setExpanded] = useState({});

  async function generate() {
    if (!feature.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setExpanded({});

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{
            role: "user",
            content: `Feature Description: ${feature}\nPrimary Persona: ${persona}\nProduct Area: ${area}\n\nGenerate the epic and user stories for this feature.`
          }]
        })
      });
      const data = await resp.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setExpanded({ "US-01": true });
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyStory(story) {
    const text = [
      `${story.id}: ${story.title}`, ``,
      story.story, ``,
      `Acceptance Criteria:`,
      ...story.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`),
      ``, `Story Points: ${story.storyPoints} | Priority: ${story.priority}`
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(story.id);
    setTimeout(() => setCopied(""), 2000);
  }

  function copyAll() {
    if (!result) return;
    const text = [
      `EPIC: ${result.epic.title}`, result.epic.description, ``,
      ...result.stories.flatMap(s => [
        `---`, `${s.id}: ${s.title}`, s.story, ``,
        `Acceptance Criteria:`,
        ...s.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`),
        `Story Points: ${s.storyPoints} | Priority: ${s.priority}`, ``
      ])
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied("all");
    setTimeout(() => setCopied(""), 2000);
  }

  function investScore(invest) {
    return Object.values(invest).filter(Boolean).length;
  }

  const priorityColor = (p) => ({
    High: { bg: "#FEE2E2", text: "#B91C1C" },
    Medium: { bg: "#FEF3C7", text: "#92400E" },
    Low: { bg: "#DCFCE7", text: "#166534" }
  }[p] || { bg: "#F3F4F6", text: "#374151" });

  return (
    <>
      <Head>
        <title>StoryForge — AI User Story Generator</title>
        <meta name="description" content="AI-powered user story generator for branch banking product teams" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "#F0F4F8", color: "#1E293B" }}>

        <div style={{ background: "#0F2847", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: "#2563EB", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: 18 }}>⚡</span>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>StoryForge</div>
              <div style={{ color: "#94A3B8", fontSize: 11 }}>AI-Powered User Story Generator · Branch Operations</div>
            </div>
          </div>
          <div style={{ color: "#64748B", fontSize: 12 }}>Built for Product Associates</div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "start" }}>

          <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", position: "sticky", top: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0F2847", marginBottom: 4 }}>Feature Description</div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>Describe the feature or capability you want to build.</div>

            <textarea
              value={feature}
              onChange={e => setFeature(e.target.value)}
              placeholder="e.g. Allow branch employees to flag a customer account for relationship manager follow-up directly from the teller screen, with a reason code and priority level."
              style={{ width: "100%", minHeight: 130, border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#1E293B", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5, boxSizing: "border-box", outline: "none" }}
              onFocus={e => e.target.style.borderColor = "#2563EB"}
              onBlur={e => e.target.style.borderColor = "#E2E8F0"}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Primary Persona</label>
                <select value={persona} onChange={e => setPersona(e.target.value)}
                  style={{ width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "#1E293B", fontFamily: "inherit", background: "white" }}>
                  {PERSONAS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Product Area</label>
                <select value={area} onChange={e => setArea(e.target.value)}
                  style={{ width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "#1E293B", fontFamily: "inherit", background: "white" }}>
                  {AREAS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <button onClick={generate} disabled={loading || !feature.trim()}
              style={{ width: "100%", marginTop: 16, padding: "11px 0", background: feature.trim() && !loading ? "#2563EB" : "#94A3B8", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: feature.trim() && !loading ? "pointer" : "not-allowed" }}>
              {loading ? "Generating..." : "Generate User Stories"}
            </button>

            <div style={{ marginTop: 20, padding: 14, background: "#F8FAFC", borderRadius: 8, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: "0.05em", marginBottom: 8 }}>INVEST CRITERIA</div>
              {INVEST.map(c => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563EB", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#374151" }}><strong>{c[0]}</strong>{c.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            {!result && !loading && !error && (
              <div style={{ background: "white", borderRadius: 12, padding: 48, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#0F2847", marginBottom: 6 }}>Ready to generate</div>
                <div style={{ fontSize: 13, color: "#64748B", maxWidth: 320, margin: "0 auto" }}>
                  Describe a feature, choose your persona and product area, then generate dev-ready user stories with acceptance criteria.
                </div>
              </div>
            )}

            {loading && (
              <div style={{ background: "white", borderRadius: 12, padding: 48, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <div style={{ width: 40, height: 40, border: "3px solid #E2E8F0", borderTop: "3px solid #2563EB", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 14, color: "#64748B" }}>Analyzing feature and generating stories...</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: 20, color: "#B91C1C", fontSize: 14 }}>
                {error}
              </div>
            )}

            {result && (
              <div>
                <div style={{ background: "#0F2847", borderRadius: 12, padding: "18px 22px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#60A5FA", letterSpacing: "0.08em", marginBottom: 4 }}>EPIC</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 6 }}>{result.epic.title}</div>
                    <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>{result.epic.description}</div>
                  </div>
                  <button onClick={copyAll}
                    style={{ padding: "6px 14px", background: copied === "all" ? "#16A34A" : "#2563EB", color: "white", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", marginLeft: 16, flexShrink: 0 }}>
                    {copied === "all" ? "✓ Copied!" : "Copy All"}
                  </button>
                </div>

                {result.stories.map((story) => {
                  const isOpen = expanded[story.id];
                  const pc = priorityColor(story.priority);
                  const score = investScore(story.invest);
                  return (
                    <div key={story.id} style={{ background: "white", borderRadius: 12, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", border: "1.5px solid #E2E8F0" }}>
                      <div onClick={() => setExpanded(e => ({ ...e, [story.id]: !e[story.id] }))}
                        style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", userSelect: "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", background: "#F1F5F9", padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>{story.id}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F2847" }}>{story.title}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: pc.bg, color: pc.text }}>{story.priority}</span>
                          <span style={{ fontSize: 11, color: "#64748B", background: "#F1F5F9", padding: "2px 8px", borderRadius: 4 }}>{story.storyPoints} pts</span>
                          <div style={{ display: "flex", gap: 2 }}>
                            {INVEST.map(c => (
                              <div key={c} title={c} style={{ width: 8, height: 8, borderRadius: "50%", background: story.invest[c.toLowerCase()] ? "#2563EB" : "#E2E8F0" }} />
                            ))}
                          </div>
                          <span style={{ color: "#94A3B8", fontSize: 16, marginLeft: 4 }}>{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div style={{ padding: "0 18px 18px" }}>
                          <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "12px 14px", marginBottom: 14, borderLeft: "3px solid #2563EB" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", marginBottom: 4 }}>USER STORY</div>
                            <div style={{ fontSize: 13, color: "#1E293B", lineHeight: 1.6 }}>{story.story}</div>
                          </div>

                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 8 }}>ACCEPTANCE CRITERIA</div>
                            {story.acceptanceCriteria.map((ac, i) => (
                              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "white", background: "#0F2847", borderRadius: 4, padding: "2px 6px", flexShrink: 0, marginTop: 1 }}>AC{i + 1}</span>
                                <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{ac}</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 8 }}>INVEST SCORE: {score}/6</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                              {INVEST.map(c => {
                                const pass = story.invest[c.toLowerCase()];
                                return (
                                  <span key={c} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: pass ? "#DCFCE7" : "#FEE2E2", color: pass ? "#166534" : "#B91C1C", fontWeight: 600 }}>
                                    {pass ? "✓" : "✗"} {c}
                                  </span>
                                );
                              })}
                            </div>
                            {story.investNotes && <div style={{ fontSize: 12, color: "#64748B", fontStyle: "italic" }}>{story.investNotes}</div>}
                          </div>

                          <button onClick={() => copyStory(story)}
                            style={{ padding: "7px 16px", background: copied === story.id ? "#16A34A" : "#F1F5F9", color: copied === story.id ? "white" : "#374151", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            {copied === story.id ? "✓ Copied to clipboard" : "Copy story"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}