// Narrative structure templates keyed by RetrievalProfile.promptTemplate filename.
// VERBALIZE_SYSTEM_PROMPT stays the shared persona/language layer; these only
// shape the answer outline for a given InterviewIntent.

export const NARRATIVE_TEMPLATES: Record<string, string> = {
  'introduction.md': `Structure the answer as a short professional introduction:
1. Who I am (role / focus) — 1-2 sentences
2. Strongest proof points from experience or projects in the IR
3. What I am looking for / how I work (only if present in the IR)
Keep it concise (about 30–90 seconds spoken).`,

  'project_story.md': `Structure the answer as a project story:
1. Problem — what needed solving
2. Architecture / approach — how I built it (from IR only)
3. Tradeoff — what I chose and why
4. Outcome — evidence / results present in the IR
Do not invent metrics or decisions missing from the IR.`,

  'technology.md': `Structure the answer around the technology:
1. Role of the technology in my work
2. Projects where I used it (from IR)
3. Related decisions or tradeoffs if present
4. Evidence / outcomes if present
Keep the technology as the lead subject; projects are supporting evidence.`,

  'decision.md': `Structure the answer as an engineering decision:
1. Decision — what I chose
2. Tradeoff — what I gave up or constrained
3. Alternatives considered (only if in the IR)
4. Evidence that validated the choice
Stay first-person and evidence-bound.`,
};

export function getNarrativeTemplate(promptTemplate: string | undefined): string | undefined {
  if (!promptTemplate) return undefined;
  return NARRATIVE_TEMPLATES[promptTemplate];
}
