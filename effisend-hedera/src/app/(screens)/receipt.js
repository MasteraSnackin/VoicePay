import { Image } from "expo-image";
import { useGlobalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { logo } from "../../assets/images/logo";
import {
    deleteLeadingZeros,
    formatInputText,
    normalizeFontSize,
} from "../../core/utils";
import { blockchain } from "../../core/constants";
import { colors } from "../../core/styles";

export default function Receipt() {
  const glob = useGlobalSearchParams();
  const hasData = glob.hash && glob.amount && glob.name;

  if (!hasData) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No receipt data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={logo} style={styles.logo} />
        <View style={styles.separator} />
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
        <Text style={styles.label}>Type</Text>
        <Text style={styles.value}>
          {String(glob.kindPayment) === "0" ? "QR Code" : "FaceID"}
        </Text>
        <View style={styles.separator} />
        <Text style={styles.sectionTitle}>Transaction</Text>
        <Text style={styles.amount}>
          {deleteLeadingZeros(formatInputText(glob.amount))} {glob.name}
        </Text>
        <View style={styles.separator} />
        <QRCode
          size={180}
          value={`${blockchain.blockExplorer}transaction/${glob.hash}`}
          ecl="L"
          backgroundColor="transparent"
          color="#ffffff"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 380,
  },
  logo: {
    width: "30%",
    resizeMode: "contain",
    aspectRatio: 1,
    marginBottom: 16,
  },
  separator: {
    width: "80%",
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 14,
  },
  label: {
    fontSize: normalizeFontSize(13),
    color: colors.textSecondary,
    fontFamily: "Exo2_400Regular",
    marginBottom: 2,
  },
  value: {
    fontSize: normalizeFontSize(18),
    fontWeight: "600",
    color: colors.textPrimary,
    fontFamily: "Exo2_700Bold",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: normalizeFontSize(20),
    fontWeight: "700",
    color: colors.textPrimary,
    fontFamily: "Exo2_700Bold",
    marginBottom: 8,
  },
  amount: {
    fontSize: normalizeFontSize(26),
    fontWeight: "bold",
    color: colors.primary,
    fontFamily: "Exo2_700Bold",
    marginBottom: 4,
  },
  emptyText: {
    fontSize: normalizeFontSize(16),
    color: colors.textSecondary,
    fontFamily: "Exo2_400Regular",
    textAlign: "center",
  },
});
