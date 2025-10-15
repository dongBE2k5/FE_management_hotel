
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import CostDetailModal from "./costdetailModal";
import DamageConfirmModal from './dameconfirmmodal';

export default function FeedbackModal({
    visible,
    onClose,
    onCloseAll,
    staffName = "Nguyễn Văn B",
    roomNumber = "123",
}) {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [showCostModal, setShowCostModal] = useState(false);
    const [showDamageModal, setShowDamageModal] = useState(false);

    useEffect(() => {
        if (visible) {
            setLoading(true);
            setResult(null);
            setShowCostModal(false);
            setShowDamageModal(false);

            const delay = Math.floor(Math.random() * 3000) + 3000;
            const timer = setTimeout(() => {
                const randomResult = Math.random() < 0.5 ? "success" : "fail";
                setResult(randomResult);
                setLoading(false);
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    // 🔹 Nếu đang mở modal con → ẩn modal cha
    const shouldShowMainModal =
        visible && !showCostModal && !showDamageModal;

    return (
        <>
            {/* 🔲 Modal chính */}
            <Modal
                visible={shouldShowMainModal}
                transparent
                animationType="fade"
                onRequestClose={onClose}
            >
                {/* Overlay: bấm ra ngoài để đóng */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.overlay}>
                        {/* Phần modal thật sự */}
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View style={styles.modalBox}>
                                {loading ? (
                                    <>
                                        <Text style={styles.header}>Hộp thư phản hồi</Text>
                                        <ActivityIndicator
                                            size="large"
                                            color="#000"
                                            style={{ marginVertical: 16 }}
                                        />
                                        <Text style={styles.waitText}>
                                            Đang chờ phản hồi từ{" "}
                                            <Text style={{ fontWeight: "700" }}>{staffName}</Text>...
                                        </Text>
                                    </>
                                ) : result === "success" ? (
                                    // ✅ Thành công
                                    <TouchableOpacity
                                        style={[styles.resultBox, { borderColor: "green" }]}
                                        activeOpacity={0.7}
                                        onPress={() => setShowCostModal(true)}
                                    >
                                        <View style={styles.row}>

                                            <View style={[styles.row, { alignItems: "flex-start" }]}>
                                                <Ionicons name="checkmark-circle-outline" size={22} color="green" />

                                                <View style={{ marginLeft: 8, flex: 1 }}>
                                                    <Text style={{ flexWrap: "wrap", flexShrink: 1 }}>
                                                        Phản hồi từ <Text style={styles.bold}>{staffName}</Text> về phòng {roomNumber}
                                                    </Text>
                                                    <Text style={[styles.bold, { color: "green", marginTop: 4 }]}>
                                                        Phòng tốt, sẵn sàng check-out
                                                    </Text>
                                                    <Text style={styles.time}>09:50</Text>
                                                </View>
                                            </View>



                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    // ❌ Thất bại
                                    <TouchableOpacity
                                        style={[styles.resultBox, { borderColor: "red" }]}
                                        activeOpacity={0.7}
                                        onPress={() => setShowDamageModal(true)}
                                    >
                                        <View style={styles.row}>
                                            <Ionicons
                                                name="close-circle-outline"
                                                size={22}
                                                color="red"
                                            />
                                            <View style={{ marginLeft: 8, flex: 1 }}>
                                                <Text style={{ flexWrap: "wrap", flexShrink: 1 }}>
                                                    Phản hồi từ <Text style={styles.bold}>{staffName}</Text> về phòng {roomNumber}
                                                </Text>
                                                <Text style={[styles.bold, { color: "red", marginTop: 4 }]}>
                                                    Phòng có vấn đề! Vui lòng xem chi tiết
                                                </Text>
                                                <Text style={styles.time}>09:50</Text>
                                            </View>

                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* 🧾 Modal chi phí */}
            <CostDetailModal
                visible={showCostModal}
                onClose={() => setShowCostModal(false)}
                onBackToConstdetailmodal={() => {
                    // Đóng modal hiện tại (nếu có)
                    setShowDamageModal(false);
                    setShowCostModal(false);

                    // Mở lại CostDetailModal sau 200ms để tránh chồng modal
                    setTimeout(() => {
                        setShowCostModal(true);
                    }, 200);
                }}
            />

            {/* 💥 Modal đền bù */}
            <DamageConfirmModal
                visible={showDamageModal}
                onClose={() => {
                    setShowDamageModal(false);
                    setShowCostModal(false);
                    setResult(null);
                    setLoading(false);
                    onClose(); // 🔹 Đóng FeedbackModal
                }}
                onBackToFeedback={() => {
                    setShowDamageModal(false);
                    setTimeout(() => {
                        setResult(null);
                        setLoading(true);
                        setTimeout(() => {
                            setLoading(false);
                            setResult("fail");
                        }, 1000);
                    }, 200);
                }}
                onBackToConstdetailmodal={() => {
                    // 🔹 Đóng toàn bộ FeedbackModal
                    onClose();
                    onCloseAll?.();
                    // 🔹 Mở lại CostDetailModal sau khi đóng xong FeedbackModal
                    setTimeout(() => {
                        setShowCostModal(true);
                    }, 200);
                }}
            />



        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    header: {
        fontWeight: "700",
        fontSize: 16,
        marginBottom: 10,
    },
    waitText: {
        textAlign: "center",
        color: "#333",
    },
    resultBox: {
        borderWidth: 2,
        borderRadius: 10,
        padding: 12,
        width: "100%",
        backgroundColor: "#fff",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap", // ⚡ Quan trọng
    },
    bold: {
        fontWeight: "600",
    },
    time: {
        color: "#555",
        fontSize: 12,
        marginTop: 4,
    },
});
