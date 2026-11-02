import type { Source } from '@zuno/shared';

const recent = new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10);
const rss = (id: string, name: string, url: string, articleHosts: string[]): Source =>
  ({ id, name, url, articleHosts, kind: 'rss', topic: 'technology', enabled: true });

export const technologySources: Source[] = [
  { id: 'hn', name: 'Hacker News', url: 'https://hacker-news.firebaseio.com/v0/topstories.json', kind: 'hackernews', topic: 'technology', enabled: true },
  { id: 'github', name: 'GitHub discovery', url: `https://api.github.com/search/repositories?q=created:>${recent}+stars:>50&sort=stars&per_page=10`, kind: 'github', topic: 'technology', enabled: true },
  { id: 'dev', name: 'DEV Community', url: 'https://dev.to/api/articles?top=7&per_page=10', kind: 'dev', topic: 'technology', enabled: true },
  rss('cloudflare', 'Cloudflare Blog', 'https://blog.cloudflare.com/rss/', ['blog.cloudflare.com']),
  rss('mozilla', 'Mozilla Hacks', 'https://hacks.mozilla.org/feed/', ['hacks.mozilla.org']),
  rss('github-blog', 'GitHub Blog', 'https://github.blog/feed/', ['github.blog']),
  rss('stackoverflow', 'Stack Overflow Blog', 'https://stackoverflow.blog/feed/', ['stackoverflow.blog']),
  rss('nasa', 'NASA', 'https://www.nasa.gov/feed/', ['www.nasa.gov', 'science.nasa.gov']),
  rss('apple', 'Apple Newsroom', 'https://www.apple.com/newsroom/rss-feed.rss', ['www.apple.com']),
  rss('bbc-tech', 'BBC Technology', 'https://feeds.bbci.co.uk/news/technology/rss.xml', ['www.bbc.co.uk', 'www.bbc.com']),
  rss('ars', 'Ars Technica', 'https://feeds.arstechnica.com/arstechnica/index', ['arstechnica.com']),
  rss('verge', 'The Verge', 'https://www.theverge.com/rss/index.xml', ['www.theverge.com']),
  rss('engadget', 'Engadget', 'https://www.engadget.com/rss.xml', ['www.engadget.com']),
  rss('windows', 'Windows Blog', 'https://blogs.windows.com/feed/', ['blogs.windows.com']),
  rss('eff', 'Electronic Frontier Foundation', 'https://www.eff.org/rss/updates.xml', ['www.eff.org']),
  rss('krebsonsecurity', 'Krebs on Security', 'https://krebsonsecurity.com/feed/', ['krebsonsecurity.com']),
  rss('blender', 'Blender Developers', 'https://code.blender.org/feed/', ['code.blender.org']),
  rss('godot', 'Godot Engine', 'https://godotengine.org/rss.xml', ['godotengine.org']),
  rss('webkit', 'WebKit', 'https://webkit.org/feed/', ['webkit.org']),
  rss('chrome', 'Chrome Developers', 'https://developer.chrome.com/blog/feed.xml', ['developer.chrome.com']),
];
