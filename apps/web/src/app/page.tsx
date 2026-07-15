import { MarketingShell } from '@/components/shell/MarketingShell';
import { Hero } from '@/components/marketing/Hero';
import { Pipeline } from '@/components/marketing/Pipeline';
import { WhatItSolves } from '@/components/marketing/WhatItSolves';
import { Philosophy } from '@/components/marketing/Philosophy';
import { Architecture } from '@/components/marketing/Architecture';
import { FeaturedProjects } from '@/components/marketing/FeaturedProjects';
import { TechCloud } from '@/components/marketing/TechCloud';
import { pickFeaturedProjects } from '@/components/marketing/featuredData';
import { loadResumeIR } from '@/lib/loadGenerated';

export default function LandingPage() {
  const ir = loadResumeIR();
  const projects = pickFeaturedProjects(ir);

  return (
    <MarketingShell>
      <main>
        <Hero />
        <Pipeline />
        <WhatItSolves />
        <Philosophy />
        <Architecture />
        <FeaturedProjects projects={projects} />
        <TechCloud />
      </main>
    </MarketingShell>
  );
}
