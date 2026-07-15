import Link from 'next/link';
import { MarketingShell } from '@/components/shell/MarketingShell';
import { loadResumeIR, generatedHint } from '@/lib/loadGenerated';

export default function ResumePage() {
  const ir = loadResumeIR();

  if (!ir) {
    return (
      <MarketingShell>
        <main className="mx-auto max-w-2xl px-6 py-20 md:px-10">
          <p className="text-xs uppercase tracking-widest text-primary">Resume</p>
          <h1 className="mt-3 text-3xl font-semibold">No ResumeIR yet</h1>
          <pre className="mt-6 overflow-x-auto rounded-lg border border-border bg-card/40 p-4 font-mono text-xs text-muted">
            {`npm run compile\nnpm run resume`}
          </pre>
          <p className="mt-4 text-sm text-muted">Looking in: {generatedHint()}</p>
        </main>
      </MarketingShell>
    );
  }

  const { profile, experiences, projects, skills, education } = ir;
  const contact = [profile.location, profile.email, profile.github, profile.linkedin, profile.website]
    .filter((x) => x && x.trim())
    .join(' · ');

  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">Projection · ResumeIR</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{profile.name}</h1>
            {profile.headline ? <p className="mt-1 text-primary">{profile.headline}</p> : null}
            {contact ? <p className="mt-3 text-sm text-muted">{contact}</p> : null}
          </div>
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            ← CareerOS
          </Link>
        </div>

        {profile.summary ? (
          <section className="border-t border-border py-8">
            <h2 className="text-xs uppercase tracking-widest text-muted">Summary</h2>
            <p className="mt-4 text-sm leading-relaxed text-foreground/90">{profile.summary}</p>
          </section>
        ) : null}

        {experiences.length > 0 ? (
          <section className="border-t border-border py-8">
            <h2 className="text-xs uppercase tracking-widest text-muted">Experience</h2>
            <ul className="mt-6 space-y-6">
              {experiences.map((exp) => (
                <li key={exp.id}>
                  <p className="font-medium">
                    {exp.role} — {exp.companyName}
                  </p>
                  <p className="text-sm text-muted">
                    {exp.startDate}
                    {exp.endDate ? ` — ${exp.endDate}` : ' — Present'}
                  </p>
                  {exp.summary ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted">{exp.summary}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {projects.length > 0 ? (
          <section className="border-t border-border py-8">
            <h2 className="text-xs uppercase tracking-widest text-muted">Projects</h2>
            <ul className="mt-6 space-y-6">
              {projects.map((project) => (
                <li key={project.id}>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-muted">
                    {[project.period, project.role].filter(Boolean).join(' · ')}
                  </p>
                  {project.summary ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted">{project.summary}</p>
                  ) : null}
                  {project.technologies.length > 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {project.technologies.join(', ')}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {skills.length > 0 ? (
          <section className="border-t border-border py-8">
            <h2 className="text-xs uppercase tracking-widest text-muted">Skills</h2>
            <p className="mt-4 text-sm text-muted">{skills.map((s) => s.name).join(', ')}</p>
          </section>
        ) : null}

        {education.length > 0 ? (
          <section className="border-t border-border py-8">
            <h2 className="text-xs uppercase tracking-widest text-muted">Education</h2>
            <ul className="mt-4 space-y-2">
              {education.map((edu) => (
                <li key={edu.id} className="text-sm text-muted">
                  <span className="font-medium text-foreground">{edu.name}</span>
                  {edu.summary ? ` — ${edu.summary}` : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </MarketingShell>
  );
}
