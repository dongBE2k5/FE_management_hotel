// KycFormScreen.tsx
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
  DevSettings,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScannerCCCD } from '../modal/useScannerCCCD'; // kiểm tra đường dẫn
import CameraCaptureView from './CameraCaptureView';     // kiểm tra đường dẫn
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createHost, HostFiles } from "@/service/HostAPI";
import { getListBanks, Bank } from "@/service/BankAPI"; 

export default function KycFormScreen() {
  const [formData, setFormData] = useState({
    cccd: '',
    cccdMatTruoc: null as any,
    cccdMatSau: null as any,
    giayPhepKinhDoanh: null as any,
    nganHang: '',
    chiNhanh: '',
    stk: '',
    userId: null,
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [realUserId, setRealUserId] = useState<number | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [modalBankVisible, setModalBankVisible] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [selectedBankLogo, setSelectedBankLogo] = useState<string | null>(null);

  const {
    cameraActive,
    cameraRef,
    currentSide,
    setCameraActive,
    setCurrentSide,
    closeModal,
  } = useScannerCCCD();

  useEffect(() => {
    const initData = async () => {
      const loggedInUserId = await AsyncStorage.getItem('userId');
      if (loggedInUserId) setRealUserId(parseInt(loggedInUserId, 10));

      try {
        setLoadingBanks(true);
        const bankList = await getListBanks();
        setBanks(bankList);
      } catch (error) {
        console.error("Lỗi tải ngân hàng:", error);
      } finally {
        setLoadingBanks(false);
      }
    };
    initData();
  }, []);

  const handleSubmit = () => setShowConfirmModal(true);

  const handleConfirmSubmit = async () => {
    if (!realUserId) throw new Error("Không tìm thấy userId, vui lòng đăng nhập lại.");

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
      throw new Error("Vui lòng nhập đầy đủ STK, Ngân hàng và CCCD.");
    }

    if (!files.cccdMatTruoc || !files.cccdMatSau) {
      throw new Error("Vui lòng cung cấp ảnh CCCD mặt trước và mặt sau.");
    }

    try {
      console.log("📤 Gửi dữ liệu:", { form, files });
      const response = await createHost(form, files);
      return response.message || "Gửi thành công!";
    } catch (error: any) {
      console.error("❌ Gửi thất bại:", JSON.stringify(error));
      throw new Error(error.response?.data?.message || "Không thể gửi dữ liệu");
    }
  };

  const handleCaptureDone = (data: any, side: "front" | "back" | "license") => {
    if (!data) {
      setCameraActive(false);
      return;
    }
    setFormData(prev => {
      if (side === "front") return { ...prev, cccdMatTruoc: { uri: data.uri }, cccd: data.soCCCD || prev.cccd };
      if (side === "back") return { ...prev, cccdMatSau: { uri: data.uri } };
      return { ...prev, giayPhepKinhDoanh: { uri: data.uri } };
    });
    if (side === "back" || side === "license") setCameraActive(false);
  };

  // Component Capture Card
  const CaptureCard = ({ label, data, onPress }: { label: string, data: any, onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.captureWrapper, data ? styles.captureWrapperFilled : styles.captureWrapperEmpty]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {data ? (
        <>
          <Image source={data} style={styles.captureThumbnail} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.captureLabel}>{label}</Text>
            <Text style={styles.captureStatus}>Đã chụp</Text>
          </View>
          <Ionicons name="refresh-outline" size={24} color="#0062E0" />
        </>
      ) : (
        <>
          <Ionicons name="camera-outline" size={22} color="#0062E0" />
          <Text style={styles.captureLabel}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Xác thực tài khoản</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* CCCD */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin định danh</Text>
          <TextInput
            style={styles.input}
            placeholder="Số CCCD"
            value={formData.cccd}
            editable={false}
            placeholderTextColor="#A0AEC0"
          />
          <CaptureCard label="CCCD Mặt trước" data={formData.cccdMatTruoc} onPress={() => { setCurrentSide('front'); setCameraActive(true); }} />
          <CaptureCard label="CCCD Mặt sau" data={formData.cccdMatSau} onPress={() => { setCurrentSide('back'); setCameraActive(true); }} />
          <CaptureCard label="Giấy phép KD" data={formData.giayPhepKinhDoanh} onPress={() => { setCurrentSide('license'); setCameraActive(true); }} />
        </View>

        {/* Ngân hàng */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin ngân hàng</Text>
          <TouchableOpacity style={styles.bankSelector} onPress={() => setModalBankVisible(true)}>
            {selectedBankLogo && <Image source={{ uri: selectedBankLogo }} style={styles.bankLogo} />}
            <Text style={[styles.bankSelectorText, !formData.nganHang && { color: '#A0AEC0' }]}>{formData.nganHang || "Chọn ngân hàng"}</Text>
            <Ionicons name="chevron-down" size={20} color="#A0AEC0" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Chi nhánh (Optional)"
            placeholderTextColor="#A0AEC0"
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
        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Xác nhận</Text>
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

      {/* Bank Modal */}
      <Modal visible={modalBankVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalBankVisible(false)}><Ionicons name="close" size={28} color="#1A202C" /></TouchableOpacity>
            <Text style={styles.modalTitle}>Chọn ngân hàng</Text>
            <View style={{ width: 28 }} />
          </View>
          {loadingBanks ? (
            <ActivityIndicator size="large" color="#0062E0" style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={banks}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={{ padding: 15 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bankItem}
                  onPress={() => { setFormData(prev => ({ ...prev, nganHang: item.shortName })); setSelectedBankLogo(item.logo); setModalBankVisible(false); }}
                >
                  <Image source={{ uri: item.logo }} style={styles.bankLogo} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bankShortName}>{item.shortName}</Text>
                    <Text style={styles.bankFullName} numberOfLines={1}>{item.name}</Text>
                  </View>
                  {formData.nganHang === item.shortName && <Ionicons name="checkmark-circle" size={24} color="#0062E0" />}
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Confirm Modal */}
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
              <TouchableOpacity style={[styles.confirmButton, styles.confirmButtonCancel]} onPress={() => setShowConfirmModal(false)} disabled={loadingSubmit}>
                <Text style={styles.confirmButtonCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmButton, styles.confirmButtonSubmit]} onPress={async () => {
                try {
                  setLoadingSubmit(true);
                  const successMessage = await handleConfirmSubmit();
                  Alert.alert("✅ Thành công", successMessage, [{ text: "OK", onPress: () => DevSettings.reload() }]);
                } catch (err: any) {
                  Alert.alert("❌ Lỗi", err.message);
                } finally {
                  setLoadingSubmit(false);
                  setShowConfirmModal(false);
                }
              }} disabled={loadingSubmit}>
                {loadingSubmit ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.confirmButtonSubmitText}>Đồng ý</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A202C', textAlign: 'center' },
  scrollView: { flex: 1 },
  sectionCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0062E0', marginBottom: 15 },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 14, fontSize: 16, color: '#1A202C', marginBottom: 15 },
  bankSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 14, marginBottom: 15 },
  bankSelectorText: { fontSize: 16, color: '#1A202C', flex: 1 },
  bankLogo: { width: 24, height: 24, resizeMode: 'contain', marginRight: 10 },
  captureWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 12, marginBottom: 15 },
  captureWrapperEmpty: { borderWidth: 1.5, borderColor: '#0062E0', backgroundColor: '#E6F0FF', justifyContent: 'center' },
  captureWrapperFilled: { borderWidth: 1.5, borderColor: '#0062E0', backgroundColor: '#D0E1FF' },
  captureThumbnail: { width: 50, height: 50, borderRadius: 8, resizeMode: 'cover' },
  captureLabel: { fontSize: 15, color: '#0062E0', fontWeight: '500', marginLeft: 10 },
  captureStatus: { fontSize: 13, color: '#1A202C' },
  footer: { padding: 20, backgroundColor: '#fff' },
  primaryButton: { backgroundColor: '#0062E0', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  bankItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  bankShortName: { fontSize: 16, fontWeight: 'bold', color: '#1A202C' },
  bankFullName: { fontSize: 13, color: '#718096' },
  previewContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  confirmBox: { width: '100%', maxWidth: 400, borderRadius: 12, backgroundColor: '#fff', padding: 25, alignItems: 'center', elevation: 5 },
  confirmTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A202C', marginBottom: 20, textAlign: 'center' },
  confirmContentContainer: { width: '100%', backgroundColor: '#F7FAFC', borderRadius: 8, padding: 15, marginBottom: 25 },
  confirmLabel: { fontSize: 14, color: '#718096', marginBottom: 2 },
  confirmValue: { fontSize: 16, color: '#1A202C', fontWeight: '500', marginBottom: 10 },
  confirmButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  confirmButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  confirmButtonCancel: { backgroundColor: '#E2E8F0', marginRight: 8 },
  confirmButtonCancelText: { color: '#2D3748', fontSize: 16, fontWeight: 'bold' },
  confirmButtonSubmit: { backgroundColor: '#0062E0', marginLeft: 8 },
  confirmButtonSubmitText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  confirmDoc: { fontSize: 14, color: '#2D3748', fontStyle: 'italic', marginLeft: 10 },
});
