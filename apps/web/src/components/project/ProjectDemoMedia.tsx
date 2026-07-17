import { cn } from '@/lib/utils';
import type { ProjectMediaSlot } from '@/lib/projectAssets';

function PlaceholderFrame({
  label,
  hint,
  tall,
}: {
  label: string;
  hint: string;
  tall?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background/60 px-4 text-center',
        tall ? 'aspect-video min-h-[200px]' : 'aspect-[16/10] min-h-[160px]',
      )}
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-primary">{label}</span>
      <p className="max-w-xs text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function MediaBlock({ slot, projectId }: { slot: ProjectMediaSlot; projectId: string }) {
  const dropHint = `Drop into career-data/assets/${projectId}/${slot.file}`;

  if (slot.kind === 'image') {
    if (!slot.present) {
      return (
        <PlaceholderFrame
          label={`${slot.role} · image`}
          hint={`${slot.file} — ${dropHint}`}
        />
      );
    }
    return (
      <figure className="overflow-hidden rounded-lg border border-border bg-background/80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={slot.src} alt={slot.caption} className="h-auto w-full object-cover" />
        <figcaption className="border-t border-border px-3 py-2 font-mono text-[10px] text-muted-foreground">
          {slot.caption} · {slot.file}
        </figcaption>
      </figure>
    );
  }

  if (!slot.present) {
    return (
      <PlaceholderFrame
        label={`${slot.role} · video`}
        hint={`${slot.file} — ${dropHint}`}
        tall
      />
    );
  }

  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-background/80">
      <video
        className="aspect-video w-full bg-black"
        controls
        preload="metadata"
        poster={slot.posterSrc}
      >
        <source src={slot.src} type="video/mp4" />
      </video>
      <figcaption className="border-t border-border px-3 py-2 font-mono text-[10px] text-muted-foreground">
        {slot.caption} · {slot.file}
        {!slot.posterSrc ? ' · add poster.png for a preview frame' : ''}
      </figcaption>
    </figure>
  );
}

export function ProjectDemoMedia({
  projectId,
  media,
}: {
  projectId: string;
  media: ProjectMediaSlot[];
}) {
  const cover = media.find((m) => m.role === 'cover');
  const demo = media.find((m) => m.role === 'demo');
  const gallery = media.filter((m) => m.role === 'gallery');

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Local media from{' '}
        <code className="font-mono text-[11px] text-muted-foreground">
          career-data/assets/{projectId}/
        </code>
        . Placeholders show until you drop real files.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {cover ? <MediaBlock slot={cover} projectId={projectId} /> : null}
        {demo ? <MediaBlock slot={demo} projectId={projectId} /> : null}
      </div>

      {gallery.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {gallery.map((slot) => (
            <MediaBlock key={slot.file} slot={slot} projectId={projectId} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
