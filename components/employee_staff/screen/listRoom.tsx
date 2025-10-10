import { useNavigation } from '@react-navigation/native'; // 👈 dùng để điều hướng giữa các màn hình
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ListRoom() {
  // ✅ Hook điều hướng (dùng navigate để chuyển màn hình)
  const navigation = useNavigation();

  // ✅ State lưu nội dung trong ô tìm kiếm
  const [search, setSearch] = useState('');

  // ✅ Dữ liệu demo (mock data)
  const data = [
    {
      id_booking: '1',
      name: 'Nguyễn Văn A',
      phone: '0123 456 789',
      roomType: 'Phòng gia đình',
      roomNumber: '123',
      checkIn: '28/01/2025',
      checkOut: '30/01/2025',
      nights: 2,
      guests: 5,
      price: '5.000.000',
      status: 'Đã thanh toán',
      checkinStatus: 'Đã Check-in',
    },
    {
      id_booking: '2',
      name: 'Nguyễn Văn B',
      phone: '0987 654 321',
      roomType: 'Phòng đơn',
      roomNumber: '456',
      checkIn: '28/01/2025',
      checkOut: '29/01/2025',
      nights: 1,
      guests: 1,
      price: '2.000.000',
      status: 'Chưa thanh toán',
    },
    {
      id_booking: '3',
      name: 'Nguyễn Văn C',
      phone: '0909 888 777',
      roomType: 'Phòng đôi',
      roomNumber: '789',
      checkIn: '28/01/2025',
      checkOut: '31/01/2025',
      nights: 3,
      guests: 2,
      price: '3.500.000',
      status: 'Đã thanh toán',
    },
    {
      id_booking: '4',
      name: 'Nguyễn Văn D',
      phone: '0900 228 777',
      roomType: 'Phòng đôi',
      roomNumber: '789',
      checkIn: '28/01/2025',
      checkOut: '31/01/2025',
      nights: 3,
      guests: 2,
      price: '3.500.000',
      status: 'Đã thanh toán',
    },
  ];

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
