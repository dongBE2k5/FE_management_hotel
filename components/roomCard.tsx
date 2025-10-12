import Room from '@/models/Room';
import type { RootStackParamList } from '@/types/navigation';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface RoomCardProps {
  checkInDate: Date;
  checkOutDate?: Date | null;
  rooms: Room[];
}

export default function RoomCard({ rooms, checkInDate, checkOutDate }: RoomCardProps) {
  console.log("checkInDate", checkInDate);
  console.log("checkOutDate", checkOutDate);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  if (rooms.length === 0) return "Đã hết phòng";
  const goBooking = (room: Room) => {
    navigation.navigate('FormBooking', {
      room: room,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate || null,
      // => số, không phải chuỗi có dấu chấm
    });
  };
  const formatVND = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0, // bỏ phần thập phân
    }).format(amount);
  };


  return (
    <>
      {rooms.map((room) => (
        <View key={room.id} style={styles.card}>
          <Text style={styles.title}>{room.typeRoom == "DON" ? "Phòng đơn" : room.typeRoom == "DOI" ? "Phòng đôi" : "Phòng gia đình"}</Text>

          <View style={styles.row}>
            {/* Cột trái */}
            <View style={{ flex: 1 }}>
              <Text style={styles.breakfast}>{room.description}</Text>

              <View style={styles.iconRow}>
                <Ionicons style={styles.icon} name="checkmark" size={20} color="green" />
                <Text style={styles.infoText}>Miễn phí hủy phòng</Text>
              </View>

              <View style={styles.iconRow}>
                <Ionicons style={styles.icon} name="checkmark" size={20} color="green" />
                <Text style={styles.infoText}>{room.typeRoom == "DON" ? "Phòng 1 người" : room.typeRoom == "DOI" ? "Phòng 2 người" : "Phòng 4 trở lên"}</Text>
              </View>

              <View style={styles.iconRow}>
                <Ionicons style={styles.icon} name="gift" size={20} color="green" />
                <Text style={styles.promo}>Ưu đãi cho khách đặt phòng sớm</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.newPrice}>{formatVND(Number(room.price))}</Text>
                {/* <Text style={styles.oldPrice}>1.042.423 VND</Text> */}
              </View>

              <Text style={styles.subText}>Tổng giá {formatVND(Number(room.price))}</Text>
              <Text style={styles.subText}>Bao gồm thuế và phí</Text>
            </View>

            {/* Cột phải */}
            <View style={styles.rightCol}>
              {/* <Text style={styles.limited}>Chỉ còn 4 phòng</Text> */}
              <TouchableOpacity onPress={() => goBooking(room)} style={styles.bookBtn}>
                <Text style={styles.bookText}>Đặt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
    paddingBottom: 20,
    paddingHorizontal: 10,
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,

    // Elevation cho Android
    elevation: 8,
  },
  title: { fontWeight: 'bold', fontSize: 20, padding: 15 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',   // ✨ quan trọng
    paddingRight: 10
  },
  breakfast: { fontWeight: 'bold', fontSize: 15, marginLeft: 10 },
  iconRow: { flexDirection: 'row', marginTop: 5, marginLeft: 10 },
  icon: { marginRight: 5 },
  infoText: { fontWeight: 'bold', fontSize: 12, marginTop: 2 },
  promo: {
    fontWeight: 'bold',
    fontSize: 12,
    backgroundColor: '#E5FFFE',
    padding: 5,
    borderRadius: 10,
    color: '#999494'
  },
  priceRow: { flexDirection: 'row', marginTop: 10, marginLeft: 10 },
  newPrice: {
    color: '#FF6210',
    fontWeight: 'bold',
    fontSize: 17,
    marginRight: 5
  },
  oldPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through'
  },
  subText: {
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 10,
    marginLeft: 10,
    color: '#999494'
  },
  rightCol: {
    justifyContent: 'flex-end',  // ✨ đẩy xuống đáy
    alignItems: 'center'
  },
  limited: { color: '#FF5D5D', fontWeight: 'bold', marginBottom: 5 },
  bookBtn: {
    backgroundColor: '#009EDE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15
  }
  , bookText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center'
  }
});
