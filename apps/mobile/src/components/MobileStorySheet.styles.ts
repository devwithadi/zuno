import { StyleSheet } from 'react-native';
import { colors, font } from '../theme';

export const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17, 24, 39, 0.45)' },
  sheet: { maxHeight: '92%', backgroundColor: colors.paper, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, overflow: 'hidden', boxShadow: '0 -8px 32px rgba(17, 24, 39, 0.16)' },
  handleBar: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.subtle, opacity: 0.6 },
  toolbar: { paddingHorizontal: 22, minHeight: 52, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: 1, borderColor: colors.line },
  label: { fontFamily: font, color: colors.ink, fontSize: 15, fontWeight: '700' },
  close: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.lilac,
    alignItems: 'center', justifyContent: 'center' },
  closeText: { fontFamily: font, color: colors.ink, fontSize: 13, fontWeight: '600' },
  content: { padding: 22, gap: 20 },
  title: { fontFamily: font, color: colors.ink, fontSize: 22, lineHeight: 30,
    fontWeight: '800', letterSpacing: -0.5 },
  sources: { borderTopWidth: 1, borderColor: colors.line, paddingTop: 18, gap: 10 },
  sourcesTitle: { fontFamily: font, color: colors.subtle, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.8 },
  sourceList: { gap: 8 },
  note: { fontFamily: font, color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  errorText: { fontFamily: font, color: colors.amberText, fontSize: 12, lineHeight: 18 },
});
