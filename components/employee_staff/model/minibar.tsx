import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from "react-native";

const minibarData = [
  { id: "1", name: "Nước Lọc", price: 20000 },
  { id: "2", name: "Bia Sài Gòn", price: 25000 },
  { id: "3", name: "CoCaCola", price: 25000 },
  { id: "4", name: "7Up", price: 25000 },
  { id: "5", name: "Mì Ly", price: 25000 },
  { id: "6", name: "Bia Tiger", price: 25000 },
];

export default function MiniBarScreen({ onClose }) {
  const [items, setItems] = useState(
    minibarData.map((item) => ({ ...item, quantity: 0 }))
  );
  const [showSuccess, setShowSuccess] = useState(false); // 👈 state cho modal

  const increase = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrease = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id && item.quantity > 0
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍹 MiniBar</Text>

      {/* Table */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 2 }]}>Tên</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Số lượng</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Giá</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 2 }]}>{item.name}</Text>

            <View
              style={[
                styles.cell,
                {
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <TouchableOpacity
                style={styles.btnQty}
                onPress={() => decrease(item.id)}
              >
                <Text>-</Text>
              </TouchableOpacity>
              <Text style={{ marginHorizontal: 8 }}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.btnQty}
                onPress={() => increase(item.id)}
              >
                <Text>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.cell, { flex: 1 }]}>
              {item.price.toLocaleString()} ₫
            </Text>
          </View>
        )}
      />

      {/* Tổng cộng */}
      <View style={styles.totalBox}>
        <Text style={{ fontWeight: "600" }}>Tổng cộng</Text>
        <Text style={{ fontWeight: "600" }}>{total.toLocaleString()} ₫</Text>
      </View>

      {/* Nút hành động */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "red" }]}
          onPress={onClose}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "green" }]}
          onPress={() => setShowSuccess(true)} // 👈 mở modal đẹp
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Hoàn tất</Text>
        </TouchableOpacity>
      </View>

      {/* Modal thông báo đẹp */}
      <Modal transparent visible={showSuccess} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>✅ Thành công!</Text>
            <Text style={{ textAlign: "center", marginBottom: 16 }}>
              Dịch vụ minibar đã được lưu thành công.
            </Text>
            <TouchableOpacity
              style={styles.okBtn}
              onPress={() => {
                setShowSuccess(false);
                onClose();
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ccc",
    padding: 6,
    borderRadius: 4,
  },
  headerCell: {
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  cell: {
    textAlign: "center",
  },
  btnQty: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 5,
  },
  // Modal
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  popup: {
    width: "75%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "green",
  },
  okBtn: {
    backgroundColor: "green",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
