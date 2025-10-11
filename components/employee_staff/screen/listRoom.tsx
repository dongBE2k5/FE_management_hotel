import { useNavigation } from '@react-navigation/native'; // 👈 dùng để điều hướng giữa các màn hình
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getAllBookingsByHotelId } from '@/service/BookingAPI';



export default function ListRoom() {

  const mapBookingData = (booking) => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const nights = Math.max(0, (checkOut - checkIn) / (1000 * 60 * 60 * 24)); // số ngày
    return {
      id_booking: booking.id,
      name: booking.user?.fullName || '',
      phone: booking.user?.phone || '',
      roomType: booking.room?.type || '',
      roomNumber: booking.room?.number || '',
      checkIn: booking.checkInDate || '',
      checkOut: booking.checkOutDate || '',
      status: booking.status || '',
      price: booking.totalPrice || '',
      checkinStatus: '',
      nights,
      guests: booking.numberOfGuests || 0,
    };

  };
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchViewedHotels = async () => {
      try {
        const response = await getAllBookingsByHotelId(Number(1)); // không cần axios.get nữa
        console.log(response);
        setData(response.map(mapBookingData)); // tùy backend trả về gì
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đặt phòng:", error);
      }
    };
    fetchViewedHotels();
  }, []);

  // ✅ Hook điều hướng (dùng navigate để chuyển màn hình)
  const navigation = useNavigation();

  // ✅ State lưu nội dung trong ô tìm kiếm
  const [search, setSearch] = useState('');

  // ✅ Dữ liệu demo (mock data)


  // ✅ Hàm xử lý khi nhấn vào một thẻ đặt phòng


  // ✅ Hàm render từng item trong danh sách
  const renderItem = ({ item }) => (
    // 👇 Bọc mỗi thẻ trong TouchableOpacity để có thể click
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('bookingDetail', { bookingId: item.id_booking })}>
      {/* <Link href="/bookingDetail">Xem danh sách phòng</Link> */}
      {/* ID Booking hiển thị ở góc phải */}
      <Text style={styles.booking}>ID Booking: {item.id_booking}</Text>

      {/* Họ tên khách */}
      <Text style={styles.name}>{item.name}</Text>

      {/* Số điện thoại */}
      <Text style={styles.phone}>{item.phone}</Text>

      {/* Loại phòng + Số phòng */}
      <View style={styles.row}>
        <Text>🏨 {item.roomType} - Phòng {item.roomNumber}</Text>
      </View>

      {/* Ngày check-in/check-out + số đêm */}
      <View style={styles.row}>
        <Text>📅 {item.checkIn} → {item.checkOut}</Text>
        <Text>{item.nights} đêm</Text>
      </View>

      {/* Số khách + Giá tiền */}
      <View style={styles.row}>
        <Text>👥 {item.guests} khách</Text>
        <Text style={styles.price}>₫ {item.price}</Text>
      </View>

      {/* Ghi chú thêm */}
      <Text style={styles.note}>🛁 Tắm miễn phí, buffet buổi sáng</Text>

      {/* Trạng thái thanh toán & check-in */}
      <View style={styles.statusRow}>
        {/* Badge thanh toán */}
        <Text
          style={[
            styles.status,
            item.status === 'Đã thanh toán'
              ? styles.paid // màu xanh nếu đã thanh toán
              : styles.unpaid, // màu xám nếu chưa
          ]}
        >
          {item.status}
        </Text>

        {/* Nếu có trạng thái check-in thì hiển thị thêm */}
        {item.checkinStatus && (
          <Text style={[styles.status, styles.checkin]}>
            {item.checkinStatus}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ✅ Tiêu đề trang */}
      <Text style={styles.title}>Danh Sách Đặt Phòng</Text>

      {/* ✅ Ô tìm kiếm */}
      <TextInput
        style={styles.search}
        placeholder="Tìm kiếm theo ID, Tên hoặc SĐT"
        value={search}
        onChangeText={setSearch}
      />

      {/* ✅ Danh sách cuộn hiển thị các thẻ đặt phòng */}
      <FlatList
        // Bộ lọc tìm kiếm (lọc theo ID hoặc Tên, SĐT)
        data={data.filter((d) => {
          const keyword = search.toLowerCase().trim();

          // Nếu nhập số và độ dài <= 3 → coi là tìm theo ID
          if (!isNaN(keyword) && keyword !== '' && keyword.length <= 3) {
            return String(d.id_booking) === keyword;
          }

          // Ngược lại thì tìm theo tên hoặc SĐT
          return (
            d.name.toLowerCase().includes(keyword) ||
            d.phone.toLowerCase().includes(keyword)
          );
        })}
        keyExtractor={(item) => String(item.id_booking)} // key duy nhất
        renderItem={renderItem} // render từng phần tử
        showsVerticalScrollIndicator={false} // ẩn thanh cuộn
      />
    </View>
  );
}

/* 🎨 StyleSheet - phần định dạng giao diện */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },

  // Tiêu đề lớn phía trên
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  // Ô tìm kiếm
  search: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },

  // Card của từng đơn đặt phòng
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 16,
  },

  // ID booking
  booking: {
    fontWeight: 'bold',
    fontSize: 14,
    alignSelf: 'flex-end',
  },

  // Họ tên khách
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Số điện thoại
  phone: {
    color: '#444',
    marginBottom: 6,
  },

  // Layout hàng ngang cho thông tin
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },

  // Giá tiền
  price: {
    fontWeight: 'bold',
  },

  // Ghi chú (dịch vụ kèm)
  note: {
    fontSize: 12,
    color: '#444',
    marginTop: 6,
  },

  // Hàng chứa badge trạng thái
  statusRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },

  // Kiểu chung cho badge
  status: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  // Đã thanh toán (màu xanh)
  paid: {
    backgroundColor: '#d4f5dd',
    color: '#1b7b34',
  },

  // Chưa thanh toán (màu xám)
  unpaid: {
    backgroundColor: '#e7e7e7',
    color: '#555',
  },

  // Đã check-in (màu xanh nhạt)
  checkin: {
    backgroundColor: '#d0f0ff',
    color: '#0077aa',
  },
});
