import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { mainColor } from "../core/styles";

export default function FaceOnboarding({ onStart }) {
    return (
        <View style={styles.container}>
            <View style={styles.iconCircle}>
                <Ionicons name="person-circle-outline" size={64} color={mainColor} />
            </View>
            <Text style={styles.title}>Welcome to EffiSend</Text>
            <Text style={styles.subtitle}>Connect a wallet to view your passes.</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={onStart}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Get started with wallet setup"
            >
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#000000",
    },
    iconCircle: {
        marginBottom: 24,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(66, 134, 245, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#ffffff",
        fontFamily: "Exo2_700Bold",
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
        color: "#9CA3AF",
        textAlign: "center",
        fontFamily: "Exo2_400Regular",
    },
    button: {
        backgroundColor: mainColor,
        borderRadius: 50,
        paddingHorizontal: 32,
        paddingVertical: 14,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Exo2_700Bold",
    },
});
