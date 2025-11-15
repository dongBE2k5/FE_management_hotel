import { getRoomItemsByResquset } from "@/service/RoomItemAPI";
import { getBookingUtilityByBookingId } from "@/service/BookingUtilityAPI"; 
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
import DamageConfirmModal from './dameconfirmmodal';

export default function FeedbackModal({
    visible,
    onClose,
    onCloseAll,
    staffName = "Nguyễn Văn B",
    roomNumber = "P.???", 
    activeRequest,
    onReportReceived, 
    bookingId,
    isPaid // 👈 Nhận bookingId
}) {
    const [isLoadingItems, setIsLoadingItems] = useState(false); 
    const [damagedItems, setDamagedItems] = useState([]); 
    const [usedServices, setUsedServices] = useState([]); // 👈 SỬA: Khởi tạo là mảng rỗng

    const [showDamageModal, setShowDamageModal] = useState(false);

    useEffect(() => {
        const handleRequestResponse = async () => {
            if (activeRequest) {
                if (activeRequest.status === "HAS_ISSUE" || activeRequest.status === "NO_ISSUE") {
                    setIsLoadingItems(true); 
                    setDamagedItems([]);
                    setUsedServices([]); // 👈 SỬA: Reset về mảng rỗng

                    try {
                        const promises = [
                            getBookingUtilityByBookingId(bookingId) 
                        ];
                        if (activeRequest.status === "HAS_ISSUE") {
                            promises.push(getRoomItemsByResquset(activeRequest.id));
                        }

                        const results = await Promise.all(promises);
                        console.log("results",results);
                        
                        const servicesData = results[0];
                        // 👈 SỬA ĐỔI QUAN TRỌNG: Trích xuất mảng tại đây
                        const servicesArray = servicesData?.utilityItemBookingResponse || [];
                        setUsedServices(servicesArray); // Set state là cái mảng

                        if (activeRequest.status === "HAS_ISSUE") {
                            const itemsData = results[1];
                            setDamagedItems(itemsData || []);
                        }

                    } catch (error) {
                        console.error("Lỗi khi tải vật dụng hoặc dịch vụ:", error);
                        setDamagedItems([]); 
                        setUsedServices([]); // 👈 SỬA
                    } finally {
                        setIsLoadingItems(false); 
                    }
                } else {
                    setIsLoadingItems(false);
                    setDamagedItems([]);
                    setUsedServices([]); // 👈 SỬA
                }
            }
        };

        if (visible) {
            handleRequestResponse();
        }
    }, [visible, activeRequest, bookingId]); 

    const shouldShowMainModal = visible && !showDamageModal;

    // HÀM RENDER NỘI DUNG CHÍNH CỦA MODAL
    const renderModalContent = () => {
        // 1. CHƯA CÓ PHẢN HỒI
        if (!activeRequest) {
            return (
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
            );
        }

        // 2. ĐÃ NHẬN YÊU CẦU
        if (activeRequest.status === "RECEIVED") {
            return (
                <>
                    <Text style={styles.header}>Đã nhận thông tin</Text>
                    <Ionicons name="person-outline" size={40} color="#0062E0" style={{ marginVertical: 16 }} />
                    <Text style={styles.waitText}>
                        <Text style={styles.bold}>{staffName}</Text> đã nhận được yêu cầu
                        và đang tiến hành kiểm tra phòng <Text style={styles.bold}>{roomNumber}</Text>...
                    </Text>
                </>
            );
        }

        // 3. PHẢN HỒI: NO_ISSUE (Thành công)
        if (activeRequest.status === "NO_ISSUE") {
            // 3.1 Đang tải (dịch vụ)
            if (isLoadingItems) {
                return (
                    <>
                        <Text style={styles.header}>Phòng Tốt</Text>
                        <ActivityIndicator
                            size="large"
                            color="green"
                            style={{ marginVertical: 16 }}
                        />
                        <Text style={styles.waitText}>Đang tải chi tiết dịch vụ (nếu có)...</Text>
                    </>
                );
            }

            // 3.2 Đã tải xong
            // 👈 SỬA: 'usedServices' giờ là mảng
            const hasServices = usedServices && usedServices.length > 0;

            return (
                <TouchableOpacity
                    style={[styles.resultBox, { borderColor: "green" }]}
                    activeOpacity={0.7}
                    onPress={() => {
                        // Mở DamageConfirmModal ngay cả khi OK
                        // để xác nhận minibar (nếu có)
                        setShowDamageModal(true); 
                    }}
                >
                    <View style={[styles.row, { alignItems: "flex-start" }]}>
                        <Ionicons name="checkmark-circle-outline" size={22} color="green" />
                        <View style={{ marginLeft: 8, flex: 1 }}>
                            <Text style={{ flexWrap: "wrap", flexShrink: 1 }}>
                                Phản hồi từ <Text style={styles.bold}>{staffName}</Text> về phòng <Text style={styles.bold}>{roomNumber}</Text>
                            </Text>
                            <Text style={[styles.bold, { color: "green", marginTop: 4 }]}>
                                Phòng tốt.
                            </Text>
                            {/* 👈 SỬA: 'usedServices' là mảng */}
                            {hasServices && (
                                <Text style={[styles.bold, { color: "#E6A23C", marginTop: 4 }]}>
                                    (Có {usedServices.length} dịch vụ đã dùng)
                                </Text>
                            )}
                            <Text style={styles.time}>{new Date(activeRequest.reportedAt).toLocaleTimeString()}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        // 4. PHẢN HỒI: HAS_ISSUE (Có vấn đề)
        if (activeRequest.status === "HAS_ISSUE") {
            // 4.1. Đang tải chi tiết (hỏng hóc + dịch vụ)
            if (isLoadingItems) {
                return (
                    <>
                        <Text style={styles.header}>Phát hiện vấn đề</Text>
                        <ActivityIndicator
                            size="large"
                            color="#cc0000"
                            style={{ marginVertical: 16 }}
                        />
                        <Text style={styles.waitText}>
                            Đang tải chi tiết hư hỏng và dịch vụ...
                        </Text>
                    </>
                );
            }
            
            // 4.2. Đã tải xong
            // 👈 SỬA: 'usedServices' giờ là mảng
            const hasServices = usedServices && usedServices.length > 0;

            return (
                <TouchableOpacity
                    style={[styles.resultBox, { borderColor: "red" }]}
                    activeOpacity={0.7}
                    onPress={() => setShowDamageModal(true)} // Mở modal xác nhận hỏng
                >
                    <View style={[styles.row, { alignItems: "flex-start" }]}>
                        <Ionicons name="close-circle-outline" size={22} color="red" />
                        <View style={{ marginLeft: 8, flex: 1 }}>
                            <Text style={{ flexWrap: "wrap", flexShrink: 1 }}>
                                Phản hồi từ <Text style={styles.bold}>{staffName}</Text> về phòng <Text style={styles.bold}>{roomNumber}</Text>
                            </Text>
                            <Text style={[styles.bold, { color: "red", marginTop: 4 }]}>
                                Phòng có vấn đề!
                            </Text>
                            {/* 👈 SỬA: 'usedServices' là mảng */}
                            {hasServices && (
                                <Text style={[styles.bold, { color: "#E6A23C", marginTop: 4 }]}>
                                    (Và {usedServices.length} dịch vụ đã dùng)
                                </Text>
                            )}
                            <Text style={styles.time}>{new Date(activeRequest.reportedAt).toLocaleTimeString()}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        return <Text>Trạng thái không xác định: {activeRequest.status}</Text>;
    };

    return (
        <>
            <Modal
                visible={shouldShowMainModal}
                transparent
                animationType="fade"
                onRequestClose={onClose}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalBox}>
                                {renderModalContent()}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* 💥 Modal đền bù (Giờ là modal xác nhận tổng) */}
            <DamageConfirmModal
                visible={showDamageModal}
                damagedItems={damagedItems} 
                usedServices={usedServices} // 👈 'usedServices' giờ là mảng
                
                onClose={() => {
                    setShowDamageModal(false);
                }}

                onBackToFeedback={() => {
                    setShowDamageModal(false); 
                    onClose(); 
                }}

                // 👈 SỬA: onBackToConstdetailmodal
                onBackToConstdetailmodal={(itemsFromDamageModal,isPaid) => {
                    // 'usedServices' (từ state) giờ là mảng
                    onReportReceived(itemsFromDamageModal, usedServices); 
                    isPaid
                    setShowDamageModal(false);
                    onClose(); 
                    onCloseAll?.(); 
                }}
            />
        </>
    );
}

// (Styles giữ nguyên)
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
        alignItems: "flex-start", 
        flexWrap: "wrap", 
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