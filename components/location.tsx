import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";

// Danh sách các vị trí
const locations = ["Đà Nẵng", "Hà Nội", "TP.HCM","Nha Trang","Vũng Tàu","Đà Lạt","Hạ Long","Quy Nhơn"];

export default function LocationSelector() {
    // Mặc định chọn vị trí đầu tiên
    const [selectedLocation, setSelectedLocation] = useState(locations[0]);

    return (
        <View style={{ flexDirection: "row", padding: 10 }}>
            {locations.map((loc) => (
                <TouchableOpacity
                    key={loc}
                    onPress={() => setSelectedLocation(loc)}
                    style={[
                        styles.locationButton,
                        selectedLocation === loc && styles.activeButton,
                    ]}
                >
                    <Text
                        style={[
                            styles.locationText,
                            selectedLocation === loc && styles.activeText,
                        ]}
                    >
                        {loc}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    locationButton: {
        borderRadius: 5,
        padding: 8,
        marginRight: 5,
        backgroundColor: 'transparent', // không màu nếu không active
    },
    activeButton: {
        backgroundColor: '#73c5fc', // màu khi active
    },
    locationText: {
        fontSize: 12,
        color: '#0F4DEB',
        fontWeight: 'bold',
    },
    activeText: {
        color: '#fff',
    },
});
