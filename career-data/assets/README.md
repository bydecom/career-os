# Career data assets (local media)

Local images / videos for project nodes. **Not** under `apps/web/public` —
source of truth lives with knowledge, same as Markdown.

## Layout

```text
career-data/assets/
  README.md                          ← this file
  conversational-state-machine/
    cover.png                        ← card / hero still
    poster.png                       ← video poster frame
    demo.mp4                         ← main walkthrough
    gallery-01.png                   ← optional extras
    …
  career-os/
  graphrag-code/
  …
```

One folder per **project node id** (`frontmatter.id`).

## Markdown (Obsidian-style)

Resolve bare filenames against `career-data/assets/<node-id>/`:

```md
## Demo

![[cover.png|caption=Cover]]

![[demo.mp4|caption=Booking → Order Food → Resume|poster=poster.png]]
```

| Form | Meaning |
|------|---------|
| `![[cover.png]]` | Image embed |
| `![[demo.mp4]]` | Video embed |
| `![[demo.mp4\|caption=…\|poster=poster.png]]` | Video + metadata |

Pipe params (compiler later): `caption`, `poster`, `start`, `autoplay`.

**Do not** use raw HTML (`<img>`, `<video>`) in nodes — hard to compile.

Wiki-links for knowledge stay `[[typescript]]`. Media embeds use `![[…]]` and are **skipped** by the knowledge-edge extractor today (no fake graph edges to `cover.png`).

## Drop-in checklist (every project)

Replace placeholders by copying real files into the folder (keep these names when possible):

| File | Role |
|------|------|
| `cover.png` | Still for Featured / Project hero |
| `poster.png` | Frame shown before video plays |
| `demo.mp4` | Primary demo clip (keep short; Git LFS if large) |
| `gallery-01.png` … | Optional UI screenshots |

Each project folder has a short `README.md` listing the same slots.

## Web / Interview (later)

1. Compiler parses `![[…]]` → media list on the node / Narrative projection.
2. Next.js serves via rewrite or copies into `.next` static from `career-data/assets`.
3. Interview can return `{ type: "video", path: "…" }` in evidence.

Until that ships, drop files here and keep embeds in Markdown so content is ready.

## Git

- Prefer compressed PNG/WebP; short MP4.
- Large demos → [Git LFS](https://git-lfs.com) on `*.mp4` if needed.
