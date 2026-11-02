# Technology source catalogue

Checked on 31 October 2026. These 20 enabled sources broaden the technology
feed across developer tools, consumer technology, security, space, games and
creative software. `catalogue-technology.ts` is the executable registry fragment.

Every listed endpoint returned **HTTP 200 without following a redirect** in a
bounded public request with Zuno's identifying user-agent. RSS/Atom feeds parsed
to nonempty entries; the three legacy APIs returned nonempty lists. All feed
responses were below the existing 1,000,000-byte ceiling. Counts below are the
observed complete feed/list size; ingestion separately limits items per source.
“Text” is the approximate plain-text size of the first feed entry, not a promise
that every entry has equal depth. An article is withheld if its supplied evidence
cannot support a contextual brief.

| ID / publisher | Verified endpoint | Entries | First-item evidence | Coverage and trust boundary |
| --- | --- | ---: | --- | --- |
| `hn` Hacker News | https://hacker-news.firebaseio.com/v0/topstories.json | 500 IDs | Per-item metadata; headline-only entries excluded | Community discovery, not independent verification of submitted claims |
| `github` GitHub discovery | https://api.github.com/search/repositories?q=created:%3E2026-08-02+stars:%3E50&sort=stars&per_page=10 | 10 repositories | Metadata plus bounded public README | First-party project descriptions; performance claims remain attributed; date window is generated at runtime |
| `dev` DEV Community | https://dev.to/api/articles?top=7&per_page=10 | 10 articles | Full public article API bodies | Named community authors; distinguish experience/opinion from established facts |
| `cloudflare` Cloudflare Blog | https://blog.cloudflare.com/rss/ | 20 | About 9,790 text characters | First-party engineering/security reports; vendor claims remain attributed |
| `mozilla` Mozilla Hacks | https://hacks.mozilla.org/feed/ | 20 | About 3,307 characters | Browser implementation and open-web updates from Mozilla |
| `github-blog` GitHub Blog | https://github.blog/feed/ | 10 | About 7,410 characters | First-party product and engineering changes |
| `stackoverflow` Stack Overflow Blog | https://stackoverflow.blog/feed/ | 40 | About 439 characters | Developer research, interviews and analysis; some entries need public article enrichment |
| `nasa` NASA | https://www.nasa.gov/feed/ | 10 | About 2,350 characters | Original space/science reporting; relevant article links can use `science.nasa.gov` |
| `apple` Apple Newsroom | https://www.apple.com/newsroom/rss-feed.rss | 20 | About 117 characters | First-party announcements, not independent product testing; short Atom previews need public article evidence |
| `bbc-tech` BBC Technology | https://feeds.bbci.co.uk/news/technology/rss.xml | 21 | About 115 characters | Reported technology news; previews alone cannot support a full summary |
| `ars` Ars Technica | https://feeds.arstechnica.com/arstechnica/index | 20 | About 1,039 characters | Reported technology/science coverage; feed evidence only when article access is restricted |
| `verge` The Verge | https://www.theverge.com/rss/index.xml | 10 | About 726 characters | Reported consumer technology; Atom HTML titles must be normalized |
| `engadget` Engadget | https://www.engadget.com/rss.xml | 20 | About 148 characters | Reported products and consumer technology; short previews need permitted public article evidence |
| `windows` Windows Blog | https://blogs.windows.com/feed/ | 10 | About 3,840 characters | First-party Windows/device updates; preview-build limitations matter |
| `eff` Electronic Frontier Foundation | https://www.eff.org/rss/updates.xml | 50 | About 8,394 characters | Digital rights/security analysis; identify advocacy and legal interpretation as such |
| `krebsonsecurity` Krebs on Security | https://krebsonsecurity.com/feed/ | 10 | About 4,522 characters | Specialist investigative security reporting; preserve attribution and allegations |
| `blender` Blender Developers | https://code.blender.org/feed/ | 10 | About 9,985 characters | First-party 3D, animation and creative-software development |
| `godot` Godot Engine | https://godotengine.org/rss.xml | 15 | About 16,066 characters | First-party game-development tools; distinguish beta snapshots from stable releases |
| `webkit` WebKit | https://webkit.org/feed/ | 10 | About 8,678 characters | First-party browser features and standards implementation |
| `chrome` Chrome Developers | https://developer.chrome.com/blog/feed.xml | 10 | About 150 characters | First-party web-platform updates; short feed descriptions need public article enrichment |

## Access and evidence limits

Public accessibility is not a blanket content or image republication license.
Zuno should publish bounded, original, attributed summaries with source links,
not copied articles. Listed `articleHosts` permit only ordinary public requests
on the source's explicit hosts. They do not permit authentication, paywall bypass,
anti-bot evasion, arbitrary outbound fetches or reading unseen article content.
If enrichment is blocked, redirected or too short, retain the feed evidence and
withhold the card when it cannot support the publishing contract. Publisher
reuse terms need review before public distribution beyond this local preview.

NASA's feed includes science and space as well as technology. EFF publishes
advocacy; Stack Overflow publishes interviews and opinion. GitHub, DEV and HN
are discovery surfaces rather than a certification that all linked claims are
true. Vendor posts must not be rewritten as independent test findings.

## Deliberate exclusions from these 20

- Smashing Magazine's normal feed returned about **1,395,098 bytes**, above Zuno's
  current ceiling; it is not enabled by silently raising that boundary.
- Android Developers' old Blogspot feed redirected to
  `https://developer.android.com/static/blog/atom.xml`; it was not counted without
  separately verifying that canonical destination.
- `https://web.dev/feed.xml` redirected to `/static/blog/feed.xml`; not counted.
- Adobe's tested `/en/feed.xml` and Firefox's tested category feed returned 404.
- Creative Bloq's tested feed redirected to an HTTP location; not counted.
- The tested Inkscape feed timed out; not counted as verified working.

## Discovery references

Direct publisher responses are the availability evidence above. Feed discovery
was cross-checked against [Chrome's official feeds page](https://developer.chrome.com/feeds),
[GitHub's public API documentation](https://docs.github.com/en/rest/search/search),
[the official HN API repository](https://github.com/HackerNews/API), and publisher
feed links returned in the probe. No third-party feed mirror is used at runtime.
