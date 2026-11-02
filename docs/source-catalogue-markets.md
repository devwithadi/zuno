# Markets source catalogue

Checked on **31 October 2026** using ordinary HTTPS requests with automatic
redirects disabled and a public-feed reader user agent. Each selected endpoint
returned HTTP 200, a non-empty RSS feed, and a response below the existing
1,000,000-byte limit. The catalogue contains 20 feeds from 19 distinct
institutions or editorial publishers (ECB news and its separate analysis blog); a feed is not a guarantee that every item
has enough evidence to publish a contextual card.

`Public article` means the listed publisher host may supply additional ordinary,
public HTML evidence. It does not authorize bypassing login, consent, payment,
bot restrictions or redirects. `Feed only` means use supplied titles/descriptions
and citations only; never imply access to an unavailable full article. Rich cards
still have to pass the evidence and context gates. Public accessibility is not a
blanket republication or image licence; review distribution-specific terms.

| ID / publisher | Feed | Probe: items / format | Evidence access and coverage |
| --- | --- | --- | --- |
| `sec` — SEC | <https://www.sec.gov/news/pressreleases.rss> | 25 / RSS 2 | Public article: `www.sec.gov`. US securities enforcement, investor protection and market structure; allegations stay attributed. |
| `fed-monetary` — Federal Reserve | <https://www.federalreserve.gov/feeds/press_monetary.xml> | 15 / RSS 2 | Public article: `www.federalreserve.gov`. Monetary decisions and FOMC releases. Distinct from the business catalogue's all-press feed. |
| `ecb` — European Central Bank | <https://www.ecb.europa.eu/rss/press.html> | 15 / RSS 2 | Public article: `www.ecb.europa.eu`. Euro-area policy, speeches and economic analysis; many feed entries are title-only. |
| `boe` — Bank of England | <https://www.bankofengland.co.uk/rss/news> | 50 / RSS 2 | Public article: `www.bankofengland.co.uk`. UK monetary, banking and financial-stability announcements. |
| `bls` — US Bureau of Labor Statistics | <https://www.bls.gov/feed/bls_latest.rss> | 1 / RSS 2 | Public article: `www.bls.gov`. A rolling, substantive latest-indicators snapshot; preserve the separate reference periods for CPI, jobs and other statistics. |
| `cftc` — Commodity Futures Trading Commission | <https://www.cftc.gov/RSS/RSSGP/rssgp.xml> | 10 / RSS 2 | Public article: `www.cftc.gov`. Derivatives regulation, market infrastructure and enforcement; feed descriptions can be empty. |
| `ecb-blog` — ECB Blog | <https://www.ecb.europa.eu/rss/blog.html> | 15 / RSS 2 | Public article: `www.ecb.europa.eu`. Separate central-bank analysis and explanations of euro-area developments; keep the author's qualifications. |
| `cnbc-markets` — CNBC | <https://www.cnbc.com/id/100003114/device/rss/rss.html> | 30 / RSS 2 | Feed only. Market reporting and economic context. Subscription/Pro articles are not fetched. |
| `marketwatch` — MarketWatch | <https://feeds.content.dowjones.io/public/rss/mw_topstories> | 10 / RSS 2 | Feed only. Markets, personal-finance and economic reporting; no Dow Jones paywall access. |
| `ft-markets` — Financial Times | <https://www.ft.com/markets?format=rss> | 25 / RSS 2 | Feed only. Global capital markets. Supplied short descriptions cannot be treated as full-article evidence. |
| `nasdaq` — Nasdaq exchange notices | <https://ir.nasdaq.com/rss/news-releases.xml> | 10 / RSS 2 | Public article: `ir.nasdaq.com`. Exchange operations, listing and delisting announcements. First-party issuer/exchange claims remain attributed. |
| `rbi` — Reserve Bank of India | <https://www.rbi.org.in/pressreleases_rss.xml> | 10 / RSS 2 | Public article: `www.rbi.org.in`. Indian banking, monetary operations and sovereign-gold-bond announcements. Feed timestamps lack an explicit zone. |
| `bloomberg` — Bloomberg Markets | <https://www.bloomberg.com/feeds/markets/news.rss> | 20 / RSS 2 | Feed only. Global market and economic reporting. This is the canonical public feed; no Bloomberg article paywall is fetched or bypassed. |
| `bankcanada` — Bank of Canada | <https://www.bankofcanada.ca/content_type/press/feed/> | 10 / RSS 1 RDF | Public article: `www.bankofcanada.ca`. Canadian monetary decisions and market notices. The first two observed entries had future scheduled dates and must be filtered; eight of the first ten passed the publication-date boundary. |
| `rba` — Reserve Bank of Australia | <https://www.rba.gov.au/rss/rss-cb-media-releases.xml> | 1 / RSS 1 RDF | Public article: `www.rba.gov.au`. Australian central-bank releases. Low cadence is normal, not a reason to fabricate fresh news. |
| `bea` — US Bureau of Economic Analysis | <https://apps.bea.gov/rss/rss.xml> | 49 / RSS 2 | Public article: `www.bea.gov`. GDP, income, consumption and international-trade releases; estimates/revisions remain explicit. |
| `census` — US Census economic indicators | <https://www.census.gov/economic-indicators/indicator.xml> | 18 / RSS 2 | Public article: `www.census.gov`. Housing, retail and other economic releases. Keep uncertainty and “not statistically different” qualifications. |
| `bis-speeches` — Bank for International Settlements | <https://www.bis.org/doclist/mgmtspeeches.rss> | 10 / RSS 1 RDF | Public article: `www.bis.org`. Financial-system, banking and central-bank analysis. Speeches express the named speaker's view; abstracts alone may be thin. |
| `npr-economy` — NPR | <https://feeds.npr.org/1017/rss.xml> | 10 / RSS 2 | Public article: `www.npr.org`. Economic reporting with everyday impact and wider social context. Outbound syndicated hosts remain outside the allowlist. |
| `investing-markets` — Investing.com | <https://www.investing.com/rss/news_301.rss> | 10 / RSS 2 | Feed only. Market/economic news, including crypto and company developments. Reporter/analyst views remain attributed; headlines alone do not establish detailed claims. |

## Parser and timestamp boundaries

Bank of Canada, RBA and BIS use RSS 1/RDF `item` nodes and `dc:date`; the RSS
parser must retain that support. No source may silently assign the current time
when its publication date cannot be parsed. Source timestamps without an
explicit zone are not precise exchange-event timestamps. None of these feeds
provides a live price service.

## Publisher references and excluded candidates

Official directories establish the feed provenance:
[Federal Reserve](https://www.federalreserve.gov/feeds/),
[ECB](https://www.ecb.europa.eu/home/html/rss.en.html),
[Bank of England](https://www.bankofengland.co.uk/rss),
[BLS](https://www.bls.gov/feed/),
[BIS](https://www.bis.org/rss),
[Bank of Canada](https://www.bankofcanada.ca/rss-feeds/) and
[RBA](https://www.rba.gov.au/rss/).

- Bloomberg's older `feeds.bloomberg.com/markets/news.rss` returned 301 to the
  canonical `www.bloomberg.com/feeds/markets/news.rss`, which returned 200. The
  registry uses the canonical endpoint, so normal ingestion need not follow a redirect.
- Guardian Economics was reachable, but excluded because its
  [RSS help](https://help.theguardian.com/article/how-do-i-use-the-guardian-s-rss-feeds)
  limits feed use to personal/non-commercial use; unrestricted redistribution was not established.
- IMF, OECD, Cboe and ICE candidates returned 403. No evasion was attempted.
- FINRA's officially listed `feeds.finra.org` endpoints failed HTTPS; HTTP was not substituted.
- Treasury, FDIC and several guessed legacy endpoints returned 404 or redirected
  to non-feed pages. They are not counted as enabled sources.
- BIS's media-release feed returned an empty RDF feed; the active management-speeches feed is used instead.
- Bank of Canada's general feed was dominated by future calendar entries; the press-specific feed is used instead.
- Kiplinger's feed was over 1.6 MB, exceeding the current size cap; it was not enabled.
- Bruegel's generic feed contained an old event agenda, including “Lunch” and
  “Coffee break”, rather than current usable economic articles. It was not enabled.

- FCA's public feed returned 200 and rich evidence, but its observed date format
  (`Friday, October 30, 2026 - 09:00`) lacks a timezone and fails the current
  date boundary. It is pending a documented timestamp interpretation, not enabled.
