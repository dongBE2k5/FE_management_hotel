import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";

export default function SuccessModal({ visible, message, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.icon}>✅</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.btnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  box: {
    width: "75%",
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    padding: 20,
  },
  icon: {
    fontSize: 42,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#2c8b3f",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
