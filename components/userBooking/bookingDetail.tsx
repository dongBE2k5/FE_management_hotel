import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

type BookingDetailProps = {
  routeParams: Record<string, string | undefined>;
};

export default function BookingDetail({ routeParams }: BookingDetailProps) {
  const {
    hotelName = 'Khách sạn Mường Thanh Grand Đà Nẵng',
    roomName = 'Superior Twin Room - Room with Breakfast',
    hotelImage = require('@/assets/images/ks1.jpg'),
    checkIn = '',
    checkOut = '',
    nights = '0',
    roomPrice = '0',
    taxFee = '0',
    insuranceSelected = 'false',
    insurancePrice = '0',
    specialRequests = '[]',
    specialRequestPrice = '0',
    totalPrice = '0',
    isPaid = 'false',
  } = routeParams;

  const specialReqArray = (() => {
    try {
      return JSON.parse(specialRequests);
    } catch {
      return [];
    }
  })();

  // ✅ Nếu chưa thanh toán, trả về danh sách trống / thông báo
  if (isPaid !== 'true') {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Bạn chưa có đơn đặt phòng nào được thanh toán.</Text>
      </View>
    );
  }

  // ✅ Nếu đã thanh toán, hiển thị chi tiết
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Khách sạn đã đặt</Text>
      <Text style={styles.label}>Khách sạn: {hotelName}</Text>
      <Image source={hotelImage} style={styles.hotelImage} />
      <Text style={styles.label}>Loại phòng: {roomName}</Text>
      <Text style={styles.label}>Ngày nhận: {checkIn}</Text>
      <Text style={styles.label}>Ngày trả: {checkOut}</Text>
      <Text style={styles.label}>Số đêm: {nights}</Text>

      {specialReqArray.length > 0 && (
        <View>
          <Text style={styles.label}>Yêu cầu đặc biệt:</Text>
          {specialReqArray.map((r: string, i: number) => (
            <Text key={i} style={styles.label}>• {r}</Text>
          ))}
        </View>
      )}

      <Text style={styles.label}>
        Tổng tiền: {Number(totalPrice).toLocaleString('vi-VN')} VND
      </Text>
      <Text style={styles.label}>
        Trạng thái thanh toán:{' '}
        <Text style={{ color: 'green' }}>Đã thanh toán</Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 10 },
  hotelImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  // Kiểu cho phần chưa có thanh toán
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
