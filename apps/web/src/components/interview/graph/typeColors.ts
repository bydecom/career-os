/** Soft type accents for the Knowledge Graph Explorer — readable on dark UI. */
export const TYPE_COLOR: Record<string, { dot: string; border: string; bg: string; text: string }> = {
  project: {
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
  },
  technology: {
    dot: 'bg-sky-400',
    border: 'border-sky-500/50',
    bg: 'bg-sky-500/10',
    text: 'text-sky-300',
  },
  experience: {
    dot: 'bg-amber-400',
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
  },
  company: {
    dot: 'bg-violet-400',
    border: 'border-violet-500/50',
    bg: 'bg-violet-500/10',
    text: 'text-violet-300',
  },
  profile: {
    dot: 'bg-yellow-400',
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-300',
  },
  decision: {
    dot: 'bg-rose-400',
    border: 'border-rose-500/50',
    bg: 'bg-rose-500/10',
    text: 'text-rose-300',
  },
  metric: {
    dot: 'bg-teal-400',
    border: 'border-teal-500/50',
    bg: 'bg-teal-500/10',
    text: 'text-teal-300',
  },
  achievement: {
    dot: 'bg-orange-400',
    border: 'border-orange-500/50',
    bg: 'bg-orange-500/10',
    text: 'text-orange-300',
  },
  concept: {
    dot: 'bg-fuchsia-400',
    border: 'border-fuchsia-500/50',
    bg: 'bg-fuchsia-500/10',
    text: 'text-fuchsia-300',
  },
};

export const DEFAULT_TYPE_COLOR = {
  dot: 'bg-zinc-400',
  border: 'border-zinc-500/50',
  bg: 'bg-zinc-500/10',
  text: 'text-zinc-300',
};

export function typeColor(type: string) {
  return TYPE_COLOR[type] ?? DEFAULT_TYPE_COLOR;
}

export const TYPE_LABEL: Record<string, string> = {
  project: 'Project',
  technology: 'Technology',
  metric: 'Metric',
  decision: 'Decision',
  experience: 'Experience',
  company: 'Company',
  achievement: 'Achievement',
  concept: 'Concept',
  profile: 'Profile',
};

export function typeLabel(type: string) {
  return TYPE_LABEL[type] ?? type;
}
