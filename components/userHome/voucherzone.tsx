import { useEffect, useState } from 'react';
import { ScrollView, Text, View, ImageBackground, Alert } from 'react-native';
import VoucherCard from './voucherCard';
import { getAllVouchers } from '@/service/VoucherAPI';
import { saveUserVoucher, getUserVouchers } from '@/service/UserVoucherAPI';
import Voucher from '@/models/Voucher';
import bgVoucher from "../../assets/images/bgvoucher.png";

export default function VoucherZone() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [savedVouchers, setSavedVouchers] = useState<Voucher[]>([]); // 👈 danh sách đã lưu
  const userId = 1; // tạm thời fix cứng

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const all = await getAllVouchers();
    const saved = await getUserVouchers(userId);
    setVouchers(all);
    setSavedVouchers(saved);
  };

  const handleSaveVoucher = async (voucher: Voucher) => {
    console.log("📩 Đang lưu voucher:", voucher);
    const res = await saveUserVoucher(userId, voucher.id!);
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
          {vouchers.map(v => (
            <VoucherCard
              key={v.id}
              voucher={v}
              onSave={handleSaveVoucher}
              isSaved={isVoucherSaved(v.id!)} // ✅ giờ không lỗi nữa
            />
          ))}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
