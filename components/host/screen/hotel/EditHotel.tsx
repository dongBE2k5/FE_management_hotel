import { HotelRequest } from "@/models/Hotel/HotelRequest";
import { findHotelById, updateHotel } from "@/service/HotelAPI";
import { getAllLocation } from "@/service/LocationAPI";
import { EmployeeStackParamList } from "@/types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import HotelForm from "./HotelForm";

export default function EditHotel() {
    const router = useRouter();
    const route = useRoute<RouteProp<EmployeeStackParamList, "hotelEdit">>();
    const id = route.params.id;

    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locations, setLocations] = useState<any[]>([]);
    const [filteredLocations, setFilteredLocations] = useState<any[]>([]);
    const [searchText, setSearchText] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) {
                Alert.alert("Lỗi", "Không tìm thấy userId");
                return;
            }
            setUserId(Number(userId));
            try {
                const [hotelData, locationData] = await Promise.all([
                    findHotelById(id),
                    getAllLocation(),
                ]);
                setHotel(hotelData);
                setLocations(locationData);
                setFilteredLocations(locationData);
            } catch (err) {
                Alert.alert("Lỗi", "Không thể tải dữ liệu khách sạn hoặc vị trí");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload: HotelRequest = {
                name: hotel.name,
                address: hotel.address,
                phone: hotel.phone,
                email: hotel.email,
                image: hotel.image,
                locationId: hotel.locationId || hotel.location.id,
                userId: userId!,
                status: hotel.status,
            };

            console.log(payload);
            await updateHotel(Number(id), payload);
            Alert.alert("✅ Thành công", "Cập nhật thông tin khách sạn thành công!", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (err) {
            Alert.alert("❌ Lỗi", "Không thể cập nhật khách sạn.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={{ marginTop: 8 }}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    if (!hotel) return <Text>Không tìm thấy khách sạn</Text>;

    // // Hàm lọc vị trí trong modal
    // const handleSearch = (text: string) => {
    //     setSearchText(text);
    //     const filtered = locations.filter((item) =>
    //         item.name.toLowerCase().includes(text.toLowerCase())
    //     );
    //     setFilteredLocations(filtered);
    // };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <HotelForm hotel={hotel} locations={locations} setHotel={setHotel} imageUri={hotel.image} handleSave={handleSave} title="Sửa thông tin khách sạn" saving={saving} setSaving={setSaving} router={router} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: "#f5f9ff" },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 18,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    backButton: {
        marginRight: 10,
        padding: 6,
        backgroundColor: "#eef5ff",
        borderRadius: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#222",
    },
    hotelImage: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
    },
    imagePlaceholder: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        backgroundColor: "#eee",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    inputGroup: { marginBottom: 14 },
    label: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 15,
        backgroundColor: "#fafafa",
    },
    saveButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007bff",
        borderRadius: 12,
        paddingVertical: 14,
        marginTop: 20,
    },
    saveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 6,
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        width: "85%",
        maxHeight: "75%",
        borderRadius: 12,
        padding: 16,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
    searchInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 8,
        marginBottom: 10,
    },
    locationItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    locationText: { fontSize: 16, color: "#000" },
    closeButton: {
        marginTop: 12,
        backgroundColor: "#007bff",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
});
