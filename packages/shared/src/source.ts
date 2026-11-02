import type { Topic } from './story.js';

export type SourceImage = { url: string; alt: string; credit?: string };

export type Source = {
  id: string;
  name: string;
  url: string;
  kind: 'rss' | 'hackernews' | 'github' | 'dev';
  topic: Topic;
  enabled: boolean;
  articleHosts?: string[];
};
export type Evidence = {
  id: string;
  sourceId: string;
  sourceName: string;
  url: string;
  title: string;
  text: string;
  publishedAt: string;
  topic: Topic;
  image?: SourceImage;
};
