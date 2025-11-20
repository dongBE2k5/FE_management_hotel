import { useState, useRef, useEffect } from "react";
import { Alert } from "react-native";
import { useCameraPermissions, CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import { useRouter } from "expo-router";

// ... (Interface CCCDFrontData, CCCDBackData, type CurrentSide... giữ nguyên) ...
interface CCCDFrontData {
  hoTen: string;
  ngaySinh: string;
  soCCCD: string;
  uri?: string;
}
interface CCCDBackData {
  ngayCap: string;
  noiCap: string;
  uri?: string;
}
type CurrentSide = "front" | "back" | "license" | null;


export const useScannerCCCD = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSide, setCurrentSide] = useState<CurrentSide>(null);
  const [frontData, setFrontData] = useState<CCCDFrontData | null>(null);
  const [backData, setBackData] = useState<CCCDBackData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const normalizeText = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const processImageOCR = async (
    imageUri: string,
    expectedSide?: "front" | "back" | "license"
  ): Promise<any | null> => {
    let dataToReturn: any = null;

    try {
      setLoading(true);
      const result = await TextRecognition.recognize(imageUri);
      const recognizedText = result?.text?.toUpperCase() || "";
      const normalized = normalizeText(recognizedText);

      console.log("========== 📸 OCR DEBUG ==========");
      console.log("🧾 Normalized text:", normalized.slice(0, 500));

      if (!normalized || normalized.length < 10) {
        Alert.alert(
          "Không thể đọc ảnh",
          "Vui lòng đảm bảo ảnh rõ nét, đủ sáng và không bị lóa."
        );
      } else {
        let detectedSide: CurrentSide = null;
        const text = normalized;

        // Kiểm tra CCCD mặt trước và mặt sau giữ nguyên
        const isFront =
          /CAN.?CUOC/.test(text) ||
          /CON.?G.?DAN/.test(text) ||
          /VIET\s*NAM/.test(text) ||
          /HO\s+VA\s+TEN/.test(text) ||
          /NGAY\s+SINH/.test(text);
        const isBack =
          /CONG\s*AN/.test(text) ||
          /CUC\s+CANH\s+SAT/.test(text) ||
          /QUAN\s+LY\s+HANH\s+CHINH/.test(text) ||
          /NGAY\s*CAP/.test(text) ||
          /NOI\s*CAP/.test(text) ||
          /IDVNM[0-9A-Z<]+/.test(text);

        if (isFront) detectedSide = "front";
        else if (isBack) detectedSide = "back";
        else if (expectedSide === "license") detectedSide = "license"; // Luôn cho phép lưu license

        console.log("🧭 Detected Side:", detectedSide);

        if (!detectedSide) {
          Alert.alert(
            "Không nhận diện được",
            "Không tìm thấy giấy tờ hợp lệ trong ảnh. Vui lòng căn chỉnh lại."
          );
        } else {
          const sideToCheck = expectedSide || currentSide;
          if (sideToCheck && detectedSide !== sideToCheck && detectedSide !== "license") {
            Alert.alert(
              "Quét sai mặt giấy tờ",
              `Bạn đang chọn quét "${sideToCheck}", nhưng ảnh lại là "${detectedSide}". Vui lòng thử lại.`
            );
          } else {
            // Xử lý mặt trước
            if (detectedSide === "front") {
              const soCCCDMatch = normalized.match(/\b(0\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d)\b/);
              const ngaySinhMatch = normalized.match(/\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/);
              const hoTenMatch =
                normalized.match(/HO VA TEN\s*([A-Z\s]+)/) ||
                normalized.match(/([A-Z]{2,}\s){2,}[A-Z]{2,}/);
              const hoTen = hoTenMatch ? (hoTenMatch[1] || hoTenMatch[0]).trim() : "Không xác định";
              const ngaySinh = ngaySinhMatch ? ngaySinhMatch[0] : "---";
              const soCCCD = soCCCDMatch ? soCCCDMatch[0].replace(/\s/g, "") : "---";

              const data = { hoTen, ngaySinh, soCCCD, uri: imageUri };
              setFrontData(data);
              setImagePreview(imageUri);
              setCurrentSide("back");

              Alert.alert(
                "✅ Quét Mặt Trước Thành Công",
                `🎯 Họ và Tên: ${hoTen}\n🗓 Ngày Sinh: ${ngaySinh}\n🆔 Số CCCD: ${soCCCD}\n\n➡️ Vui lòng lật thẻ và quét Mặt Sau.`,
                [{ text: "OK" }]
              );
              dataToReturn = data;

            // Xử lý mặt sau
            } else if (detectedSide === "back") {
              let noiCap = "Không xác định";
              if (normalized.includes("CUC CANH SAT") || normalized.includes("CONG AN"))
                noiCap = "Cục Cảnh sát QLHC về TTXH";
              const mrzMatch = normalized.match(/IDVNM[0-9A-Z<]+/);
              const maSo = mrzMatch ? mrzMatch[0] : "---";
              let tenSau = "---";
              const tenMatch = normalized.match(/([A-Z]+<<[A-Z<]+)|([A-Z\s]{5,})$/);
              if (tenMatch)
                tenSau = tenMatch[0].replace(/<+/g, " ").replace(/\s+/g, " ").trim();
              const matchResult = frontData?.hoTen
                ? normalizeText(tenSau).includes(normalizeText(frontData.hoTen))
                  ? `✅ Họ tên trùng khớp`
                  : `⚠️ Họ tên không khớp`
                : "Không có dữ liệu mặt trước để so sánh.";

              const data = { ngayCap: "---", noiCap, uri: imageUri };
              setBackData(data);
              Alert.alert(
                "✅ Quét Mặt Sau Thành Công",
                `🏢 Nơi Cấp: ${noiCap}\n🆔 Mã Số: ${maSo}\n🧾 Tên: ${tenSau}\n📌 So khớp Họ tên: ${matchResult}`,
                [{ text: "OK" }]
              );
              dataToReturn = data;

            // Xử lý License (bỏ kiểm tra regex, luôn lưu)
            } else if (detectedSide === "license") {
              const data = { uri: imageUri };
              setImagePreview(imageUri);
              setCurrentSide("license");
              setCameraActive(false);
              setModalVisible(true);
              Alert.alert(
                "✅ Ảnh đã được lưu thành công",
                "📷 Ảnh này đã được lưu lại và sẽ xử lý xác minh sau .",
                [{ text: "OK" }]
              );
              dataToReturn = data;
            }
          }
        }
      }
    } catch (err) {
      Alert.alert(
        "Đã xảy ra lỗi",
        `Không thể xử lý ảnh. Vui lòng thử lại sau.\n(Lỗi: ${String(err)})`
      );
    } finally {
      setLoading(false);
    }
    return dataToReturn;
  };

  const handleCapture = async (uri: string, expectedSide?: "front" | "back" | "license") => {
    return await processImageOCR(uri, expectedSide);
  };

  const pickImageFromLibrary = async (expectedSide?: "front" | "back" | "license") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selected = result.assets[0];
      if (selected.uri) return await processImageOCR(selected.uri, expectedSide);
    }
    return null;
  };

  const closeModal = () => {
    setCameraActive(false);
    setModalVisible(false);
  };

  return {
    permission,
    cameraActive,
    currentSide,
    modalVisible,
    loading,
    frontData,
    backData,
    imagePreview,
    cameraRef,
    setCameraActive,
    setCurrentSide,
    handleCapture,
    pickImageFromLibrary,
    closeModal,
  };
};
