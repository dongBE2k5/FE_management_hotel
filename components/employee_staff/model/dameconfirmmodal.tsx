import React from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DamageConfirmModal({ visible, onClose, onBackToFeedback, onBackToConstdetailmodal }) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* Bấm vào vùng overlay sẽ đóng modal */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    {/* View bên trong không nhận sự kiện chạm overlay */}
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            {/* Tiêu đề */}
                            <Text style={styles.title}>Xác nhận chi phí đền bù</Text>

                            {/* Thông báo chính */}
                            <View style={styles.warningBox}>
                                <Ionicons name="warning-outline" size={22} color="red" />
                                <Text style={styles.warningText}>
                                    Nhân viên đã báo cáo{" "}
                                    <Text style={styles.bold}>3 mục hư hỏng/thiếu</Text> với tổng chi phí là{" "}
                                    <Text style={styles.boldRed}>250.000 ₫</Text>.
                                </Text>
                            </View>

                            {/* Danh sách chi tiết */}
                            <View style={styles.item}>
                                <Text style={styles.itemName}>Vỡ ly thuỷ tinh</Text>
                                <Text style={styles.itemPrice}>100.000 ₫</Text>
                            </View>
                            <Text style={styles.subText}>50.000 ₫ × 2</Text>
                            <View style={styles.divider} />
                            <View style={styles.item}>
                                <Text style={styles.itemName}>Thiếu khăn tắm</Text>
                                <Text style={styles.itemPrice}>150.000 ₫</Text>
                            </View>
                            <Text style={styles.subText}>150.000 ₫ × 1</Text>

                            {/* Nút hành động */}
                            <View style={styles.btnRow}>
                                <TouchableOpacity
                                    style={[styles.btn, { backgroundColor: "#2ecc71" }]}
                                    onPress={onBackToFeedback} // ✅ Gọi callback để quay lại FeedbackModal
                                >
                                    <Text style={styles.btnText}>Yêu cầu kiểm tra lại</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.btn, { backgroundColor: "#007BFF" }]}
                                    onPress={() => {
                                        // ✅ Đầu tiên đóng DamageConfirmModal
                                        onClose?.();

                                        // ✅ Sau đó gọi callback cha để:
                                        // - Đóng luôn FeedbackModal
                                        // - Mở lại CostDetailModal (nếu cần)
                                        setTimeout(() => {
                                            onBackToConstdetailmodal?.();
                                        }, 300);
                                    }}
                                >
                                    <Text style={styles.btnText}>Xác nhận & Thêm vào hóa đơn</Text>
                                </TouchableOpacity>


                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 18,
    },
    title: {
        fontWeight: "700",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 10,
    },
    warningBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff5f5",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    warningText: {
        flex: 1,
        marginLeft: 8,
        color: "#333",
    },
    bold: {
        fontWeight: "600",
    },
    boldRed: {
        fontWeight: "700",
        color: "red",
    },
    item: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    itemName: {
        fontWeight: "600",
        color: "#333",
    },
    itemPrice: {
        fontWeight: "600",
        color: "#000",
    },
    subText: {
        color: "#666",
        fontSize: 12,
        marginBottom: 6,
    },
    divider: {
        height: 1,
        backgroundColor: "#eee",
        marginVertical: 6,
    },
    btnRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    btn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    btnText: {
        textAlign: "center",
        color: "#fff",
        fontWeight: "600",
        fontSize: 13,
    },
});
