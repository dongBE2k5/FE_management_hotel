import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";


interface HotelFormProps {
    hotel: any;
    setHotel: (data: any) => void;
    locations: any[];
    imageUri?: string | null;
    setImageUri?: (uri: string | null) => void;
    handleSave: () => void;
    title?: string;
    saving: boolean;
    setSaving: (saving: boolean) => void;
    router: any;
}
const viewServices = [
    { id: 1, name: "Gần biển" },
    { id: 2, name: "Gần trung tâm" },
];

export default function HotelForm({
    hotel,
    locations,
    setHotel,
    imageUri,
    handleSave,
    title,
    saving,
    setSaving,
    router,
}: HotelFormProps) {
    const [showModal, setShowModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [showViewModal, setShowViewModal] = useState(false);
    const [filteredLocations, setFilteredLocations] = useState<any[]>([]);
    console.log(hotel);
    // Hàm lọc vị trí trong modal
    const handleSearch = (text: string) => {
        setSearchText(text);
        const filtered = locations.filter((item) =>
            item.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredLocations(filtered);
    };

    return (
        <ScrollView className="p-4">
            <View style={styles.card}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={26} color="#007bff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Sửa thông tin khách sạn</Text>
                </View>

                {/* Ảnh khách sạn */}
                {hotel.image ? (
                    <Image source={{ uri: hotel.image }} style={styles.hotelImage} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <MaterialIcons name="hotel" size={60} color="#aaa" />
                        <Text style={{ color: "#777", marginTop: 4 }}>Chưa có ảnh</Text>
                    </View>
                )}

                {/* Chọn vị trí */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Vị trí</Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowModal(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={{ color: hotel.location?.name ? "#000" : "#999" }}>
                            {hotel.location?.name || "Chọn vị trí"}
                        </Text>
                    </TouchableOpacity>

                    {/* Modal danh sách vị trí */}
                    <Modal visible={showModal} transparent animationType="slide">
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Chọn vị trí</Text>

                                {/* Ô tìm kiếm */}
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Tìm kiếm vị trí..."
                                    value={searchText}
                                    onChangeText={handleSearch}
                                />

                                {/* Danh sách */}
                                <FlatList
                                    data={locations}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.locationItem}
                                            onPress={() => {
                                                setHotel({
                                                    ...hotel,
                                                    locationId: item.id,
                                                    location: item,
                                                });
                                                setShowModal(false);
                                            }}
                                        >
                                            <Text style={styles.locationText}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowModal(false)}
                                    style={styles.closeButton}
                                >
                                    <Text style={{ color: "white", fontWeight: "600" }}>Đóng</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>

                {/* Các ô nhập khác */}
                {[
                    { label: "Tên khách sạn", key: "name", placeholder: "Nhập tên khách sạn" },
                    { label: "Địa chỉ", key: "address", placeholder: "Nhập địa chỉ" },
                    { label: "Số điện thoại", key: "phone", placeholder: "Nhập số điện thoại" },
                    { label: "Email", key: "email", placeholder: "Nhập email" },
                    { label: "Ảnh đại diện (URL)", key: "image", placeholder: "Dán link ảnh" },
                ].map((field) => (
                    <View key={field.key} style={styles.inputGroup}>
                        <Text style={styles.label}>{field.label}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={field.placeholder}
                            value={hotel[field.key]}
                            onChangeText={(text) => setHotel({ ...hotel, [field.key]: text })}
                        />
                    </View>
                ))}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>View</Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowViewModal(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={{ color: hotel.status ? "#000" : "#999" }}>
                            {hotel.status || "Chọn view"}
                        </Text>
                    </TouchableOpacity>

                    {/* Modal danh sách vị trí */}
                    <Modal visible={showViewModal} transparent animationType="slide">
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>View</Text>

                                {/* Danh sách */}
                                <FlatList
                                    data={viewServices}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.locationItem}
                                            onPress={() => {
                                                setHotel({
                                                    ...hotel,
                                                    status: item.name,
                                                });
                                                setShowViewModal(false);
                                            }}
                                        >
                                            <Text style={styles.locationText}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowViewModal(false)}
                                    style={styles.closeButton}
                                >
                                    <Text style={{ color: "white", fontWeight: "600" }}>Đóng</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>

                {/* Nút lưu */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <MaterialIcons name="save" size={20} color="#fff" />
                            <Text style={styles.saveText}>Lưu thay đổi</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
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