// Placeholder PassModal component
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

/**
 * Minimal modal showing basic pass info.
 * Props:
 *   visible – boolean controlling visibility
 *   pass – object with pass data (may be undefined)
 *   address – user's address for the pass chain
 *   onClose – callback to close the modal
 */
export default function PassModal({ visible, pass, address, onClose }) {
    if (!visible) return null;
    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Pass Details</Text>
                    {pass ? (
                        <View style={styles.content}>
                            {pass.image && <Image source={{ uri: pass.image }} style={styles.image} />}
                            <Text style={styles.name}>{pass.name || "Unnamed Pass"}</Text>
                            <Text style={styles.info}>Token ID: {pass.tokenId}</Text>
                            <Text style={styles.info}>Contract: {pass.contract}</Text>
                            <Text style={styles.info}>Owner: {address}</Text>
                        </View>
                    ) : (
                        <Text>No pass selected.</Text>
                    )}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
    },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
    content: { alignItems: "center" },
    image: { width: 120, height: 120, marginBottom: 12 },
    name: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
    info: { fontSize: 14, marginBottom: 4 },
    closeBtn: { marginTop: 16, alignSelf: "flex-end" },
    closeText: { color: "#0066ff", fontSize: 16 },
});
