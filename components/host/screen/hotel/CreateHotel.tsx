import { HotelRequest } from "@/models/Hotel/HotelRequest";
import { createHotel } from "@/service/HotelAPI";
import { getAllLocation } from "@/service/LocationAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import HotelForm from "./HotelForm";

export default function CreateHotel() {
  const router = useRouter();
  const [hotel, setHotel] = useState<any>({
    name: "",
    address: "",
    phone: "",
    email: "",
    image: "",
    status: "",
    locationId: null,
    location: null,
  });

  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert("Lỗi", "Không tìm thấy userId");
          return;
        }
        setUserId(Number(userId));

        const locationData = await getAllLocation();
        setLocations(locationData);
      } catch (err) {
        Alert.alert("Lỗi", "Không thể tải danh sách vị trí");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!hotel.name || !hotel.address || !hotel.locationId) {
      Alert.alert("⚠️ Thiếu thông tin", "Vui lòng nhập đủ tên, địa chỉ và vị trí.");
      return;
    }

    try {
      setSaving(true);
      const payload: HotelRequest = {
        name: hotel.name,
        address: hotel.address,
        phone: hotel.phone,
        email: hotel.email,
        image: hotel.image,
        locationId: hotel.locationId,
        userId: userId!,
        status: hotel.status || "ACTIVE",
      };

      await createHotel(payload);
      Alert.alert("✅ Thành công", "Đã tạo khách sạn mới!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.log(err);
      Alert.alert("❌ Lỗi", "Không thể tạo khách sạn mới.");
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <HotelForm
        hotel={hotel}
        setHotel={setHotel}
        locations={locations}
        handleSave={handleSave}
        title="Thêm khách sạn mới"
        saving={saving}
        setSaving={setSaving}
        router={router}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f5f9ff" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
});
