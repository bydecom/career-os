// ---------------------------------------------------------------------------
// InterviewIntent — closed enum for the Interview Router (ADR-0004).
// LLM may only pick a value from this set; it never invents intents.
// ---------------------------------------------------------------------------

export enum InterviewIntent {
  INTRODUCTION = 'INTRODUCTION',
  PROJECT_STORY = 'PROJECT_STORY',
  TECH_DISCUSSION = 'TECH_DISCUSSION',
  ENGINEERING_DECISION = 'ENGINEERING_DECISION',
  COMPARE = 'COMPARE',
  ARCHITECTURE = 'ARCHITECTURE',
  FOLLOW_UP = 'FOLLOW_UP',
  CLARIFICATION = 'CLARIFICATION',
  CHALLENGE = 'CHALLENGE',
  RECOMMENDATION = 'RECOMMENDATION',
  UNKNOWN = 'UNKNOWN',
}

const INTENT_VALUES = new Set<string>(Object.values(InterviewIntent));

export function isInterviewIntent(value: unknown): value is InterviewIntent {
  return typeof value === 'string' && INTENT_VALUES.has(value);
}

/** Human label for Runtime Trace / logs. */
export function formatInterviewIntent(intent: InterviewIntent): string {
  switch (intent) {
    case InterviewIntent.INTRODUCTION:
      return 'Introduction';
    case InterviewIntent.PROJECT_STORY:
      return 'Project Story';
    case InterviewIntent.TECH_DISCUSSION:
      return 'Tech Discussion';
    case InterviewIntent.ENGINEERING_DECISION:
      return 'Engineering Decision';
    case InterviewIntent.COMPARE:
      return 'Comparison';
    case InterviewIntent.ARCHITECTURE:
      return 'Architecture';
    case InterviewIntent.FOLLOW_UP:
      return 'Follow-up';
    case InterviewIntent.CLARIFICATION:
      return 'Clarification';
    case InterviewIntent.CHALLENGE:
      return 'Challenge';
    case InterviewIntent.RECOMMENDATION:
      return 'Recommendation';
    default:
      return 'Unknown';
  }
}
