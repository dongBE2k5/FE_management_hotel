import { Hotel } from '@/models/Hotel';
import Ionicons from '@expo/vector-icons/Ionicons';
import { saveViewedHotelAPI } from '@/service/HotelAPI';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HotelCardProps {
    handleNavigations: (id: number) => void
    data: Hotel;
     onViewedUpdate?: () => void; 
}

const HotelCard: React.FC<HotelCardProps> = ({ handleNavigations, data,onViewedUpdate  }) => {
    const handlePress = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                // ✅ Gọi API lưu lịch sử đã xem gần đây
                await saveViewedHotelAPI(Number(userId), data.id);
                  onViewedUpdate?.();
            }
        } catch (err) {
            console.error("Error saving viewed hotel:", err);
        } finally {
            // ✅ Sau khi lưu, chuyển sang trang chi tiết
            handleNavigations(data.id);
            
        }
    };

    return (
        <View style={styles.cardWrapper}>
            <TouchableOpacity
              onPress={handlePress}
            // style={{ backgroundColor: "blue", padding: 10, borderRadius: 5 }}
            >
                <ImageBackground
                    source={{ uri: `${data.image}` }}
                    style={styles.container}

                >
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ backgroundColor: '#0E0E14', width: 80, padding: 5, borderRadius: 5, flexDirection: 'row' }}>
                            <Image style={{ width: 10, height: 10 }} source={require("../../assets/images/gps.png")} />
                            <Text style={{ color: 'white', fontSize: 10, marginLeft: 5 }}>{data.locationName}</Text>

                        </View>
                        <Ionicons style={{ left: 70, marginTop: 2 }} name="bookmark-outline" size={20} color="white" />
                    </View>
                    <View style={{ backgroundColor: '#FF6210', width: 90, padding: 2, top: 50, left: 90 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10, marginLeft: 5 }}>Tiết kiệm 25%</Text>
                    </View>
                </ImageBackground >
                <View style={{

                    width: 180,
                    height: 20,
                    overflow: 'hidden',  // để bo góc imageBackground
                    alignItems: 'center',
                    padding: 5,
                    backgroundColor: '#275DE5'
                }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10, marginLeft: 5 }}>Gần biển</Text>
                </View>
                <View style={{

                    width: 180,
                    height: 100,
                    overflow: 'hidden',  // để bo góc imageBackground
                    padding: 5,
                    backgroundColor: 'white',
                    borderBottomLeftRadius: 5,
                    borderBottomRightRadius: 5,

                }}>
                    <Text style={{ color: '#534F4F', fontWeight: 'bold', fontSize: 11, marginLeft: 5, marginTop: 10 }}>{data.name}</Text>
                    <View style={{ flexDirection: 'row', marginLeft: 5 }}>
                        <Ionicons name="star" size={13} color="#FFD700" />
                        <Ionicons name="star" size={13} color="#FFD700" />
                        <Ionicons name="star" size={13} color="#FFD700" />
                        <Ionicons name="star-half" size={13} color="#FFD700" />
                        <Ionicons name="star-outline" size={13} color="#FFD700" />
                    </View>
                    <View style={{ flexDirection: 'row', marginLeft: 5, marginTop: 'auto' }}>
                        <Image style={{ width: 10, height: 10, tintColor: '#009EDE' }} source={require("../../assets/images/logo.png")} />
                        <Text style={{ fontSize: 9, marginLeft: 5, color: '#009EDE', fontWeight: 'bold' }}>8.4/10</Text>
                        <Text style={{ fontSize: 9, marginLeft: 5, color: 'black', fontWeight: 'bold', }}>(795)</Text>
                    </View>

                    <Text style={{ fontSize: 10, marginTop: 5, marginLeft: 5, color: '#FF6210', fontWeight: 'bold' }}>Chi tiết</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {

        width: 180,
        height: 100,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        overflow: 'hidden',  // để bo góc imageBackground
        backgroundColor: 'white', // fallback khi ảnh chưa load
    },
    cardWrapper: {
        margin: 10,
        borderRadius: 8,
        // iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        // Android
        elevation: 4,
    }

});
export default HotelCard;
