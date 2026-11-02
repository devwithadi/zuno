# Editorial skill assets

Reviewed, project-local reference skills for Zuno's editorial workflow.
These are documentation assets, not executable plugins or autonomous agents.
Runtime editorial instructions stay in `prompts/`; do not load these entire
marketing playbooks into a news-writing request.

| Skill | Source | Commit | Purpose |
| --- | --- | --- | --- |
| marketing-psychology | [Corey Haines](https://github.com/coreyhaines31/marketingskills/tree/820ad2c1c0ac4cc350158bd7912c753681a7d173/skills/marketing-psychology) | `820ad2c1c0ac4cc350158bd7912c753681a7d173` | Reader relevance, familiar language, reduced cognitive effort |
| copywriting | [Corey Haines](https://github.com/coreyhaines31/marketingskills/tree/820ad2c1c0ac4cc350158bd7912c753681a7d173/skills/copywriting) | `820ad2c1c0ac4cc350158bd7912c753681a7d173` | Clear, specific headlines and concrete stakes |
| copy-editing | [Corey Haines](https://github.com/coreyhaines31/marketingskills/tree/820ad2c1c0ac4cc350158bd7912c753681a7d173/skills/copy-editing) | `820ad2c1c0ac4cc350158bd7912c753681a7d173` | Missing context, clarity, evidence and concise sentences |
| humanizer | [Siqi Chen](https://github.com/blader/humanizer/tree/0ef9fe5bc3572734fd3ae6c448fe00a30cd5dcf0) | `0ef9fe5bc3572734fd3ae6c448fe00a30cd5dcf0` | Natural rhythm and removal of empty AI phrasing |

All four are MIT licensed; each directory retains its upstream license.
Retrieved and reviewed on 31 October 2026. SKILL.md and relevant Markdown
references are unchanged upstream copies. Upstream evals, executable scripts,
repository instructions and plugin scaffolding were deliberately excluded.
No upstream code was executed. `SHA256SUMS` records the retained upstream files.

## How Zuno applies them

- Lead with a concrete change; let an accurate headline create interest.
- Explain enough background for someone new to the subject.
- Give each bullet one distinct job and connect the sequence into a brief.
- Explain why a development matters only when the evidence supports it.
- Use familiar words and short sentences; define unavoidable technical terms.
- Sound conversational without forced slang, memes or assumed Gen Z beliefs.
- Cut repetition, inflated adjectives, stock openings and fake dramatic closers.
- Preserve names, dates, numbers, caveats, source identities and citations.

Marketing conversion tactics are outside the factual news contract. Never use
fabricated urgency, FOMO, fear, social proof, unsupported benefits, investment
advice or withheld answers to make a story more clickable. Psychological claims
in these references are writing heuristics, not independently verified science.
Updates require a new pinned commit, review and refreshed checksums.
