import PaymentAPI from "@/service/Payment/PaymentAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PaymentBankScreen({ visible, onClose, route }) {
  console.log("url route", route

  );

  if (!visible) return null;
  //   const navigation = useNavigation();
  const url = route?.data.url;   // lấy đúng URL
  console.log("url đã nhận", url);
  const urlImage = url;

  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    if (!permissionResponse) requestPermission();
  }, [permissionResponse]);

  const saveImage = async () => {
    try {
      const perm = await requestPermission();
      if (!perm?.granted) {
        alert("Bạn chưa cấp quyền!");
        return;
      }

      const fileUri = FileSystem.cacheDirectory + "qr_image.jpg";
      const download = await FileSystem.downloadAsync(urlImage, fileUri);

      await MediaLibrary.saveToLibraryAsync(download.uri);
      alert("Đã lưu ảnh!");
    } catch (err) {
      console.log("Save error:", err);
    }
  };
  const handleSubmit = async () => {


    try {
      const role = await AsyncStorage.getItem("role")
      if (role === "ROLE_USER") {
        onClose();
        router.replace("/(tabs)/booking");
      }
      else {
        
        PaymentAPI.updateStatusPayById(Number(route?.data.idpay),"SUCCESS")
        onClose();
      }

    } catch (error) {

    }


  }
  return (
    <Modal visible={true} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>

        <View style={styles.modalBox}>
          {/* Nút đóng */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          {/* QR */}
          <Image source={{ uri: urlImage }} style={styles.modalImage} />

          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.textBtn}>Hoàn tất</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={saveImage}>
            <Text style={styles.textBtn}>Tải QR</Text>
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeText: {
    fontSize: 30,
    color: "#333",
    fontWeight: "800",
  },
  modalImage: {
    width: "90%",
    height: 300,
    borderRadius: 10,
    marginVertical: 15,
  },
  btn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginVertical: 8,
  },
  textBtn: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
