import { StyleSheet } from 'react-native';
import { colors, font } from '../theme';

export const mobileStoryStyles = StyleSheet.create({
  card: { flex: 1, minHeight: 0, backgroundColor: colors.paper, borderRadius: 28,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.line,
    boxShadow: '0 12px 32px rgba(17, 24, 39, 0.08)' },
  details: { flex: 1, minHeight: 0 },
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 14, gap: 14 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  topic: { fontFamily: font, color: colors.violet, fontSize: 12, lineHeight: 18,
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  detail: { fontFamily: font, color: colors.muted, fontSize: 13, lineHeight: 18 },
  title: { fontFamily: font, color: colors.ink, fontSize: 24, lineHeight: 32,
    fontWeight: '800', letterSpacing: -0.6, flexShrink: 1 },
  label: { fontFamily: font, color: colors.subtle, fontSize: 11, lineHeight: 16,
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 10,
    borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, gap: 4 },
  footerRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',
    justifyContent: 'space-between', gap: 8 },
  expand: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 4 },
  expandText: { fontFamily: font, color: colors.violet, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  pressed: { opacity: 0.6 },
});
