import { StyleSheet } from 'react-native';
import { colors, font } from '../theme';

export const deckStyles = StyleSheet.create({
  deck: { flex: 1, minHeight: 0, backgroundColor: colors.background },
  toolbar: {
    paddingHorizontal: 16, height: 48, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', gap: 10,
  },
  leftGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  undoBtn: {
    minHeight: 36, minWidth: 36, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 12, backgroundColor: colors.paper, borderWidth: 1,
    borderColor: colors.line, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 4,
  },
  undoIcon: { fontFamily: font, fontSize: 14, color: colors.ink, fontWeight: '700' },
  undoText: { fontFamily: font, fontSize: 12, color: colors.ink, fontWeight: '600' },
  undoDisabled: { opacity: 0.35 },
  undoPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
    backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.subtle },
  dotActive: { backgroundColor: colors.violet },
  label: { color: colors.muted, fontFamily: font, fontSize: 12, fontWeight: '500' },
  counter: { color: colors.ink, fontFamily: font, fontSize: 12, fontWeight: '700' },
  counterTotal: { color: colors.subtle, fontWeight: '400' },
  stage: { flex: 1, minHeight: 0, marginHorizontal: 14, marginTop: 4, marginBottom: 16 },
  card: { flex: 1, minHeight: 0 },
  back: {
    position: 'absolute', top: 14, left: 8, right: 8, bottom: -10,
    borderRadius: 28, backgroundColor: colors.line, opacity: 0.65,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  error: { color: colors.muted, fontFamily: font, fontSize: 12, paddingHorizontal: 20, paddingBottom: 8 },
});
