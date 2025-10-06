import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import HotelReviewDialog from '@/components/dialog/HotelReviewDialog';

type BookingDetailProps = {
  routeParams: Record<string, string | undefined>;
};

export default function BookingDetail({ routeParams }: BookingDetailProps) {
  const [visible, setVisible] = useState(false);

  const {
    hotelName = 'Khách sạn Mường Thanh Grand Đà Nẵng',
    roomName = 'Superior Twin Room - Room with Breakfast',
    hotelImage = require("../../assets/images/ks1.jpg"),
    checkIn = '',
    checkOut = '',
    nights = '0',
    specialRequests = '[]',
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

  // Nếu chưa thanh toán
  if (isPaid !== 'true') {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Bạn chưa có đơn đặt phòng nào được thanh toán.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Chi tiết đặt phòng</Text>
        <Text style={styles.label}>{hotelName}</Text>
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
          Trạng thái thanh toán: <Text style={{ color: 'green' }}>Đã thanh toán</Text>
        </Text>

        {/* 🟦 Nút mở dialog */}
        <TouchableOpacity style={styles.reviewButton} onPress={() => setVisible(true)}>
          <Text style={styles.reviewText}>Đánh giá khách sạn</Text>
        </TouchableOpacity>
      </View>

      {/* 🟨 Dialog đánh giá */}
      <HotelReviewDialog
        visible={visible}
        onClose={() => setVisible(false)}
        hotelName={hotelName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 10 },
  hotelImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewButton: {
    backgroundColor: '#73c5fc',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  reviewText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 16, color: '#888', textAlign: 'center',
  },
});
