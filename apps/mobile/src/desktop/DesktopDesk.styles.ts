import { StyleSheet } from 'react-native';
import { colors, font } from '../theme';

export const desktopStyles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: colors.background, width: '100%' },
  sidebar: {
    width: 360,
    borderRightWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.background,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sidebarTitle: {
    fontFamily: font,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  sidebarList: { flex: 1 },
  sidebarListContent: { paddingHorizontal: 16, paddingVertical: 12 },
  sidebarFooter: { paddingVertical: 20, alignItems: 'center' },
  readingRoom: { flex: 1, backgroundColor: colors.background },
  readingRoomContent: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    width: '100%',
  },
  end: {
    fontFamily: font,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: 12,
  },
  emptyPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontFamily: font, fontSize: 16, color: colors.muted },
});
