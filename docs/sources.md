# Curated source register

Zuno currently has **80 enabled sources: 20 each for AI, technology, business
and markets**. Business includes marketing, advertising, brands and startups;
technology includes security, consumer products, science and creative tools.
The category catalogues record canonical endpoints, measured feed size/depth,
retrieval status, trust context and access limitations:

- [AI sources](source-catalogue-ai.md)
- [Technology sources](source-catalogue-technology.md)
- [Business and marketing sources](source-catalogue-business.md)
- [Markets and economy sources](source-catalogue-markets.md)

Endpoints were checked on 31 October 2026. All selected feeds returned HTTP 200,
contained entries and fit the one-megabyte response cap at that check. Some
research sources publish infrequently; availability is not a promise of daily news.
There are 20 feeds per category, not necessarily 20 independent organizations:
markets includes separate ECB announcements and analysis. Company announcements,
community projects and opinion remain attributed claims, not independently proven facts.

## Access and evidence

Only public, free endpoints are enabled. No source credentials are required.
Bloomberg Business and Bloomberg Markets use the publisher's canonical public
RSS endpoints. Bloomberg, FT and other restricted publishers are feed-only:
Zuno never fetches their paywalled article bodies or claims to have read them.
A feed entry with insufficient evidence is withheld, even from a famous publisher.

Full feed content supplies evidence where available. Selected ordinary public
article hosts are explicitly listed in source metadata. The worker may enrich
short feed entries from those exact hosts, preserving citations and source dates.
It refuses redirects, unapproved hosts, credentials in URLs and pages explicitly
marked inaccessible for free. It does not follow arbitrary article links.

Reading accessibility does not establish redistribution rights. Cards are bounded,
original summaries with links; source preview images retain attribution and remain
at their original URLs. Review publisher terms for the intended distribution.
Sources with known incompatible RSS distribution terms are excluded; access
failures never trigger an anti-bot workaround, authenticated fetch or access bypass.

## Collection and diversity

The scheduled worker checks all eligible source jobs per cycle, with at most four
source collections in flight. Unattempted and least-recently-attempted sources are
prioritized using persisted job timestamps. Failed and leased jobs retain backoff
and remain skipped until eligible. The registry interleaves categories.
Each source supplies at most ten entries; model publication remains separately
bounded to 30 card attempts per cycle, with three drafts in flight. A cycle can
take longer than five minutes; successful retrieval does not guarantee publication.

Only validated, sufficiently contextual briefs are published. Every model-edited
card needs five substantive points and at least 180 words; prompts target
200–260 words covering the event, background, operation, impact and trade-offs.
Missing evidence is not replaced with guesses. See [the workflow](content-workflow.md).

## Deliberate exclusions

Paid feeds, private APIs, access bypasses and live stock-price vendors are outside
scope. Daily.dev needs an API token; Reddit requires approved API access. GitHub
Search is discovery, not the Trending algorithm. Oversized, broken or HTTP-only
feeds are excluded rather than silently weakening fetch boundaries. Category
notes identify specific rejected candidates and their measured limitations.
