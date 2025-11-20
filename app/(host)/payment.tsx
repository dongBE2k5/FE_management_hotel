import { useHost } from "@/context/HostContext";
import HotelPaymentTypeResponse from "@/models/Payment/HotelPaymentTypeResponse";
import TypeOfRoomResponse from "@/models/TypeOfRoom/TypeOfRoomResponse";
import {
    createHotelPaymentType,
    deleteHotelPaymentType,
    getHotelPaymentTypesByHotelId,
    updateHotelPaymentType
} from "@/service/Payment/HotelPaymentTypeAPI";
import { getTypeOfRoomByHotel } from "@/service/TypeOfRoomService";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface PaymentType {
    id: number;
    name: string;
}

interface RoomType {
    id: number;
    name: string;
}

const paymentTypesData: PaymentType[] = [
    { id: 2, name: "DEPOSIT" },
];

const roomTypesData: RoomType[] = [
    { id: 1, name: "Phòng đơn" },
    { id: 2, name: "Phòng đôi" },
    { id: 3, name: "Phòng gia đình" },
];

export default function HotelPaymentTypeScreen() {
    const [paymentTypes] = useState(paymentTypesData);
    const [hotelPaymentTypes, setHotelPaymentTypes] = useState<HotelPaymentTypeResponse[]>([]);
    const [roomTypes, setRoomTypes] = useState<TypeOfRoomResponse[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<PaymentType | null>(null);
    const [depositPercent, setDepositPercent] = useState<number | undefined>(undefined);
    const [selectedRoomTypes, setSelectedRoomTypes] = useState<number[]>([]);
    const [editingId, setEditingId] = useState<boolean>(false);

    const { hotelId } = useHost();
    
    useFocusEffect(
        useCallback(() => {
            if (!hotelId) {
                Alert.alert("⚠ Lỗi", "Vui lòng chọn khách sạn");
                return router.push("/(host)");}
            resetForm();
            loadData();
        }, [hotelId])
    );
    

    const loadData = async () => {
        
        const res = await getHotelPaymentTypesByHotelId(hotelId!);
        console.log("DATA", res.data);

        setHotelPaymentTypes(res.data);
        const typeOfRoom = await getTypeOfRoomByHotel(hotelId!);
        console.log("TYPE OF ROOM", typeOfRoom.data);
        setRoomTypes(typeOfRoom.data);
    };

    const resetForm = () => {
        setSelectedPayment(null);
        setDepositPercent(undefined);
        setSelectedRoomTypes([]);
        setEditingId(false);
    };

    const configRoomTypes = {
        "DON": "Phòng Đơn",
        "DOI": "Phòng Đôi",
        "GIA_DINH": "Phòng Gia Đình",
    }

    const handleSubmit = async () => {
        console.log("ADD");

        if (!hotelId || !selectedPayment) {
            Alert.alert("⚠ Lỗi", "Vui lòng chọn phương thức thanh toán");
            return;
        }

        try {
            if (depositPercent !== undefined && (depositPercent <= 0 || depositPercent > 100)) {
                Alert.alert("⚠ Lỗi", "Vui lòng nhập % cọc hợp lệ từ 1 → 100");
                return;
            }

            if (selectedRoomTypes.length === 0) {
                Alert.alert("⚠ Lỗi", "Vui lòng chọn ít nhất 1 loại phòng");
                return;
            }

            if (editingId) {
                console.log("UPDATE");
                console.log("SELECTED ROOM TYPES", selectedRoomTypes);

                await updateHotelPaymentType(
                    // editingId,
                    hotelId,
                    selectedPayment.id, 
                    depositPercent ?? 100,
                    selectedRoomTypes
                );
                Alert.alert("✅ Thành công", "Cập nhật thành công");
            } else {
                console.log("CREATE");
                console.log(selectedRoomTypes);

                await createHotelPaymentType(
                    hotelId,
                    selectedPayment.id,
                    depositPercent ?? 100,
                    selectedRoomTypes
                );
                Alert.alert("✅ Thành công", "Thêm thành công");
            }
            resetForm();
            loadData();
        } catch (err: any) {
            console.log(err);

            Alert.alert("❌ Lỗi", err.response?.data?.message || err.message);
        }
    };

    const handleEdit = (item: HotelPaymentTypeResponse) => {
        setEditingId(true);
        setSelectedPayment(paymentTypes.find(p => p.name === item.paymentType) || null);
        console.log("SELECTED PAYMENT", paymentTypes.find(p => p.name === item.paymentType));
        
        setDepositPercent(item.depositPercent ?? 0);
        setSelectedRoomTypes(item.roomTypeIds || []);
    };

    const handleDelete = async (id: number) => {
        await deleteHotelPaymentType(id);
        Alert.alert("✅ Thành công", "Xóa thành công");
        loadData();
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>💳 Quản Lí Thanh Toán Khách Sạn</Text>

            {/* Payment Type */}
            <View style={styles.chipContainer}>
                {paymentTypes.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.chip, selectedPayment?.id === item.id && styles.chipActive]}
                        onPress={() => {
                            setSelectedPayment(item);
                            item.name === "FULL" ? setDepositPercent(100) : setDepositPercent(undefined);
                        }}
                    >
                        <Text style={[styles.chipText, selectedPayment?.id === item.id && styles.chipTextActive]}>
                            {item.name === "FULL" ? "Thanh Toán 100%" : "Đặt Cọc"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Deposit Input */}
            {selectedPayment?.name === "DEPOSIT" && (
                <>
                    <TextInput
                        placeholder="Nhập % cọc (vd: 30)"
                        value={depositPercent?.toString()}
                        onChangeText={t => setDepositPercent(Number(t))}
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    {/* Room Type Multi Select */}
                    <Text style={styles.label}>Chọn loại phòng áp dụng:</Text>
                    <View style={styles.chipContainer}>
                        {roomTypes.map(room => {
                            const isActive = selectedRoomTypes.includes(room.id);
                            return (
                                <TouchableOpacity
                                    key={room.id}
                                    style={[styles.chip, isActive && styles.chipActive]}
                                    onPress={() => {
                                        setSelectedRoomTypes(prev =>
                                            isActive ? prev.filter(id => id !== room.id) : [...prev, room.id]
                                        );
                                    }}
                                >
                                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                        {configRoomTypes[room.room]}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </>
            )}

            {/* Submit Button */}
            <TouchableOpacity style={styles.mainButton} onPress={handleSubmit}>
                <Text style={styles.mainButtonText}>
                    {editingId ? "Cập nhật loại thanh toán" : "Thêm loại thanh toán"}
                </Text>
            </TouchableOpacity>

            {editingId && (
                <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Hủy chỉnh sửa</Text>
                </TouchableOpacity>
            )}

            {/* List */}
            <Text style={styles.sectionTitle}>Danh sách đã thêm</Text>
            <FlatList
                data={hotelPaymentTypes}
                scrollEnabled={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View>
                            <Text style={styles.cardTitle}>
                                {item.paymentType === "FULL" ? "Thanh Toán 100%" : "Đặt Cọc"} - {item.depositPercent}%
                            </Text>

                            {item.depositPercent ? (
                                <Text style={styles.cardSub}>Cọc: {item.depositPercent}%</Text>
                            ) : null}

                            {item.roomTypeIds?.length > 0 && (
                                <Text style={styles.cardSub}>
                                    Áp dụng: {item.roomTypeIds
                                        .map(id => roomTypesData.find(r => r.id === id)?.name)
                                        .join(", ")}
                                </Text>
                            )}
                        </View>


                        <View style={styles.cardActions}>
                            <TouchableOpacity onPress={() => handleEdit(item)}>
                                <Ionicons name="create-outline" size={22} color="#2d6aff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                <Ionicons name="trash-outline" size={22} color="#ff4b5c" />
                            </TouchableOpacity>
                        </View>

                    </View>
                )}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f8ff",
        padding: 16
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 16,
        textAlign: "center",
        color: "#1f2937"
    },
    label: {
        fontWeight: "600",
        marginVertical: 6,
        color: "#1f2937",
        fontSize: 15
    },
    chipContainer: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 14,
        justifyContent: "center",
        flexWrap: "wrap"
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#2d6aff"
    },
    chipActive: {
        backgroundColor: "#2d6aff"
    },
    chipText: {
        color: "#2d6aff",
        fontWeight: "600"
    },
    chipTextActive: {
        color: "#fff"
    },
    input: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#dbeafe",
        marginBottom: 14
    },
    mainButton: {
        backgroundColor: "#2d6aff",
        padding: 14,
        borderRadius: 10,
        alignItems: "center"
    },
    mainButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16
    },
    cancelBtn: { marginTop: 10, alignItems: "center" },
    cancelText: { color: "#e63946", fontWeight: "600" },
    sectionTitle: {
        marginTop: 24,
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
        color: "#1f2937"
    },
    card: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2
    },
    cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
    cardSub: { fontSize: 14, color: "#6b7280", marginTop: 2 },
    cardActions: { flexDirection: "row", gap: 14 }
});
