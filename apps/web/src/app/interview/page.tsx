import { MarketingShell } from '@/components/shell/MarketingShell';
import { InterviewWorkspace } from '@/components/interview/InterviewWorkspace';

export default function InterviewPage() {
  return (
    <MarketingShell hideFooter lockViewport>
      <main className="h-full min-h-0">
        <InterviewWorkspace />
      </main>
    </MarketingShell>
  );
}
