import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- Helper Functions ---
const formatCurrency = (value) => {
    if (typeof value !== 'number') return "0 ₫";
    return `${value.toLocaleString("vi-VN")} ₫`;
};

const formatStatus = (status) => {
    if (status === 'success') return { text: 'Thành công', color: 'green' };
    if (status === 'pending') return { text: 'Đang chờ', color: 'orange' };
    if (status === 'failed') return { text: 'Thất bại', color: 'red' };
    return { text: status, color: 'gray' };
};

const formatMethod = (method) => {
    if (method === 'VNPAY'||'vnpay') return { text: 'VNPay', icon: 'card-outline' };
    if (method === 'MANUAL') return { text: 'Thủ công', icon: 'cash-outline' };
    return { text: method, icon: 'help-circle-outline' };
};
// ------------------------

export default function PaymentHistoryModal({ visible, onClose, payments = [] }) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <Text style={styles.title}>Lịch sử thanh toán</Text>
                            <ScrollView style={styles.listContainer}>
                                {payments.length === 0 ? (
                                    <Text style={styles.emptyText}>Chưa có lịch sử thanh toán.</Text>
                                ) : (
                                    payments.map((payment) => {
                                        const statusStyle = formatStatus(payment.status);
                                        const methodStyle = formatMethod(payment.method);
                                        return (
                                            <View key={payment.id} style={styles.paymentItem}>
                                                <View style={styles.paymentRow}>
                                                    <View style={styles.methodContainer}>
                                                        <Ionicons name={methodStyle.icon} size={20} color="#007BFF" />
                                                        <Text style={styles.paymentMethod}>{methodStyle.text}</Text>
                                                    </View>
                                                    <Text style={styles.paymentTotal}>{formatCurrency(payment.total)}</Text>
                                                </View>
                                                <View style={styles.paymentRow}>
                                                    <Text style={styles.paymentId}>Mã GD: {payment.id}</Text>
                                                    <Text style={[styles.paymentStatus, { color: statusStyle.color }]}>
                                                        {statusStyle.text}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    })
                                )}
                            </ScrollView>
                            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                                <Text style={styles.closeText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

// Mượn style từ CostDetailModal để đồng bộ
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        width: "90%",
        maxHeight: "70%",
    },
    title: {
        fontWeight: "700",
        fontSize: 18,
        textAlign: "center",
        marginBottom: 16,
    },
    listContainer: {
        width: '100%',
        marginBottom: 10,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginVertical: 30,
        fontSize: 16,
    },
    paymentItem: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee'
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    methodContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentMethod: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    paymentTotal: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#28a745', // Màu xanh lá
    },
    paymentId: {
        color: '#666',
        fontSize: 12,
    },
    paymentStatus: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    closeBtn: {
        backgroundColor: "#6c757d", 
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 12,
    },
    closeText: {
        textAlign: "center",
        color: "#fff",
        fontWeight: "600",
    },
});