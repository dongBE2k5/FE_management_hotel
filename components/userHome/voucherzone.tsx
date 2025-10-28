import Voucher from '@/models/Voucher';
import { getUserVouchers, saveUserVoucher } from '@/service/UserVoucherAPI';
import { getAllVouchers } from '@/service/VoucherAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, ScrollView, Text, View } from 'react-native';
import bgVoucher from "../../assets/images/bgvoucher.png";
import VoucherCard from './voucherCard';

export default function VoucherZone() {
  const [appVouchers, setAppVouchers] = useState<Voucher[]>([]);
  const [hotelVouchers, setHotelVouchers] = useState<Voucher[]>([]);

  const [savedVouchers, setSavedVouchers] = useState<Voucher[]>([]); // 👈 danh sách đã lưu
  let userId: String | null

  useEffect(() => {
    const getUserIdFunction = async () => {
      userId = await AsyncStorage.getItem("userId");
    }
    getUserIdFunction()
    fetchData();
  }, []);

  const fetchData = async () => {
    const all = await getAllVouchers();
    const saved = await getUserVouchers(Number(userId));

    // Chia ra 2 loại
    const app = all.filter(v => !v.hotelId);
    const hotel = all.filter(v => v.hotelId);

    setAppVouchers(app);
    setHotelVouchers(hotel);
    setSavedVouchers(saved);
  };


  const handleSaveVoucher = async (voucher: Voucher) => {
    userId = await AsyncStorage.getItem("userId");

    console.log("📩 Đang lưu voucher:", voucher);
    const res = await saveUserVoucher(Number(userId), voucher.id!);
    if (res) {
      Alert.alert("✅ Thành công", "Voucher đã được lưu!");
      // 👇 Cập nhật danh sách để nút đổi thành “Đã lưu”
      setSavedVouchers((prev) => [...prev, voucher]);
    } else {
      Alert.alert("❌ Lỗi", "Voucher này đã được lưu trước đó!");
    }
  };

  // ✅ Kiểm tra voucher đã lưu chưa
  const isVoucherSaved = (voucherId: number) =>
    savedVouchers.some((v) => v.id === voucherId);

  return (
    <View>
      <ImageBackground
        source={bgVoucher}
        style={{ width: '100%', height: 200, transform: [{ translateY: -20 }] }}
        resizeMode="cover"
      >
        <Text style={{ margin: 10, color: '#534F4F', fontWeight: '700', fontSize: 20 }}>
          Coupon EPIC tri ân
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {appVouchers.map(v => (
            <VoucherCard
              key={v.id}
              voucher={v}
              onSave={handleSaveVoucher}
              isSaved={isVoucherSaved(v.id!)}
            />
          ))}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
