import React, { useState } from "react";
import { Alert, Button, Image, ScrollView, Text, TextInput, View, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

// Sửa lỗi import: bỏ khoảng trắng thừa
import { createHost, HostFiles } from "@/service/HostAPI";
import { Asset } from "expo-image-picker"; // Import Asset

// Định nghĩa lại HostFiles để rõ ràng
interface HostFiles {
  cccdMatTruoc?: Asset;
  cccdMatSau?: Asset;
  giayPhepKinhDoanh?: Asset;
}

export default function UploadHostHotelForm() {
  // ✅ Dọn dẹp state: Loại bỏ các trường không cần thiết
  const [form, setForm] = useState({
    userId: 3, // Đây là ví dụ, bạn nên lấy từ state/context của user
    stk: "",
    nganHang: "",
    chiNhanh: "",
    cccd: "",
    // Đã loại bỏ: cccdMatTruoc, cccdMatSau, giayPhepKinhDoanh, status
  });

  // Khởi tạo state cho file rõ ràng hơn
  const [files, setFiles] = useState<HostFiles>({});

  const pickImage = async (key: keyof HostFiles) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets) { // Kiểm tra result.assets
      setFiles((prev) => ({
        ...prev,
        [key]: result.assets[0],
      }));
    }
  };

  const handleSubmit = async () => {
    if (!form.stk || !form.nganHang || !form.cccd) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ STK, Ngân hàng và CCCD.");
      return;
    }
    
    // Bạn có thể thêm kiểm tra bắt buộc upload file tại đây
    if (!files.cccdMatTruoc || !files.cccdMatSau) {
       Alert.alert("Thiếu ảnh", "Vui lòng cung cấp ảnh CCCD mặt trước và mặt sau.");
       return;
    }

    try {
      const response = await createHost(form, files);
      Alert.alert("Thành công", response.message || "Gửi thành công!");
    } catch (error: any) {
      console.error("❌ Gửi thất bại:", JSON.stringify(error));
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể gửi dữ liệu");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Đăng ký chủ khách sạn</Text>

      <TextInput
        placeholder="Số tài khoản"
        value={form.stk}
        onChangeText={(text) => setForm({ ...form, stk: text })}
        style={styles.input}
      />

      <TextInput
        placeholder="Ngân hàng"
        value={form.nganHang}
        onChangeText={(text) => setForm({ ...form, nganHang: text })}
        style={styles.input}
      />

      <TextInput
        placeholder="Chi nhánh"
        value={form.chiNhanh}
        onChangeText={(text) => setForm({ ...form, chiNhanh: text })}
        style={styles.input}
      />

      <TextInput
        placeholder="CCCD"
        value={form.cccd}
        onChangeText={(text) => setForm({ ...form, cccd: text })}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.imagePickerContainer}>
        <Button title="Chọn CCCD mặt trước" onPress={() => pickImage("cccdMatTruoc")} />
        {files.cccdMatTruoc && (
          <Image source={{ uri: files.cccdMatTruoc.uri }} style={styles.image} />
        )}
      </View>

      <View style={styles.imagePickerContainer}>
        <Button title="Chọn CCCD mặt sau" onPress={() => pickImage("cccdMatSau")} />
        {files.cccdMatSau && (
          <Image source={{ uri: files.cccdMatSau.uri }} style={styles.image} />
        )}
      </View>
      
      <View style={styles.imagePickerContainer}>
        <Button title="Chọn Giấy phép kinh doanh (nếu có)" onPress={() => pickImage("giayPhepKinhDoanh")} />
        {files.giayPhepKinhDoanh && (
          <Image source={{ uri: files.giayPhepKinhDoanh.uri }} style={styles.image} />
        )}
      </View>

      <Button title="Gửi xác nhận" onPress={handleSubmit} color="#2E86DE" />
    </ScrollView>
  );
}

// Thêm một số style cơ bản
const styles = StyleSheet.create({
    container: {
        padding: 20
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 12,
        padding: 10,
        borderRadius: 5
    },
    imagePickerContainer: {
        marginBottom: 15
    },
    image: {
        width: "100%",
        height: 150,
        marginVertical: 10,
        resizeMode: 'contain',
        borderWidth: 1,
        borderColor: '#eee'
    }
});