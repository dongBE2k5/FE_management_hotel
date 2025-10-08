import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";



export default function IndexScreen() {
  const [showStaffList, setShowStaffList] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demo Staff List & ListRoom</Text>

      <TouchableOpacity style={styles.button} onPress={() => setShowStaffList(true)}>
        <Text style={styles.buttonText}>Mở danh sách nhân viên</Text>
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
    backgroundColor: "#f7f7f7",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
  },
  button: {
    backgroundColor: "#FF5722",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
