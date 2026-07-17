import { notFound } from 'next/navigation';
import { MarketingShell } from '@/components/shell/MarketingShell';
import { ProjectDetailView } from '@/components/project/ProjectDetailView';
import { resolveProjectDetail } from '@/components/project/projectDetailData';
import { loadResumeIR } from '@/lib/loadGenerated';
import { listProjectMedia } from '@/lib/projectAssets';

type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const detail = resolveProjectDetail(id, loadResumeIR());
  if (!detail) notFound();

  const media = listProjectMedia(id);

  return (
    <MarketingShell>
      <main>
        <ProjectDetailView detail={detail} media={media} />
      </main>
    </MarketingShell>
  );
}
