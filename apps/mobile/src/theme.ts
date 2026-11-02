import { Platform } from 'react-native';

export const colors = {
  background: '#F8F9FB',
  paper: '#FFFFFF',
  ink: '#111827',
  muted: '#4B5563',
  subtle: '#9CA3AF',
  line: '#E5E7EB',
  violet: '#2563EB',
  violetLight: '#EFF6FF',
  lilac: '#F3F4F6',
  mint: '#F0FDF4',
  mintText: '#166534',
  amberLight: '#FEF3C7',
  amberText: '#92400E',
};
export const font = Platform.select({
  ios: '-apple-system',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
});
export const topicNames = {
  all: 'All stories', ai: 'AI', technology: 'Technology', business: 'Business', markets: 'Markets',
} as const;

export type TopicKey = keyof typeof topicNames;

export const topicThemes: Record<TopicKey, { accent: string; light: string; text: string; border: string }> = {
  all: { accent: '#2563EB', light: '#EFF6FF', text: '#1D4ED8', border: '#DBEAFE' },
  ai: { accent: '#7C3AED', light: '#F5F3FF', text: '#6D28D9', border: '#EDE9FE' },
  technology: { accent: '#0284C7', light: '#F0F9FF', text: '#0369A1', border: '#E0F2FE' },
  business: { accent: '#16A34A', light: '#F0FDF4', text: '#15803D', border: '#DCFCE7' },
  markets: { accent: '#D97706', light: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
};
