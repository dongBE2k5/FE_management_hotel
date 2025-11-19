import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default function PaymentBankScreen({ route }) {
  const [open, setOpen] = useState(false);
  const urlImage =
    "https://img.vietqr.io/image/Vietcombank-1028672810-compact2.png?amount=100000&addInfo=1&accountName=host";

  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    if (!permissionResponse) {
      requestPermission();
    }
  }, [permissionResponse]);

  const saveImage = async () => {
    try {
      if (!permissionResponse?.granted) {
        const perm = await requestPermission();
        if (!perm.granted) {
          alert("Bạn chưa cấp quyền!");
          return;
        }
      }

      const fileUri = FileSystem.cacheDirectory + "qr_image.jpg";

      // tải ảnh bằng legacy downloadAsync
      const download = await FileSystem.downloadAsync(urlImage, fileUri);

      // lưu vào thư viện
      await MediaLibrary.saveToLibraryAsync(download.uri);

      alert("Đã lưu ảnh!");
    } catch (err) {
      console.log("Save error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.openBtn} onPress={() => setOpen(true)}>
        <Text style={styles.openText}>Xem QR</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <Image source={{ uri: urlImage }} style={styles.modalImage} />

            <TouchableOpacity style={styles.btn} onPress={() => { setOpen(false); }}>
              <Text style={styles.textBtn}>Hoàn tất</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={saveImage}>
              <Text style={styles.textBtn}>Tải QR</Text>
            </TouchableOpacity>

          </View>
        </View>
      )}
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  openBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  openText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Nền mờ phía sau
  modalOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Hộp modal
  modalBox: {
    width: "85%",
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  // nút đóng
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  closeText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#444",
  },

  modalImage: {
    width: "90%",
    height: 300,
    borderRadius: 10,
    marginVertical: 15,
    backgroundColor: "#f3f3f3",
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

