import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useScannerCCCD } from "../modal/useScannerCCCD"; // Giả sử hook ở đúng vị trí
import { useRouter } from "expo-router";
import { Alert } from "react-native";
const { width, height } = Dimensions.get("window");

const FRAME_WIDTH_CCCD = width * 0.9;
const FRAME_HEIGHT_CCCD = FRAME_WIDTH_CCCD * 0.63;
const FRAME_WIDTH_LICENSE = width * 0.9;
const FRAME_HEIGHT_LICENSE = FRAME_WIDTH_LICENSE * 1.414;

export default function CameraCaptureView(props: {
  onClose?: () => void;
  onCaptureDone?: (data: any, side: "front" | "back" | "license") => void;
  cameraRef?: any;
  currentSide?: "front" | "back" | "license";
}) {
  const { onClose, onCaptureDone, cameraRef: cameraRefProp, currentSide: propSide } = props;

  // Hook này đã được sửa ở bước trước (không còn callback)
  const {
    cameraRef: cameraRefFromHook,
    loading,
    currentSide,
    handleCapture,
    pickImageFromLibrary,
    setCameraActive,
  } = useScannerCCCD();

  const cameraRef = cameraRefProp || cameraRefFromHook;
  const [scanAnim] = useState(new Animated.Value(0));
  const [torchOn, setTorchOn] = useState(true);
  const [displaySide, setDisplaySide] = useState<"front" | "back" | "license">(propSide || "front");
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  useEffect(() => {
    setCameraActive(true);
    if (propSide) setDisplaySide(propSide);
  }, [propSide]);

  useEffect(() => {
    // Hook 'useScannerCCCD' tự động đổi 'currentSide' (từ front -> back)
    // Cập nhật lại 'displaySide' của component này để khớp
    if (currentSide) setDisplaySide(currentSide);
  }, [currentSide]);

  useEffect(() => {
    const heightToAnimate =
      displaySide === "license" ? FRAME_HEIGHT_LICENSE - 5 : FRAME_HEIGHT_CCCD - 5;

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: heightToAnimate, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [displaySide]);

  const title =
    displaySide === "front"
      ? "MẶT TRƯỚC CCCD"
      : displaySide === "back"
        ? "MẶT SAU CCCD"
        : "GIẤY PHÉP KINH DOANH";

  const frameStyle =
    displaySide === "license"
      ? { width: FRAME_WIDTH_LICENSE, height: FRAME_HEIGHT_LICENSE, top: height * 0.1 }
      : { width: FRAME_WIDTH_CCCD, height: FRAME_HEIGHT_CCCD, top: height * 0.25 };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        enableTorch={torchOn}
        mode="picture"
      />

      <View style={styles.overlayContainer}>
        <View style={styles.header}>
          {/* ⚠️ Sửa lại nút Close ở đây, nó bị đè bởi style 'closeButton' */}
          <TouchableOpacity
            onPress={() => {
              setCameraActive(false);
              if (onClose) onClose();
              else router.back();
            }}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{title}</Text>


          {/* ⬇️ --- SỬA LOGIC ONPRESS CỦA NÚT NÀY --- ⬇️ */}
          <TouchableOpacity
            onPress={async () => {
              // 1. Gọi hàm pickImage (dùng 'displaySide' để biết mặt đang mong đợi)
              const result = await pickImageFromLibrary(displaySide);

              // 2. Logic y hệt nút chụp:
              // Nếu 'result' là 'null' (do sai mặt, hoặc người dùng hủy)
              // thì 'useScannerCCCD' đã lo Alert, chúng ta không làm gì.
              if (result) {
                if (onCaptureDone) {
                  // Gửi dữ liệu về KycFormScreen
                  onCaptureDone(result, displaySide);
                }

                // 3. Tự động đóng modal nếu thành công
                if (displaySide === "back" || displaySide === "license") {
                  setCameraActive(false);
                  if (onClose) onClose();
                }
              }
            }}
          >
            <Ionicons name="images-outline" size={26} color="#fff" />
          </TouchableOpacity>
          {/* ⬆️ --- KẾT THÚC SỬA --- ⬆️ */}
        </View>

        {/* Nút close button cũ bị 'absolute' ở style, nên xóa nó khỏi đây */}
        {/* <TouchableOpacity style={styles.closeButton} ... /> */}

        <View style={styles.mask} />
        <View style={[styles.frameBox, frameStyle]}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <Animated.View style={[styles.laser, { transform: [{ translateY: scanAnim }] }]} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.warningText}>
            Đặt giấy tờ <Text style={{ color: "#00C6FF" }}>TRỌN TRONG KHUNG</Text>
          </Text>
          <Text style={styles.subText}>Canh đều 4 góc và giữ yên tay khi chụp</Text>
        </View>
      </View>

      <View style={styles.bottomBar}>
        {/* ⬇️ --- PHẦN SỬA LỖI LOGIC NẰM Ở ĐÂY --- ⬇️ */}
        <TouchableOpacity
          onPress={async () => {
            if (cameraRef && cameraRef.current && !loading) { // Thêm check !loading
              const photo = await cameraRef.current.takePictureAsync();
              console.warn("📸 Ảnh chụp:", photo.uri);

              // 'result' sẽ là 'null' nếu quét thất bại (ví dụ: sai mặt)
              const result = await handleCapture(photo.uri, displaySide);

              // 🟢 SỬA LỖI: Chỉ chạy khi 'result' hợp lệ (KHÔNG null)
              if (result) {
                if (onCaptureDone) {
                  // 'result' đã chứa 'uri' nên chỉ cần truyền 'result'
                  onCaptureDone(result, displaySide);
                }

                // 🟢 SỬA LỖI: Chỉ đóng modal nếu quét 'back' hoặc 'license' THÀNH CÔNG
                if (displaySide === "back" || displaySide === "license") {
                  setCameraActive(false);
                  if (onClose) onClose();
                }
              }
              // Nếu 'result' là 'null' (quét sai):
              // - 'useScannerCCCD' đã hiển thị Alert.
              // - Chúng ta không làm gì cả, modal sẽ giữ nguyên.
              // - 'loading' đã được set 'false' (trong finally của hook).
              // Người dùng có thể bấm chụp lại.

            } else if (loading) {
              // Không làm gì nếu đang loading
            } else {
              Alert.alert("Lỗi Camera", "Không thể chụp ảnh, vui lòng thử lại.");
            }
          }}
          style={styles.captureButton}
          disabled={loading} // Nút chụp vẫn bị vô hiệu hóa khi loading
        >
          {loading && <ActivityIndicator size="large" color="#00C6FF" />}
        </TouchableOpacity>
        {/* ⬆️ --- KẾT THÚC SỬA LỖI LOGIC --- ⬆️ */}

        <TouchableOpacity
          onPress={() => setTorchOn((prev) => !prev)}
          style={{ position: "absolute", right: 30, bottom: 30 }}
        >
          <Ionicons name={torchOn ? "flash" : "flash-off"} size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: { ...StyleSheet.absoluteFillObject, alignItems: "center" },
  header: {
    position: "absolute",
    top: 50,
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  mask: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  frameBox: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#00C6FF",
    borderRadius: 12,
    overflow: "hidden",
  },
  corner: { position: "absolute", width: 40, height: 40, borderColor: "#00C6FF" },
  topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4 },
  laser: {
    position: "absolute",
    width: "100%",
    height: 3,
    backgroundColor: "#00FF00",
    opacity: 0.7,
  },
  textContainer: {
    position: "absolute",
    bottom: height * 0.15,
    alignItems: "center",
    marginBottom: 80,
  },
  warningText: { color: "#fff", fontWeight: "700", fontSize: 16, marginBottom: 6 },
  subText: { color: "#ccc", fontSize: 14, textAlign: "center", lineHeight: 20 },
  bottomBar: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    width: 90,
    height: 90,
    bottom: 20,
    borderRadius: 50,
    backgroundColor: "#fff",
    borderWidth: 6,
    borderColor: "#00C6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  // ⚠️ XÓA HOẶC SỬA STYLE NÀY (nếu bạn muốn giữ nó)
  // Hiện tại nó đang đè lên nút "Close" trong 'header'
  /* closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 50,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 30,
  },
  */
});