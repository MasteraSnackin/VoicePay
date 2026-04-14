import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

function SkeletonPulse({ style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        style,
        { opacity },
      ]}
    />
  );
}

export function TokenListSkeleton({ count = 4 }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.tokenRow}>
          <SkeletonPulse style={styles.tokenIcon} />
          <View style={styles.tokenInfo}>
            <SkeletonPulse style={styles.tokenName} />
            <SkeletonPulse style={styles.tokenBalance} />
          </View>
          <SkeletonPulse style={styles.tokenValue} />
        </View>
      ))}
    </View>
  );
}

export function BalanceSkeleton() {
  return (
    <View style={styles.balanceContainer}>
      <SkeletonPulse style={styles.balanceLabel} />
      <SkeletonPulse style={styles.balanceAmount} />
    </View>
  );
}

export function CardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      <SkeletonPulse style={styles.cardHeader} />
      <SkeletonPulse style={styles.cardBody} />
      <SkeletonPulse style={styles.cardFooter} />
    </View>
  );
}

export function PassListSkeleton({ count = 3 }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.passRow}>
          <SkeletonPulse style={styles.passImage} />
          <View style={styles.passInfo}>
            <SkeletonPulse style={styles.passTitle} />
            <SkeletonPulse style={styles.passSubtitle} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 6,
  },
  container: {
    width: "100%",
    gap: 12,
  },
  // Token list
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderRadius: 10,
    padding: 12,
    height: 60,
    gap: 12,
  },
  tokenIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  tokenInfo: {
    flex: 1,
    gap: 6,
  },
  tokenName: {
    width: "60%",
    height: 14,
  },
  tokenBalance: {
    width: "40%",
    height: 10,
  },
  tokenValue: {
    width: 70,
    height: 14,
  },
  // Balance
  balanceContainer: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 20,
  },
  balanceLabel: {
    width: 120,
    height: 18,
  },
  balanceAmount: {
    width: 180,
    height: 38,
    borderRadius: 8,
  },
  // Card
  cardContainer: {
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    gap: 12,
    width: "90%",
  },
  cardHeader: {
    width: "50%",
    height: 16,
  },
  cardBody: {
    width: "70%",
    height: 32,
    borderRadius: 8,
  },
  cardFooter: {
    width: "40%",
    height: 12,
  },
  // Pass list
  passRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  passImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  passInfo: {
    flex: 1,
    gap: 6,
  },
  passTitle: {
    width: "70%",
    height: 14,
  },
  passSubtitle: {
    width: "40%",
    height: 10,
  },
});

export default SkeletonPulse;
