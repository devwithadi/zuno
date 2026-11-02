import type { Source } from '@zuno/shared';

export const marketsSources: Source[] = [
  { id: 'sec', name: 'SEC press releases', url: 'https://www.sec.gov/news/pressreleases.rss', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.sec.gov'] },
  { id: 'fed-monetary', name: 'Federal Reserve monetary policy', url: 'https://www.federalreserve.gov/feeds/press_monetary.xml', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.federalreserve.gov'] },
  { id: 'ecb', name: 'European Central Bank', url: 'https://www.ecb.europa.eu/rss/press.html', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.ecb.europa.eu'] },
  { id: 'boe', name: 'Bank of England', url: 'https://www.bankofengland.co.uk/rss/news', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.bankofengland.co.uk'] },
  { id: 'bls', name: 'US Bureau of Labor Statistics', url: 'https://www.bls.gov/feed/bls_latest.rss', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.bls.gov'] },
  { id: 'cftc', name: 'Commodity Futures Trading Commission', url: 'https://www.cftc.gov/RSS/RSSGP/rssgp.xml', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.cftc.gov'] },
  { id: 'ecb-blog', name: 'ECB Blog', url: 'https://www.ecb.europa.eu/rss/blog.html', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.ecb.europa.eu'] },
  { id: 'cnbc-markets', name: 'CNBC markets', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', kind: 'rss', topic: 'markets', enabled: true },
  { id: 'marketwatch', name: 'MarketWatch', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', kind: 'rss', topic: 'markets', enabled: true },
  { id: 'ft-markets', name: 'Financial Times markets', url: 'https://www.ft.com/markets?format=rss', kind: 'rss', topic: 'markets', enabled: true },
  { id: 'nasdaq', name: 'Nasdaq exchange notices', url: 'https://ir.nasdaq.com/rss/news-releases.xml', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['ir.nasdaq.com'] },
  { id: 'rbi', name: 'Reserve Bank of India', url: 'https://www.rbi.org.in/pressreleases_rss.xml', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.rbi.org.in'] },
  { id: 'bloomberg', name: 'Bloomberg markets', url: 'https://www.bloomberg.com/feeds/markets/news.rss', kind: 'rss', topic: 'markets', enabled: true },
  { id: 'bankcanada', name: 'Bank of Canada', url: 'https://www.bankofcanada.ca/content_type/press/feed/', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.bankofcanada.ca'] },
  { id: 'rba', name: 'Reserve Bank of Australia', url: 'https://www.rba.gov.au/rss/rss-cb-media-releases.xml', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.rba.gov.au'] },
  { id: 'bea', name: 'US Bureau of Economic Analysis', url: 'https://apps.bea.gov/rss/rss.xml', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.bea.gov'] },
  { id: 'census', name: 'US Census economic indicators', url: 'https://www.census.gov/economic-indicators/indicator.xml', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.census.gov'] },
  { id: 'bis-speeches', name: 'Bank for International Settlements', url: 'https://www.bis.org/doclist/mgmtspeeches.rss', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.bis.org'] },
  { id: 'npr-economy', name: 'NPR economy', url: 'https://feeds.npr.org/1017/rss.xml', kind: 'rss', topic: 'markets', enabled: true, articleHosts: ['www.npr.org'] },
  { id: 'investing-markets', name: 'Investing.com market news', url: 'https://www.investing.com/rss/news_301.rss', kind: 'rss', topic: 'markets', enabled: true },
];
