# `@career-os/harness` (scaffold)

**Status:** Planned — see [Platform Capability Map](../../docs/00-vision/10-platform-capability-map.md)

Evidence layer outside the runtime pipeline. Harness ≠ CI/CD.

```text
ask() → Runtime → Answer
              ↑
           Harness
   log · evaluate · replay · report
```

## Intended modules

| Folder | Role |
|---|---|
| `telemetry/` | latency, tokens, cost, confidence |
| `dataset/` | golden queries + expected node ids |
| `replay/` | re-run historical queries against new models/prompts |
| `benchmark/` | Precision/Recall, latency, cost reports |
| `evaluator/` | hallucination / citation / win-rate checks |
| `report/` | human-readable experiment summaries |

Today Phase 3A already writes raw evidence to:

- `career-data/generated/query-logs.jsonl`
- `career-data/generated/conversation-logs.jsonl`

Those logs are the seed input for this package when it graduates from scaffold.

**Product name:** Evaluation Platform (replay, golden dataset, regression, cost, hallucination A/B).  
**Package name:** `@career-os/harness` — keep the folder; ship value language to humans.
