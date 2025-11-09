import { openURL } from "expo-linking";
import React from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import PaymentAPI from "../../../service/Payment/PaymentAPI";

const formatCurrency = (value) => {
    if (typeof value !== "number") return "—";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
};

// Nhận thêm prop 'onManualPayment'
export default function CostDetailModal({ visible, onClose, costData, onManualPayment }) {
    console.log("tiền", costData);

    if (!costData || Object.keys(costData).length === 0) {
        // (Modal "Không có thông tin" giữ nguyên)
        return (
            <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.title}>Không có thông tin</Text>
                        <Text style={{ textAlign: "center", marginVertical: 10 }}>
                            Không thể tính toán chi phí. Vui lòng kiểm tra lại thông tin đặt phòng hoặc yêu cầu check-in.
                        </Text>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <Text style={styles.closeText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    // (Phần tính toán giữ nguyên)
    const roomPrice = costData?.roomDetails?.price ?? 0;
    const servicesTotal =
        costData?.services?.reduce((sum, s) => sum + ((s.price ?? 0) * (s.quantity ?? 1)), 0) ?? 0;
    const damagedItemsTotal =
        costData?.damagedItems?.reduce((sum, item) => sum + ((item.price ?? 0) * (item.quantity ?? 1)), 0) ?? 0;
    
    const totalAmount = roomPrice + servicesTotal + damagedItemsTotal;

    // (Logic xác định số tiền thanh toán giữ nguyên)
    const isPaid = costData?.isPaid ?? false;
    const hasDamages = damagedItemsTotal > 0;
    const amountToPay = !isPaid ? totalAmount : (hasDamages ? damagedItemsTotal : 0);
    const showPaymentButtons = !isPaid ;


    // (Hàm handlePayment (Online))
    const handlePayment = async () => {
        try {
            if (!costData?.bookingId || amountToPay <= 0) {
                Alert.alert("Lỗi", "Không đủ thông tin hoặc tổng tiền không hợp lệ.");
                return;
            }
            const paymentUrl = await PaymentAPI.createPayment(
                amountToPay, 
                "vnpay",
                costData.bookingId
            );
            if (paymentUrl) {
                await openURL(paymentUrl.toString());
                onClose(); // <-- SỬA ĐỔI: Đóng modal sau khi mở link
            } else {
                Alert.alert("Lỗi", "Không thể tạo liên kết thanh toán.");
            }
        } catch (error) {
            console.error("Lỗi khi thanh toán:", error);
            Alert.alert("Lỗi", "Đã xảy ra sự cố khi thanh toán.");
        }
    };

    // ✨ HÀM MỚI: Xử lý thanh toán thủ công
    const handleManualPayment = async () => {
        try {
            if (!costData?.bookingId || amountToPay <= 0) {
                Alert.alert("Lỗi", "Không đủ thông tin hoặc tổng tiền không hợp lệ.");
                return;
            }

            // 1. Gọi API thanh toán thủ công
            const manualPaymentResult = await PaymentAPI.createPaymentMumanual(
                amountToPay,
                "MANUAL", // Hoặc "CASH" - Tùy thuộc vào API của bạn
                costData.bookingId
            );

            if (manualPaymentResult) {
                // 2. Nếu API thành công, GỌI HÀM XÁC NHẬN CHECKOUT (từ prop)
                if (onManualPayment) {
                    onManualPayment(); 
                } else {
                    Alert.alert("Thành công", "Đã ghi nhận thanh toán thủ công.");
                }
                onClose(); // <-- SỬA ĐỔI: Đóng modal sau khi thanh toán thành công
            } else {
                Alert.alert("Lỗi", "Không thể tạo thanh toán thủ công.");
            }
        } catch (error) {
            console.error("Lỗi khi thanh toán thủ công:", error);
            Alert.alert("Lỗi", "Đã xảy ra sự cố khi thanh toán thủ công.");
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Chi tiết dịch vụ & chi phí</Text>

                    {/* (Phần ScrollView Tiền phòng, Dịch vụ, Đền bù giữ nguyên) */}
                    <ScrollView style={{ maxHeight: 400 }}>
                        {/* Tiền phòng */}
                        {costData.roomDetails && (
                            <>
                                <Text style={styles.sectionTitle}>Tiền phòng</Text>
                                <View style={styles.rowBetween}>
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.bold}>{costData.roomDetails.name}</Text>
                                        {costData.roomDetails.description ? (
                                            <Text style={styles.subText}>{costData.roomDetails.description}</Text>
                                        ) : null}
                                    </View>
                                    <Text style={styles.price}>{formatCurrency(roomPrice)}</Text>
                                </View>
                            </>
                        )}

                        {/* Dịch vụ */}
                        {Array.isArray(costData.services) && costData.services.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Dịch vụ đã dùng</Text>
                                {costData.services.map((service, i) => (
                                    <View style={styles.rowBetween} key={`service-${i}`}>
                                        <View style={styles.itemDetails}>
                                            <View style={styles.itemNameRow}>
                                                <Text style={styles.bold}>{service.name}</Text>
                                                {(service.quantity ?? 0) > 0 && (
                                                    <Text style={styles.quantityText}> (x{service.quantity})</Text>
                                                )}
                                            </View>
                                            {service.description ? (
                                                <Text style={styles.subText}>{service.description}</Text>
                                            ) : null}
                                        </View>
                                        <Text style={styles.price}>{formatCurrency((service.price ?? 0) * (service.quantity ?? 1))}</Text>
                                    </View>
                                ))}
                            </>
                        )}
                        
                        {/* Vật dụng đền bù */}
                        {Array.isArray(costData.damagedItems) && costData.damagedItems.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Vật dụng đền bù</Text>
                                {costData.damagedItems.map((item, i) => (
                                    <View style={styles.rowBetween} key={`damage-${i}`}>
                                        <View style={styles.itemDetails}>
                                            <View style={styles.itemNameRow}>
                                                <Text style={styles.bold}>{item.name}</Text>
                                                {(item.quantity ?? 0) > 0 && (
                                                    <Text style={styles.quantityText}> (x{item.quantity})</Text>
                                                )}
                                            </View>
                                            {item.description ? (
                                                <Text style={styles.subText}>{item.description}</Text>
                                            ) : null}
                                        </View>
                                        <Text style={[styles.price, { color: "red" }]}>
                                            {formatCurrency((item.price ?? 0) * (item.quantity ?? 1))}
                                        </Text>
                                    </View>
                                ))}
                            </>
                        )}
                    </ScrollView>

                    <View style={styles.divider} />

                    {/* (Tổng cộng giữ nguyên) */}
                    <View style={styles.rowBetween}>
                        <Text style={styles.totalLabel}>Tổng cộng</Text>
                        <Text style={styles.totalPrice}>{formatCurrency(totalAmount)}</Text>
                    </View>

                    {/* Nút Đóng (luôn hiển thị) */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeText}>Đóng</Text>
                    </TouchableOpacity>

                    {/* Khối thanh toán */}
                    {showPaymentButtons && (
                        <>
                            {/* Nút 1: Thanh toán Online */}
                            <TouchableOpacity 
                                style={[styles.paymentBtn, { backgroundColor: "#28a745" }]} 
                                onPress={handlePayment}
                            >
                                <Text style={styles.closeText}>
                                    Thanh toán Online {formatCurrency(amountToPay)}
                                </Text>
                            </TouchableOpacity>

                            {/* ✨ SỬA: Nút 2: Thanh toán Thủ công */}
                            <TouchableOpacity 
                                style={[styles.paymentBtn, { backgroundColor: "#007BFF" }]} 
                                onPress={handleManualPayment} // 👈 SỬA: Gọi hàm handler mới
                            >
                                <Text style={styles.closeText}>Xác nhận (Thanh toán thủ công)</Text>
                            </TouchableOpacity>
                        </>
                    )}

                </View>
            </View>
        </Modal>
    );
}

// (Styles giữ nguyên)
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
    },
    title: {
        fontWeight: "700",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontWeight: "600",
        marginTop: 10,
        marginBottom: 4,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    itemNameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    itemDetails: {
        flex: 1, 
    },
    bold: {
        fontWeight: "600",
    },
    quantityText: {
        fontWeight: "600",
        color: "#555",
        fontSize: 14, 
    },
    subText: {
        color: "#666",
        fontSize: 12,
        flexShrink: 1, 
    },
    price: {
        color: "green",
        fontWeight: "600",
        marginLeft: 8, 
    },
    divider: {
        height: 1,
        backgroundColor: "#ddd",
        marginVertical: 10,
    },
    totalLabel: {
        fontWeight: "700",
    },
    totalPrice: {
        fontWeight: "700",
        color: "green",
        fontSize: 16,
    },
    closeBtn: {
        backgroundColor: "#6c757d", 
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 12,
    },
    paymentBtn: {
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