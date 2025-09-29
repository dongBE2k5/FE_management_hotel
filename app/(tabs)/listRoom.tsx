import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
} from 'react-native';

export default function BookingList() {
  // State cho ô tìm kiếm
  const [search, setSearch] = useState('');

  // Dữ liệu demo (mock data)
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

  // Hàm render từng thẻ đặt phòng
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Tên + SĐT */}
            <Text style={styles.booking}>ID Booking: {item.id_booking}</Text>

      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.phone}>{item.phone}</Text>

      {/* Loại phòng + số phòng */}
      <View style={styles.row}>
        <Text>🏨 {item.roomType} - Phòng {item.roomNumber}</Text>
      </View>

      {/* Ngày check-in / check-out + số đêm */}
      <View style={styles.row}>
        <Text>📅 {item.checkIn} → {item.checkOut}</Text>
        <Text>{item.nights} đêm</Text>
      </View>

      {/* Số khách + Giá tiền */}
      <View style={styles.row}>
        <Text>👥 {item.guests} khách</Text>
        <Text style={styles.price}>₫ {item.price}</Text>
      </View>

      {/* Ghi chú dịch vụ kèm theo */}
      <Text style={styles.note}>🛁 Tắm miễn phí, buffet buổi sáng</Text>

      {/* Trạng thái thanh toán + check-in */}
      <View style={styles.statusRow}>
        <Text
          style={[
            styles.status,
            item.status === 'Đã thanh toán'
              ? styles.paid
              : styles.unpaid,
          ]}
        >
          {item.status}
        </Text>

        {/* Chỉ hiển thị khi có checkinStatus */}
        {item.checkinStatus && (
          <Text style={[styles.status, styles.checkin]}>
            {item.checkinStatus}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tiêu đề */}
      <Text style={styles.title}>Danh Sách Đặt Phòng</Text>

      {/* Ô tìm kiếm */}
      <TextInput
        style={styles.search}
        placeholder="Tìm kiếm theo ID, Tên hoặc SĐT"
        value={search}
        onChangeText={setSearch}
      />

      {/* Danh sách cuộn */}
      <FlatList
  data={data.filter(d => {
  const keyword = search.toLowerCase().trim();

  // Nếu search là số và độ dài <= 3 ký tự → coi như tìm ID
  if (!isNaN(keyword) && keyword !== "" && keyword.length <= 3) {
    return String(d.id_booking) === keyword;
  }

  // Còn lại thì tìm theo tên hoặc SĐT
  return (
    d.name.toLowerCase().includes(keyword) ||
    d.phone.toLowerCase().includes(keyword)
  );
})}

  keyExtractor={item => String(item.id_booking)}
  renderItem={renderItem}
  showsVerticalScrollIndicator={false}
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16, // khoảng cách lề ngoài
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  search: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 16,
  },
  booking:{
    fontWeight:"bold",
    fontSize:14,
      alignSelf: "flex-end",


  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  phone: {
    color: '#444',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row', // ngang hàng
    justifyContent: 'space-between', // 2 đầu
    marginVertical: 2,
  },
  price: {
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: '#444',
    marginTop: 6,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8, // khoảng cách giữa badge
  },
  status: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20, // bo tròn badge
    overflow: 'hidden',
  },
  paid: {
    backgroundColor: '#d4f5dd',
    color: '#1b7b34',
  },
  unpaid: {
    backgroundColor: '#e7e7e7',
    color: '#555',
  },
  checkin: {
    backgroundColor: '#d0f0ff',
    color: '#0077aa',
  },
});
