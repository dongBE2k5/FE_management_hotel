import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView ,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useUser } from "@/context/UserContext";
import { searchHotels } from "@/service/HotelAPI";
import { Hotel } from "@/models/Hotel";
import type { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/types/navigation";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { getAllLocation } from "@/service/LocationAPI";
import LocationSelector from "./location";

type NavigationProp = StackNavigationProp<RootStackParamList, "HotelDetail">;

export default function Search() {
  const { refreshUser } = useUser();
  const navigation = useNavigation<NavigationProp>();

  const [isModalVisible, setModalVisible] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);

  // Đổ location vào modal
  const [locations, setLocations] = useState<{ id: number; name: string }[]>([]);

  // Bộ lọc
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("");

  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [])
  );

  useEffect(() => {
    (async () => {
      const data = await getAllLocation();
      setLocations(data);
    })();
  }, []);

  // Hàm đổi location khi chọn
  const changeLocation = (id: number) => {
    if (id === 0) {
      setCity(""); // “Tất cả” → không lọc
    } else {
      const selected = locations.find((loc) => loc.id === id);
      setCity(selected?.name || "");
    }
  };

  // Gọi API tìm kiếm
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      const result = await searchHotels(keyword, city, status, minPrice, maxPrice);
      setHotels(result);
      setLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [keyword, minPrice, maxPrice, city, status]);

  return (
    <View style={styles.container}>
      {/* Ô tìm kiếm ngoài cùng */}
      <TouchableOpacity
        style={styles.searchInputContainer}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="search" size={20} color="#0077c7" />
        <Text style={styles.placeholderText}>Bạn muốn tìm khách sạn?</Text>
      </TouchableOpacity>

      {/* Modal tìm kiếm */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          {/* Header modal */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Tìm kiếm khách sạn</Text>
          </View>

          {/* Ô nhập từ khóa */}
          <View style={styles.searchBox}>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên khách sạn..."
              placeholderTextColor="#777"
              value={keyword}
              onChangeText={setKeyword}
            />
            <Ionicons name="search" size={22} color="#0077c7" />
          </View>

          {/* ----- Bộ lọc giá ----- */}
          <Text style={styles.filterTitle}>Chọn khoảng giá (VND)</Text>

          <View style={styles.sliderContainer}>
            <MultiSlider
              values={[minPrice, maxPrice]}
              min={0}
              max={10000000}
              step={50000}
              sliderLength={300}
              onValuesChange={(values) => {
                setMinPrice(values[0]);
                setMaxPrice(values[1]);
              }}
              selectedStyle={{ backgroundColor: "#0077c7" }}
              unselectedStyle={{ backgroundColor: "#ccc" }}
              markerStyle={{ backgroundColor: "#0077c7" }}
            />

            <View style={styles.priceLabels}>
              <Text style={styles.priceText}>{minPrice.toLocaleString()} đ</Text>
              <Text style={styles.priceText}>{maxPrice.toLocaleString()} đ</Text>
            </View>

            <View style={styles.tickMarks}>
              {[0, 100000, 200000, 500000, 1000000, 5000000, 10000000].map(
                (value, index) => (
                  <View key={index} style={styles.tickContainer}>
                    <View style={styles.tick} />
                    <Text style={styles.tickLabel}>
                      {value >= 1000000
                        ? `${value / 1000000}tr`
                        : value >= 1000
                          ? `${value / 1000}k`
                          : value}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>

          {/* ----- Thành phố ----- */}
          <Text style={styles.filterTitle}>Thành phố</Text>

          <LocationSelector
            locations={[{ id: 0, name: "Tất cả" }, ...locations]}
            changeLocation={changeLocation}
          />

          {/* ----- Khu vực ----- */}
          <Text style={styles.filterTitle}>Khu vực</Text>
          <View style={styles.filterRow}>
            {["Gần biển", "Gần trung tâm"].map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.filterButton,
                  status === s && styles.filterButtonActive,
                ]}
                onPress={() => setStatus(status === s ? "" : s)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    status === s && styles.filterButtonTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ----- Kết quả ----- */}
          {loading ? (
            <View style={styles.centerView}>
              <ActivityIndicator size="large" color="#0077c7" />
              <Text style={{ marginTop: 8 }}>Đang tìm kiếm...</Text>
            </View>
          ) : hotels.length === 0 && keyword !== "" ? (
            <Text style={styles.noResult}>Không tìm thấy khách sạn nào</Text>
          ) : (
            <FlatList
              data={hotels}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 100 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate("HotelDetail", { hotelId: item.id });
                  }}
                >
                  <Image
                    source={{
                      uri: item.image || "https://via.placeholder.com/150",
                    }}
                    style={styles.image}
                  />
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.city}>{item.locationName}</Text>
                    <Text style={styles.status}>
                      {item.status === "BEACH"
                        ? "Gần biển"
                        : item.status === "CENTER"
                          ? "Trung tâm"
                          : ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 20,
  },
  placeholderText: { marginLeft: 10, color: "#555", fontSize: 14 },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
  },
  input: { flex: 1, fontSize: 14, color: "#000" },
  filterTitle: { fontWeight: "600", marginTop: 10, marginBottom: 5 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 6,
  },
  filterButtonActive: { backgroundColor: "#0077c7" },
  filterButtonText: { color: "#333" },
  filterButtonTextActive: { color: "#fff" },
  centerView: { justifyContent: "center", alignItems: "center", marginTop: 30 },
  noResult: { textAlign: "center", marginTop: 20, color: "#777" },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
  },
  image: { width: 90, height: 90 },
  info: { flex: 1, padding: 10 },
  name: { fontWeight: "bold", fontSize: 14 },
  city: { color: "#555", marginTop: 3 },
  status: { color: "#009EDE", marginTop: 3, fontStyle: "italic" },
  sliderContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  priceLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 300,
    marginTop: 5,
  },
  priceText: {
    fontWeight: "600",
    color: "#0077c7",
  },
  tickMarks: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 300,
    marginTop: 15,
  },
  tickContainer: {
    alignItems: "center",
  },
  tick: {
    width: 2,
    height: 8,
    backgroundColor: "#aaa",
    marginBottom: 2,
  },
  tickLabel: {
    fontSize: 11,
    color: "#555",
  },
});
