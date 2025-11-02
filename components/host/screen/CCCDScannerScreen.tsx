import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScannerCCCD } from '../modal/useScannerCCCD';
import CameraCaptureView from './CameraCaptureView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createHost, HostFiles } from "@/service/HostAPI";

import { useRouter } from "expo-router";
import { HostStack } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';


export default function KycFormScreen() {
  const [formData, setFormData] = useState({
    cccd: '',
    cccdMatTruoc: null,
    cccdMatSau: null,
    giayPhepKinhDoanh: null,
    nganHang: '',
    chiNhanh: '',
    stk: '',
    userId: null,
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [realUserId, setRealUserId] = useState<number | null>(null);
  // const navigation = useNavigation<HostStack>();
  const navigation = useNavigation();
  const router = useRouter();

  const {
    cameraActive,
    modalVisible,
    imagePreview,
    cameraRef,
    currentSide,
    setCameraActive,
    setCurrentSide,
    closeModal,
  } = useScannerCCCD();

  useEffect(() => {
    const fetchUserId = async () => {
      const loggedInUserId = await AsyncStorage.getItem('userId');
      if (loggedInUserId) {
        setRealUserId(parseInt(loggedInUserId, 10));
      }
    };
    fetchUserId();
  }, []);

  const handleSubmit = () => {
    setShowConfirmModal(true);
  };

  // ✅ HÀM GỬI DỮ LIỆU (đã thay thế uploadKycData)
  const handleConfirmSubmit = async () => {
    if (!realUserId) {
      Alert.alert("Lỗi", "Không tìm thấy userId, vui lòng đăng nhập lại.");
      return;
    }

    const form = {
      userId: realUserId,
      stk: formData.stk,
      nganHang: formData.nganHang,
      chiNhanh: formData.chiNhanh,
      cccd: formData.cccd,
    };

    const files: HostFiles = {
      cccdMatTruoc: formData.cccdMatTruoc,
      cccdMatSau: formData.cccdMatSau,
      giayPhepKinhDoanh: formData.giayPhepKinhDoanh,
    };

    if (!form.stk || !form.nganHang || !form.cccd) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ STK, Ngân hàng và CCCD.");
      return;
    }

    if (!files.cccdMatTruoc || !files.cccdMatSau) {
      Alert.alert("Thiếu ảnh", "Vui lòng cung cấp ảnh CCCD mặt trước và mặt sau.");
      return;
    }

    try {
      setLoadingSubmit(true);
      console.log("📤 Gửi dữ liệu:", { form, files });

      const response = await createHost(form, files);

      setLoadingSubmit(false);
      setShowConfirmModal(false);

      Alert.alert("✅ Thành công", response.message || "Gửi thành công!");
    } catch (error: any) {
      console.error("❌ Gửi thất bại:", JSON.stringify(error));
      setLoadingSubmit(false);
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể gửi dữ liệu");
    }
  };

  const handleCaptureDone = (data: any, side: "front" | "back" | "license") => {
    if (!data) {
      console.log("📤 Nhận data rỗng từ Camera, không cập nhật.");
      setCameraActive(false);
      return;
    }

    console.log("📤 Nhận data từ Camera:", side, data);

    setFormData((prev) => {
      if (side === "front") {
        return {
          ...prev,
          cccdMatTruoc: { uri: data.uri },
          cccd: data.soCCCD || prev.cccd,
        };
      } else if (side === "back") {
        return {
          ...prev,
          cccdMatSau: { uri: data.uri },
        };
      } else {
        return {
          ...prev,
          giayPhepKinhDoanh: { uri: data.uri },
        };
      }
    });

    if (side === "back" || side === "license") {
      setCameraActive(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Xác thực tài khoản</Text>
      </View>

      {/* Form nội dung */}
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Thông tin định danh */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Thông tin định danh</Text>
          <TextInput
            style={styles.input}
            placeholder="Số Căn cước công dân (CCCD)"
            keyboardType="numeric"
            value={formData.cccd}
            onChangeText={val => setFormData(prev => ({ ...prev, cccd: val }))}
            editable={false}
          />

          {/* Mặt trước */}
          <View style={styles.captureWrapper}>
            {!formData.cccdMatTruoc ? (
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={() => {
                  setCurrentSide('front');
                  setCameraActive(true);
                }}>
                <Ionicons name="camera-outline" size={22} color="#0062E0" />
                <Text style={styles.imagePickerText}>Chụp CCCD mặt trước</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imagePreviewWrapper}>
                <Image source={formData.cccdMatTruoc} style={styles.previewThumbnail} />
                <View style={styles.previewInfo}>
                  <Text style={styles.previewText}>Đã chụp CCCD mặt trước</Text>
                </View>
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={() => {
                    setCurrentSide('front');
                    setCameraActive(true);
                  }}>
                  <Ionicons name="refresh-outline" size={26} color="#0062E0" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Mặt sau */}
          <View style={styles.captureWrapper}>
            {!formData.cccdMatSau ? (
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={() => {
                  setCurrentSide('back');
                  setCameraActive(true);
                }}>
                <Ionicons name="camera-outline" size={22} color="#0062E0" />
                <Text style={styles.imagePickerText}>Chụp CCCD mặt sau</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imagePreviewWrapper}>
                <Image source={formData.cccdMatSau} style={styles.previewThumbnail} />
                <View style={styles.previewInfo}>
                  <Text style={styles.previewText}>Đã chụp CCCD mặt sau</Text>
                </View>
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={() => {
                    setCurrentSide('back');
                    setCameraActive(true);
                  }}>
                  <Ionicons name="refresh-outline" size={26} color="#0062E0" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Giấy phép KD */}
          <View style={styles.captureWrapper}>
            {!formData.giayPhepKinhDoanh ? (
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={() => {
                  setCurrentSide('license');
                  setCameraActive(true);
                }}>
                <Ionicons name="camera-outline" size={22} color="#0062E0" />
                <Text style={styles.imagePickerText}>Chụp Giấy phép kinh doanh</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imagePreviewWrapper}>
                <Image source={formData.giayPhepKinhDoanh} style={styles.previewThumbnail} />
                <View style={styles.previewInfo}>
                  <Text style={styles.previewText}>Đã chụp Giấy phép kinh doanh</Text>
                </View>
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={() => {
                    setCurrentSide('license');
                    setCameraActive(true);
                  }}>
                  <Ionicons name="refresh-outline" size={26} color="#0062E0" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Thông tin ngân hàng */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Thông tin ngân hàng</Text>
          <TextInput
            style={styles.input}
            placeholder="Tên ngân hàng"
            value={formData.nganHang}
            onChangeText={val => setFormData(prev => ({ ...prev, nganHang: val }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Chi nhánh"
            value={formData.chiNhanh}
            onChangeText={val => setFormData(prev => ({ ...prev, chiNhanh: val }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Số tài khoản (STK)"
            keyboardType="numeric"
            value={formData.stk}
            onChangeText={val => setFormData(prev => ({ ...prev, stk: val }))}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.mainConfirmButton} onPress={handleSubmit}>
          <Text style={styles.mainConfirmButtonText}>Xác nhận</Text>
        </TouchableOpacity>
      </View>

      {/* Camera Modal */}
      <Modal visible={cameraActive} animationType="slide">
        <CameraCaptureView
          cameraRef={cameraRef}
          onClose={closeModal}
          currentSide={currentSide}
          onCaptureDone={handleCaptureDone}
        />
      </Modal>

      {/* Xác nhận gửi */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.previewContainer}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Xác nhận thông tin</Text>

            <View style={styles.confirmContentContainer}>
              <Text style={styles.confirmLabel}>Số CCCD:</Text>
              <Text style={styles.confirmValue}>{formData.cccd || "(Chưa có)"}</Text>
              <Text style={styles.confirmLabel}>Ngân hàng:</Text>
              <Text style={styles.confirmValue}>{formData.nganHang || "(Chưa có)"}</Text>
              <Text style={styles.confirmLabel}>Số tài khoản:</Text>
              <Text style={styles.confirmValue}>{formData.stk || "(Chưa có)"}</Text>
              <Text style={styles.confirmLabel}>Tài liệu đính kèm:</Text>
              {formData.cccdMatTruoc && <Text style={styles.confirmDoc}>- Đã có CCCD mặt trước</Text>}
              {formData.cccdMatSau && <Text style={styles.confirmDoc}>- Đã có CCCD mặt sau</Text>}
              {formData.giayPhepKinhDoanh && <Text style={styles.confirmDoc}>- Đã có Giấy phép KD</Text>}
            </View>

            <View style={styles.confirmButtonContainer}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonCancel]}
                onPress={() => setShowConfirmModal(false)}
                disabled={loadingSubmit}
              >
                <Text style={styles.confirmButtonCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonSubmit]}
                onPress={async () => {
                  try {
                    setLoadingSubmit(true);
                    await handleConfirmSubmit(); // Gửi dữ liệu xác minh lên server

                    Alert.alert("✅ Thành công", "Xác minh thành công! Quay lại trang chính...", [
                      {
                        text: "OK",
                        onPress: () => {
                  router.replace("/(host)/rooms");
                        },
                      },
                    ]);
                  } catch (err) {
                    Alert.alert("❌ Lỗi", "Không thể xác minh, vui lòng thử lại.");
                  } finally {
                    setLoadingSubmit(false);
                    setShowConfirmModal(false);
                  }
                }}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonSubmitText}>Đồng ý</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// === STYLE ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
  },
  scrollView: { flex: 1 },
  formGroup: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0062E0',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0062E0',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#1A202C',
    marginBottom: 15,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F0FF',
    borderWidth: 1.5,
    borderColor: '#0062E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  imagePickerText: { fontSize: 15, color: '#0062E0', marginLeft: 10 },
  captureWrapper: { marginBottom: 15 },
  imagePreviewWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F0FF',
    borderWidth: 1.5,
    borderColor: '#0062E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  previewThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#D0E1FF',
    resizeMode: 'cover',
  },
  previewInfo: { flex: 1, marginLeft: 12 },
  previewText: { fontSize: 15, color: '#0062E0', fontWeight: '500' },
  rescanButton: { paddingLeft: 10, paddingVertical: 5 },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  mainConfirmButton: {
    backgroundColor: '#0062E0',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  mainConfirmButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmBox: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmContentContainer: {
    width: '100%',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 15,
    marginBottom: 25,
  },
  confirmLabel: { fontSize: 14, color: '#718096', marginBottom: 2 },
  confirmValue: { fontSize: 16, color: '#1A202C', fontWeight: '500', marginBottom: 10 },
  confirmDoc: { fontSize: 14, color: '#2D3748', fontStyle: 'italic', marginLeft: 10 },
  confirmButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  confirmButtonCancel: { backgroundColor: '#E2E8F0', marginRight: 8 },
  confirmButtonCancelText: { color: '#2D3748', fontSize: 16, fontWeight: 'bold' },
  confirmButtonSubmit: { backgroundColor: '#0062E0', marginLeft: 8 },
  confirmButtonSubmitText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
