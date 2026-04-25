import {
  Dimensions,
  PixelRatio,
  Platform,
  StatusBar,
  StyleSheet,
} from "react-native";

const normalizeFontSize = (size) => {
  let { width, height } = Dimensions.get("window");
  if (Platform.OS === "web" && height / width < 1) {
    width /= 2.3179;
    height *= 0.7668;
  }
  const scale = Math.min(width / 375, height / 667); // Based on a standard screen size
  return PixelRatio.roundToNearestPixel(size * scale);
};

export const screenHeight = Dimensions.get("screen").height;
export const windowHeight = Dimensions.get("window").height;
export const mainColor = "#4286F5";
export const secondaryColor = "#F5B142";
export const tertiaryColor = "#F542DF";
export const quaternaryColor = "#42F557";
export const backgroundColor = "#000000";

export const header = 70;
export const footer = 60;
export const ratio =
  Dimensions.get("window").height / Dimensions.get("window").width;
export const main =
  Dimensions.get("window").height -
  (header + footer + (ratio > 1.7 ? 0 : StatusBar.currentHeight));
export const StatusBarHeight = StatusBar.currentHeight;
export const NavigatorBarHeight = screenHeight - windowHeight;
export const iconSize = normalizeFontSize(24);
export const ICON_SIZE_SMALL = normalizeFontSize(14);
export const roundButtonSize = normalizeFontSize(24);

// Design tokens
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: normalizeFontSize(12),
  sm: normalizeFontSize(14),
  md: normalizeFontSize(16),
  lg: normalizeFontSize(18),
  xl: normalizeFontSize(24),
  xxl: normalizeFontSize(28),
  xxxl: normalizeFontSize(32),
  display: normalizeFontSize(36),
  hero: normalizeFontSize(38),
};

export const colors = {
  background: "#000000",
  surface: "#1a1a1a",
  surfaceElevated: "#1F2937",
  card: "rgba(26, 26, 26, 0.85)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  glassBg: "rgba(255, 255, 255, 0.06)",
  glassBorder: "rgba(255, 255, 255, 0.12)",
  textPrimary: "#ffffff",
  textSecondary: "#9CA3AF",
  textMuted: "#666666",
  primary: mainColor,
  secondary: secondaryColor,
  tertiary: tertiaryColor,
  success: "#42F557",
  warning: "#ffaa00",
  error: "#EF4444",
  gradientDark: ["#000000", "#0a0a0a", "#1a1a1a", "#0a0a0a", "#000000"],
};

const GlobalStyles = StyleSheet.create({
  // Globals Layout
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor,
  },
  scrollContainer: {
    width: "100%",
    height: "auto",
  },
  scrollContainerContent: {
    height: "100%",
    width: "100%",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 20,
  },
  // Tab 2
  header: {
    height: header,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
  },
  main: {
    flex: 1,
    backgroundColor,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    width: "100%",
    height: footer,
    display: "flex",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.10)",
    backgroundColor: "rgba(20, 20, 20, 0.92)",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  // Header Layout
  headerItem: {
    flexDirection: "column",
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  // Main Layout
  mainItem: {
    flexDirection: "row",
    width: "100%",
    height: "auto",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // Footer Layout
  selector: {
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderRightColor: mainColor,
    borderLeftColor: mainColor,
  },
  selectorText: {
    fontSize: normalizeFontSize(14),
    color: "white",
    textAlign: "center",
    fontFamily: "Exo2_400Regular",
  },
  selectorSelectedText: {
    fontSize: normalizeFontSize(14),
    color: mainColor,
    textAlign: "center",
    fontFamily: "Exo2_700Bold",
  },
  // General text
  balance: {
    fontSize: normalizeFontSize(38),
    color: "white",
    marginTop: 10,
    fontFamily: "Exo2_700Bold",
    textShadowColor: "rgba(66, 134, 245, 0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  title: {
    fontSize: normalizeFontSize(26),
    color: "#fff",
    textAlign: "center",
    fontFamily: "Exo2_700Bold",
  },
  titlePaymentToken: {
    fontSize: normalizeFontSize(26),
    color: "#fff",
    textAlign: "center",
    fontFamily: "Exo2_700Bold",
    marginVertical: ratio > 1.7 ? 36 : 50,
  },
  description: {
    fontWeight: "bold",
    fontSize: normalizeFontSize(14),
    textAlign: "center",
    color: "#ffffff",
  },
  formTitle: {
    color: "white",
    textAlign: "left",
    textAlignVertical: "center",
    fontFamily: "Exo2_700Bold",
    fontSize: normalizeFontSize(18),
  },
  formTitleCard: {
    color: "white",
    textAlign: "left",
    textAlignVertical: "center",
    fontFamily: "Exo2_700Bold",
    fontSize: normalizeFontSize(24),
  },
  exoTitle: {
    color: "white",
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: "Exo2_700Bold",
    fontSize: normalizeFontSize(24),
  },
  // Globals Buttons
  buttonContainer: {
    width: "100%",
    gap: 4,
  },
  buttonStyle: {
    backgroundColor: mainColor,
    borderRadius: 50,
    padding: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderColor: mainColor,
    borderWidth: 2,
    transform: [{ scale: 1 }],
    shadowColor: mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonStylePressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  buttonCancelStyle: {
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderRadius: 50,
    padding: 10,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  buttonText: {
    color: "white",
    fontSize: normalizeFontSize(24),
    fontFamily: "Exo2_700Bold",
  },
  buttonTextSmall: {
    color: "white",
    fontSize: normalizeFontSize(20),
    fontFamily: "Exo2_700Bold",
  },
  buttonCancelText: {
    color: "#9CA3AF",
    fontSize: normalizeFontSize(24),
    fontFamily: "Exo2_700Bold",
  },
  singleButton: {
    backgroundColor: mainColor,
    borderRadius: 50,
    width: normalizeFontSize(60),
    height: normalizeFontSize(60),
    alignItems: "center",
    justifyContent: "center",
  },
  singleButtonText: {
    color: "white",
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: "Exo2_400Regular",
  },
  buttonSelectorSelectedStyle: {
    backgroundColor: "rgba(30, 36, 35, 0.85)",
    borderWidth: 1.5,
    padding: 8,
    alignItems: "center",
    borderColor: mainColor,
    borderRadius: 12,
    minWidth: "30%",
    shadowColor: mainColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: ratio > 1.7 ? main * 0.47 : main * 0.45,
  },
  tokensContainer: {
    height: 10,
    marginBottom: 0,
  },

  // Tab 3
  tab3Container: {
    width: "100%",
    height: "100%",
  },
  tab3ScrollContainer: {
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  // Networks
  networkShow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    height: 64,
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  network: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 64,
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  networkMarginIcon: {
    marginHorizontal: normalizeFontSize(10),
  },
  networkTokenName: {
    fontSize: normalizeFontSize(18),
    color: "white",
  },
  networkTokenData: {
    fontSize: normalizeFontSize(12),
    color: "white",
  },
  // Send Styles
  inputText: {
    fontSize: normalizeFontSize(18),
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
  },
  picker: {
    borderRadius: 5,
    borderColor: secondaryColor,
    borderWidth: 2,
    color: "black",
    backgroundColor: "white",
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    textAlign: "center",
    height: normalizeFontSize(50),
    marginVertical: 1,
    fontSize: normalizeFontSize(24),
    width: "100%",
  },
  input: {
    borderRadius: 5,
    borderColor: secondaryColor,
    borderWidth: 2,
    color: "black",
    backgroundColor: "white",
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    textAlign: "center",
    height: normalizeFontSize(50),
    fontSize: normalizeFontSize(24),
    width: "100%",
    marginVertical: 1,
  },
  inputChat: {
    borderRadius: 16,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    color: "#ffffff",
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    fontSize: normalizeFontSize(18),
    fontFamily: "Exo2_400Regular",
    padding: 12,
    textAlign: "justify",
    width: "84%",
  },
  // Profile Section Styles
  profileSection: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 40,
  },

  avatarContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 30,
    padding: 8,
    backgroundColor: "#1F2937",
    shadowColor: mainColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  avatarGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 92,
  },

  username: {
    fontSize: normalizeFontSize(32),
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
    fontFamily: "Exo2_700Bold",
  },

  joinDate: {
    fontSize: normalizeFontSize(16),
    color: "#9CA3AF",
    fontWeight: "400",
    fontFamily: "Exo2_400Regular",
  },

  // Verification Section Styles
  verificationSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  verificationBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: mainColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  verificationText: {
    flex: 1,
  },

  verificationLabel: {
    fontSize: normalizeFontSize(14),
    color: "#9CA3AF",
    fontWeight: "400",
    fontFamily: "Exo2_400Regular",
  },

  verificationStatus: {
    fontSize: normalizeFontSize(20),
    fontWeight: "600",
    color: "#ffffff",
    fontFamily: "Exo2_700Bold",
  },

  humanAccessText: {
    fontSize: normalizeFontSize(16),
    color: "#9CA3AF",
    textAlign: "left",
    marginBottom: 40,
    paddingLeft: 20,
    fontFamily: "Exo2_400Regular",
  },

  // Actions Section Styles
  actionsSection: {
    paddingBottom: 40,
  },

  actionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#1F2937",
    borderRadius: 12,
  },

  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  actionIcon: {
    marginRight: 16,
  },

  worldcoinIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: mainColor,
    justifyContent: "center",
    alignItems: "center",
  },

  worldcoinText: {
    color: "#ffffff",
    fontSize: normalizeFontSize(20),
    fontWeight: "600",
    fontFamily: "Exo2_700Bold",
  },

  earnIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: mainColor,
    justifyContent: "center",
    alignItems: "center",
  },

  earnIconText: {
    color: "#ffffff",
    fontSize: normalizeFontSize(20),
    fontWeight: "600",
    fontFamily: "Exo2_700Bold",
  },

  actionTextContainer: {
    flex: 1,
  },

  actionTitle: {
    fontSize: normalizeFontSize(18),
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 2,
    fontFamily: "Exo2_700Bold",
  },

  actionSubtitle: {
    fontSize: normalizeFontSize(14),
    color: "#9CA3AF",
    fontFamily: "Exo2_400Regular",
  },

  doneButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: quaternaryColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  doneButtonText: {
    color: "#ffffff",
    fontSize: normalizeFontSize(14),
    fontWeight: "600",
    marginLeft: 4,
    fontFamily: "Exo2_700Bold",
  },
  // Content area (used by Tab3 and others)
  content: {
    flex: 1,
    width: "100%",
  },
  // Glassmorphism card base
  glassCard: {
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    marginVertical: 8,
  },
  // Tab5 — Passes styles
  passesScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  passesMainTitle: {
    fontSize: normalizeFontSize(28),
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
    fontFamily: "Exo2_700Bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: normalizeFontSize(16),
    color: "#666666",
    textAlign: "center",
    fontFamily: "Exo2_400Regular",
  },
  sectionContainer: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  categoryButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  categoryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: mainColor,
  },
  categoryHeader: {
    fontSize: normalizeFontSize(16),
    fontWeight: "600",
    color: "#ffffff",
    fontFamily: "Exo2_700Bold",
  },
  badge: {
    backgroundColor: mainColor + "33",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    minWidth: 28,
    alignItems: "center",
  },
  badgeText: {
    fontSize: normalizeFontSize(12),
    fontWeight: "700",
    color: mainColor,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  passCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  imageWrapper: {
    position: "relative",
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
  },
  passImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  networkBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 2,
  },
  passInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  passName: {
    fontSize: normalizeFontSize(15),
    fontWeight: "600",
    color: "#ffffff",
    fontFamily: "Exo2_700Bold",
  },
  passAction: {
    fontSize: normalizeFontSize(12),
    color: "#9CA3AF",
    fontFamily: "Exo2_400Regular",
  },
});

export default GlobalStyles;
