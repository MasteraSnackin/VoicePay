import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { Fragment, useCallback, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";
import { CardSkeleton } from "../../../components/skeleton";
import GlobalStyles from "../../../core/styles";
import ContextModule from "../../../providers/contextModule";
import { getLocalDemoTrustScore, isLocalDemoEnvironment, sleep } from "../../../core/utils";

function generateColors(accountId, count = 3) {
  if (!accountId || accountId.trim() === "") {
    return Array(count).fill("#FFFFFF");
  }

  // Extract the last segment from "0.0.X"
  const mainSegment = accountId.split(".").pop();
  const digits = mainSegment
    .replace(/\D/g, "")
    .split("")
    .filter((d) => d !== "0");

  // Take only the first six meaningful digits, padded if needed
  const hexSeed = digits.slice(0, 6).join("").padEnd(6, "0");
  const colors = [];

  for (let i = 0; i < count; i++) {
    const offset = i * 2;
    const rRaw = parseInt(
      hexSeed.slice((offset + 0) % 6, (offset + 2) % 6 || 6),
      16
    );
    const gRaw = parseInt(
      hexSeed.slice((offset + 2) % 6, (offset + 4) % 6 || 6),
      16
    );
    const bRaw = parseInt(
      hexSeed.slice((offset + 4) % 6, (offset + 6) % 6 || 6),
      16
    );

    const r = Math.floor(127 + (rRaw / 255) * 128);
    const g = Math.floor(127 + (gRaw / 255) * 128);
    const b = Math.floor(127 + (bRaw / 255) * 128);

    const color = `#${[r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")}`;
    colors.push(color.toUpperCase());
  }

  return colors;
}

export default function Tab3() {
  const context = React.useContext(ContextModule);
  const [trustScore, setTrustScore] = React.useState(0);
  const [rewardPoints, setRewardPoints] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const getNonceForAccountId = useCallback(async () => {
    if (isLocalDemoEnvironment()) {
      return getLocalDemoTrustScore(context.value.accountId);
    }

    try {
      // Request up to 100 transactions to get an accurate activity count
      // (default page size is 25, which undercounts active users)
      const response = await fetch(
        `https://mainnet.mirrornode.hedera.com/api/v1/transactions?account.id=${context.value.accountId}&limit=100&order=desc`
      );
      const result = await response.json();
      return result.transactions?.length ?? 0;
    } catch {
      return 0;
    }
  }, [context.value.accountId]);

  const getRewards = useCallback(async () => {
    try {
      const response = await fetch(`/api/getRewards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: context.value.accountId }),
      });
      return await response.json();
    } catch {
      return 0;
    }
  }, [context.value.accountId]);

  const claimRewards = useCallback(async () => {
    try {
      const response = await fetch(`/api/claimRewards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: context.value.accountId }),
      });
      return await response.json();
    } catch {
      return 0;
    }
  }, [context.value.accountId]);

  const getAllocatedRewards = useCallback(async () => {
    const response = await getRewards();
    const claimCounter = await getNonceForAccountId();
    if (claimCounter > 100) {
      setTrustScore(100);
    } else {
      setTrustScore(claimCounter);
    }
    setRewardPoints(response?.result?.rewards ?? 0);
  }, [setRewardPoints, setTrustScore, getRewards, getNonceForAccountId]);

  const onMountCheck = useCallback(async () => {
    const update = async () => {
      if (context.value.accountId !== "") {
        // Initialize rewards data
        setLoading(true);
        await getAllocatedRewards();
        setLoading(false);
      }
    };
    context.value.starter && update();
  }, [context.value.accountId, context.value.starter, getAllocatedRewards]);

  useEffect(() => {
    onMountCheck();
  }, [onMountCheck]);

  const handleRewardPoints = async () => {
    setLoading(true);
    try {
      const result = await claimRewards();
      if (result === 0) {
        Toast.error("Failed to claim rewards. Please try again.");
      } else {
        Toast.success("Rewards claimed successfully!");
      }
      await sleep(3000);
      await getAllocatedRewards();
    } catch {
      Toast.error("Network error while claiming rewards.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Fragment>
      <View style={GlobalStyles.main}>
        <ScrollView
          style={GlobalStyles.content}
          contentContainerStyle={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={GlobalStyles.profileSection}>
            <View style={GlobalStyles.avatarContainer}>
              <LinearGradient
                colors={generateColors(context.value.accountId)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={GlobalStyles.avatarGradient}
              />
            </View>
            <Text style={GlobalStyles.username}>
              {context.value.accountId !== ""
                ? `@EffiUser_${context.value.accountId.split(".").pop()}`
                : "Not Connected"}
            </Text>
            <Text style={GlobalStyles.joinDate}>
              {context.value.accountId !== ""
                ? `Joined, ${new Date().getDate()} ${new Date().toLocaleString(
                    "default",
                    {
                      month: "long",
                    }
                  )} ${new Date().getFullYear()}`
                : "Not Joined"}
            </Text>
          </View>
          <View style={GlobalStyles.verificationSection}>
            <View style={GlobalStyles.verificationBadge}>
              <Ionicons name="checkmark" size={20} color="#ffffff" />
            </View>
            <View style={GlobalStyles.verificationText}>
              <Text style={GlobalStyles.verificationLabel}>Identity</Text>
              <Text style={GlobalStyles.verificationStatus}>
                {context.value.accountId !== "" ? "Verified" : "Unverified"}
              </Text>
            </View>
          </View>
          {loading && trustScore === 0 && rewardPoints === 0 ? (
            <Fragment>
              <CardSkeleton />
              <CardSkeleton />
            </Fragment>
          ) : (
          <Fragment>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Ionicons name="star" size={24} color="#ffaa00" />
              <Text style={styles.scoreTitle}>Trust Score</Text>
            </View>
            <Text style={styles.scoreValue}>{trustScore}/100</Text>
            <View style={styles.scoreBar}>
              <View
                style={[styles.scoreProgress, { width: `${trustScore}%` }]}
              />
            </View>
          </View>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Ionicons name="gift" size={24} color="#8B5CF6" />
              <Text style={styles.scoreTitle}>Pending Reward Points</Text>
            </View>
            <Text style={styles.rewardsValue}>{rewardPoints}</Text>
            <TouchableOpacity
              style={[
                styles.claimButton,
                { opacity: rewardPoints > 0 && !loading ? 1 : 0.5 },
              ]}
              onPress={() =>
                Alert.alert(
                  "Claim Rewards",
                  `Claim ${rewardPoints} reward points for SAUCE tokens?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Claim", onPress: handleRewardPoints },
                  ]
                )
              }
              disabled={rewardPoints <= 0 || loading}
              accessibilityRole="button"
              accessibilityLabel={`Claim ${rewardPoints} reward points`}
              accessibilityState={{ disabled: rewardPoints <= 0 || loading }}
            >
              <Text style={styles.claimButtonText}>
                {loading ? "Claiming..." : "Claim Rewards for Verification"}
              </Text>
            </TouchableOpacity>
          </View>
          </Fragment>
          )}
          <View style={{ width: "90%", marginTop: 30 }}>
            <Text style={[styles.sectionTitle, { alignItems: "flex-start" }]}>
              Verification Benefits
            </Text>
          </View>

          <View style={[styles.scoreCard, { marginTop: 0 }]}>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="trending-up" size={20} color="#10B981" />
                <Text style={styles.benefitText}>
                  Lower transaction fees for verified users
                </Text>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="gift" size={20} color="#8B5CF6" />
                <Text style={styles.benefitText}>
                  Earn SAUCE rewards for maintaining verification
                </Text>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="shield" size={20} color="#3B82F6" />
                <Text style={styles.benefitText}>
                  Access to premium FacePay features
                </Text>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={styles.benefitText}>
                  Higher trust score in the network
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statusCard: {
    backgroundColor: "#000000",
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  statusLevel: {
    fontSize: 14,
    fontWeight: "600",
  },
  scoreCard: {
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    width: "90%",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffaa00",
    marginBottom: 12,
  },
  scoreBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreProgress: {
    height: "100%",
    backgroundColor: "#ffaa00",
    borderRadius: 4,
  },
  rewardsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  rewardsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  rewardsValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#8B5CF6",
    marginBottom: 12,
  },
  claimButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "flex-start",
  },
  claimButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionsSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  actionCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  actionText: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  benefitsSection: {
    marginBottom: 32,
    width: "90%",
  },
  benefitsList: {
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  benefitText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
