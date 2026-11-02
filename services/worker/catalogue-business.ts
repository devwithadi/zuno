import type { Source } from '@zuno/shared';

export const businessSources: Source[] = [
  { id: 'fed', name: 'Federal Reserve', url: 'https://www.federalreserve.gov/feeds/press_all.xml', kind: 'rss', topic: 'business', enabled: true, articleHosts: ['www.federalreserve.gov'] },
  { id: 'bbc-business', name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', kind: 'rss', topic: 'business', enabled: true },
  { id: 'npr-business', name: 'NPR Business', url: 'https://feeds.npr.org/1006/rss.xml', kind: 'rss', topic: 'business', enabled: true },
  { id: 'cnbc-business', name: 'CNBC Business', url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', kind: 'rss', topic: 'business', enabled: true },
  { id: 'bloomberg-business', name: 'Bloomberg Business', url: 'https://www.bloomberg.com/feeds/business/news.rss', kind: 'rss', topic: 'business', enabled: true },
  { id: 'fortune-business', name: 'Fortune', url: 'https://fortune.com/feed/fortune-feeds/?id=3230629', kind: 'rss', topic: 'business', enabled: true },
  { id: 'fast-company', name: 'Fast Company', url: 'https://www.fastcompany.com/latest/rss', kind: 'rss', topic: 'business', enabled: true },
  { id: 'entrepreneur', name: 'Entrepreneur', url: 'https://www.entrepreneur.com/rss-feed/latest', kind: 'rss', topic: 'business', enabled: true, articleHosts: ['www.entrepreneur.com'] },
  { id: 'marketing-dive', name: 'Marketing Dive', url: 'https://www.marketingdive.com/feeds/news/', kind: 'rss', topic: 'business', enabled: true, articleHosts: ['www.marketingdive.com'] },
  { id: 'retail-dive', name: 'Retail Dive', url: 'https://www.retaildive.com/feeds/news/', kind: 'rss', topic: 'business', enabled: true, articleHosts: ['www.retaildive.com'] },
  { id: 'marketing-week', name: 'Marketing Week', url: 'https://www.marketingweek.com/feed/', kind: 'rss', topic: 'business', enabled: true },
  { id: 'search-engine-journal', name: 'Search Engine Journal', url: 'https://www.searchenginejournal.com/feed/', kind: 'rss', topic: 'business', enabled: true, articleHosts: ['www.searchenginejournal.com'] },
  { id: 'social-media-today', name: 'Social Media Today', url: 'https://www.socialmediatoday.com/feeds/news/', kind: 'rss', topic: 'business', enabled: true },
  { id: 'buffer', name: 'Buffer Resources', url: 'https://buffer.com/resources/rss/', kind: 'rss', topic: 'business', enabled: true },
  { id: 'stripe-business', name: 'Stripe Blog', url: 'https://stripe.com/blog/feed.rss', kind: 'rss', topic: 'business', enabled: true, articleHosts: ['stripe.com'] },
  { id: 'yc-business', name: 'Y Combinator Blog', url: 'https://www.ycombinator.com/blog/rss/', kind: 'rss', topic: 'business', enabled: true },
  { id: 'pr-daily', name: 'PR Daily', url: 'https://www.prdaily.com/feed/', kind: 'rss', topic: 'business', enabled: true },
  { id: 'martech', name: 'MarTech', url: 'https://martech.org/feed/', kind: 'rss', topic: 'business', enabled: true },
  { id: 'chiefmartec', name: 'Chiefmartec', url: 'https://chiefmartec.com/feed/', kind: 'rss', topic: 'business', enabled: true },
  { id: 'small-business-trends', name: 'Small Business Trends', url: 'https://smallbiztrends.com/feed/', kind: 'rss', topic: 'business', enabled: true, articleHosts: ['smallbiztrends.com'] },
];
