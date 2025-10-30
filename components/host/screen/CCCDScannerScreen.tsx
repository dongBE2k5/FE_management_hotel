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
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScannerCCCD } from '../modal/useScannerCCCD';
import CameraCaptureView from './CameraCaptureView';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function KycFormScreen() {
  const [formData, setFormData] = useState({
    cccd: '',
    cccd_mat_truoc: null,
    cccd_mat_sau: null,
    giay_phep_kinh_doanh: null,
    ngan_hang: '',
    chi_nhanh: '',
    stk: '',
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // 🟢 1. Bổ sung state để giữ UserID
  const [realUserId, setRealUserId] = useState<number | null>(null);

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

  // (Effect log, giữ nguyên)
  useEffect(() => {
    console.log("🔄 cameraActive:", cameraActive, "modalVisible:", modalVisible);
  }, [cameraActive, modalVisible]);

  // 🟢 2. Bổ sung useEffect để lấy (giả lập) userId khi vào màn hình
  useEffect(() => {
    // Giả lập lấy userId khi component mount
    const fetchUserId = async () => {
      // ⚠️ ĐÂY LÀ NƠI BẠN LẤY ID TỪ AUTH CONTEXT HOẶC ASYNCSTORAGE
      // VÍ DỤ: const id = await AsyncStorage.getItem('userId');
      // ❌ XÓA DÒNG GIẢ LẬP NÀY:
      // console.log("Đã giả lập lấy userId: 1");
      // setRealUserId(1);
      // ✅ THAY THẾ BẰNG LOGIC THẬT, VÍ DỤ:
      const loggedInUserId = await AsyncStorage.getItem('user_id');
      if (loggedInUserId) {
        setRealUserId(parseInt(loggedInUserId, 10));
      }
    };
    fetchUserId();
  }, []); // Chạy 1 lần

  const handleSubmit = () => {
    setShowConfirmModal(true);
  };

  // 🟢 3. Sửa hàm POST API
  const uploadKycData = async (data: typeof formData) => {

    const API_URL = 'http://192.168.100.242:8080/api/host/create'; // (Hoặc IP máy ảo: 10.0.2.2)

    // ❗️ Thêm kiểm tra
    if (!realUserId) {
      console.error('Lỗi: realUserId là null!');
      return { success: false, error: "Không tìm thấy ID người dùng. Vui lòng đăng nhập lại." };
    }

    const body = new FormData();

    // 1. Tạo DTO
    const dto = {
      userId: realUserId, // ⬅️ SỬA LỖI TẠI ĐÂY
      stk: data.stk,
      nganHang: data.ngan_hang,
      chiNhanh: data.chi_nhanh,
      cccd: data.cccd,
    };

    // 2. ❗️ Quay lại cách gửi string đơn giản (đã sửa ở backend)
    body.append('data', JSON.stringify(dto));

    // 3. Hàm helper (Giữ nguyên)
    const appendFileToForm = (fieldName: string, fileData: { uri: string } | null) => {
      if (fileData && fileData.uri) {
        const uri = fileData.uri;
        const uriParts = uri.split('/');
        const fileName = uriParts[uriParts.length - 1];
        let fileType = 'image/jpeg';
        if (fileName.endsWith('.png')) fileType = 'image/png';

        body.append(fieldName, {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: fileName,
          type: fileType,
        });
      }
    };

    // 4. Thêm files (Giữ nguyên)
    appendFileToForm('cccdMatTruoc', data.cccd_mat_truoc);
    appendFileToForm('cccdMatSau', data.cccd_mat_sau);
    appendFileToForm('giayPhepKinhDoanh', data.giay_phep_kinh_doanh);

    console.log("📤 Đang gửi FormData (dạng string, có userId) lên API...");

    // 5. Gửi request (Giữ nguyên)
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: body,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi từ server: ${response.status} - ${errorText}`);
      }
      const responseData = await response.json();
      return { success: true, data: responseData };

    } catch (error) {
      console.error('Lỗi khi gửi KYC:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  // (Hàm handleConfirmSubmit giữ nguyên)
  const handleConfirmSubmit = async () => {
    setLoadingSubmit(true);
    const result = await uploadKycData(formData);
    setLoadingSubmit(false);
    setShowConfirmModal(false);

    if (result.success) {
      console.log("✅ Gửi thành công:", result.data);
      Alert.alert("Thành công", "Thông tin của bạn đã được gửi đi.");
    } else {
      console.log("❌ Gửi thất bại:", result.error);
      Alert.alert("Gửi thất bại", `Đã xảy ra lỗi: ${result.error}`);
    }
  };

  // (Hàm handleCaptureDone giữ nguyên)
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
          cccd_mat_truoc: { uri: data.uri },
          cccd: data.soCCCD || prev.cccd,
        };
      } else if (side === "back") {
        return {
          ...prev,
          cccd_mat_sau: { uri: data.uri },
        };
      } else {
        return {
          ...prev,
          giay_phep_kinh_doanh: { uri: data.uri },
        };
      }
    });

    if (side === "back" || side === "license") {
      setCameraActive(false);
    }
  };

  return (
    // (Toàn bộ JSX và Styles giữ nguyên y hệt như file bạn gửi)
    <SafeAreaView style={styles.container}>
      {/* Header (Giữ nguyên) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Xác thực tài khoản</Text>
      </View>

      {/* ScrollView (Giữ nguyên toàn bộ nội dung bên trong) */}
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* --- Thông tin định danh --- */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Thông tin định danh</Text>
          {/* ... TextInput ... */}
          <TextInput
            style={styles.input}
            placeholder="Số Căn cước công dân (CCCD)"
            keyboardType="numeric"
            value={formData.cccd}
            onChangeText={val => setFormData(prev => ({ ...prev, cccd: val }))}
            editable={false}
          />
          {/* ... Mặt trước ... */}
          <View style={styles.captureWrapper}>
            {!formData.cccd_mat_truoc ? (
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
                <Image source={formData.cccd_mat_truoc} style={styles.previewThumbnail} />
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
          {/* ... Mặt sau ... */}
          <View style={styles.captureWrapper}>
            {!formData.cccd_mat_sau ? (
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
                <Image source={formData.cccd_mat_sau} style={styles.previewThumbnail} />
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
          {/* ... Giấy phép KD ... */}
          <View style={styles.captureWrapper}>
            {!formData.giay_phep_kinh_doanh ? (
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
                <Image source={formData.giay_phep_kinh_doanh} style={styles.previewThumbnail} />
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

        {/* --- Thông tin ngân hàng --- */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Thông tin ngân hàng</Text>
          {/* ... TextInput Ngân hàng, Chi nhánh, STK ... */}
          <TextInput
            style={styles.input}
            placeholder="Tên ngân hàng"
            value={formData.ngan_hang}
            onChangeText={val => setFormData(prev => ({ ...prev, ngan_hang: val }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Chi nhánh"
            value={formData.chi_nhanh}
            onChangeText={val => setFormData(prev => ({ ...prev, chi_nhanh: val }))}
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

      {/* --- Footer (Giữ nguyên) --- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.mainConfirmButton} onPress={handleSubmit}>
          <Text style={styles.mainConfirmButtonText}>Xác nhận</Text>
        </TouchableOpacity>
      </View>

      {/* 📸 Modal Camera (Giữ nguyên) */}
      <Modal visible={cameraActive} animationType="slide">
        <CameraCaptureView
          cameraRef={cameraRef}
          onClose={closeModal}
          currentSide={currentSide}
          onCaptureDone={handleCaptureDone}
        />
      </Modal>

      {/* 🖼️ Modal xem ảnh OCR (Giữ nguyên) */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.previewContainer}>
          <View style={styles.previewBox}>
            {imagePreview && (
              <Image source={{ uri: imagePreview }} style={styles.previewImage} />
            )}
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close-circle" size={40} color="#ff3333" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🟢 6. Cập nhật Modal Xác nhận (Giữ nguyên) */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.previewContainer}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Xác nhận thông tin</Text>

            <View style={styles.confirmContentContainer}>
              {/* ... (Nội dung tóm tắt giữ nguyên) ... */}
              <Text style={styles.confirmLabel}>Số CCCD:</Text>
              <Text style={styles.confirmValue}>{formData.cccd || "(Chưa có)"}</Text>
              <Text style={styles.confirmLabel}>Ngân hàng:</Text>
              <Text style={styles.confirmValue}>{formData.ngan_hang || "(Chưa có)"}</Text>
              <Text style={styles.confirmLabel}>Số tài khoản:</Text>
              <Text style={styles.confirmValue}>{formData.stk || "(Chưa có)"}</Text>
              <Text style={styles.confirmLabel}>Tài liệu đính kèm:</Text>
              {formData.cccd_mat_truoc && <Text style={styles.confirmDoc}>- Đã có CCCD mặt trước</Text>}
              {formData.cccd_mat_sau && <Text style={styles.confirmDoc}>- Đã có CCCD mặt sau</Text>}
              {formData.giay_phep_kinh_doanh && <Text style={styles.confirmDoc}>- Đã có Giấy phép KD</Text>}
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
                onPress={handleConfirmSubmit}
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
// (Toàn bộ style giữ nguyên như file bạn đã gửi)
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
  captureWrapper: {
    marginBottom: 15
  },

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
  previewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  previewText: {
    fontSize: 15,
    color: '#0062E0',
    fontWeight: '500',
  },
  rescanButton: {
    paddingLeft: 10,
    paddingVertical: 5,
  },

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
  previewBox: {
    width: '85%',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 10,
    alignItems: 'center',
  },
  previewImage: { width: 250, height: 150, borderRadius: 8, marginBottom: 10 },

  confirmBox: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
  confirmLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 2,
  },
  confirmValue: {
    fontSize: 16,
    color: '#1A202C',
    fontWeight: '500',
    marginBottom: 10,
  },
  confirmDoc: {
    fontSize: 14,
    color: '#2D3748',
    fontStyle: 'italic',
    marginLeft: 10,
  },
  confirmButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonCancel: {
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  confirmButtonCancelText: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButtonSubmit: {
    backgroundColor: '#0062E0',
    marginLeft: 8,
  },
  confirmButtonSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});