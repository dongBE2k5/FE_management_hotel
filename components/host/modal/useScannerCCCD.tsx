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
        console.log("⚠️ Không phát hiện được văn bản hợp lệ.");
        Alert.alert(
          "Không thể đọc ảnh",
          "Vui lòng đảm bảo ảnh rõ nét, đủ sáng và không bị lóa."
        );
      } else {
        let detectedSide: CurrentSide = null;
        const text = normalized;
        // ... (Regex isLicense, isFront, isBack giữ nguyên) ...
        const isLicense =
          /GIAY\s+(PHEP|CHUNG\s+NHAN)\s+(KINH\s+DOANH|DANG\s+KY\s+DOANH\s+NGHIEP)/.test(text) ||
          /MA\s*SO\s*(DOANH\s+NGHIEP|MSDN)/.test(text) ||
          /CONG\s+TY/.test(text) ||
          /DOANH\s+NGHIEP/.test(text);
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

        if (isLicense) detectedSide = "license";
        else if (isFront) detectedSide = "front";
        else if (isBack) detectedSide = "back";
        console.log("🧭 Detected Side:", detectedSide);

        if (!detectedSide) {
          console.log("❌ Không xác định được loại giấy tờ.");
          Alert.alert(
            "Không nhận diện được",
            "Không tìm thấy giấy tờ hợp lệ trong ảnh. Vui lòng căn chỉnh lại."
          );
        } else {
          const sideToCheck = expectedSide || currentSide;
          if (sideToCheck && detectedSide !== sideToCheck) {
            console.log(`🚫 Sai loại giấy tờ! Mong đợi: ${sideToCheck}, phát hiện: ${detectedSide}`);
            Alert.alert(
              "Quét sai mặt giấy tờ",
              `Bạn đang chọn quét "${sideToCheck === "front" ? "Mặt trước" : sideToCheck === "back" ? "Mặt sau" : "Giấy phép KD"}", nhưng ảnh lại là "${detectedSide}".\n\nVui lòng thử lại.`
            );
          } else {
            console.log("✅ Loại giấy tờ hợp lệ:", detectedSide);
            if (detectedSide === "front") {
              console.log("🔍 Đang xử lý MẶT TRƯỚC...");

              // ⬇️ --- SỬA LỖI REGEX TẠI ĐÂY --- ⬇️
              // Regex cũ: const soCCCDMatch = normalized.match(/\b0\d{11}\b/);

              // Regex mới: Tìm 12 chữ số (bắt đầu bằng 0) có cho phép khoảng trắng ở giữa
              const soCCCDMatch = normalized.match(/\b(0\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d)\b/);

              // ⬆️ --- KẾT THÚC SỬA REGEX --- ⬆️

              const ngaySinhMatch = normalized.match(/\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/);
              const hoTenMatch =
                normalized.match(/HO VA TEN\s*([A-Z\s]+)/) ||
                normalized.match(/([A-Z]{2,}\s){2,}[A-Z]{2,}/);
              const hoTen = hoTenMatch ? (hoTenMatch[1] || hoTenMatch[0]).trim() : "Không xác định";
              const ngaySinh = ngaySinhMatch ? ngaySinhMatch[0] : "---";

              // ⬇️ --- SỬA CÁCH LẤY KẾT QUẢ --- ⬇️
              // Nếu tìm thấy, loại bỏ tất cả khoảng trắng
              const soCCCD = soCCCDMatch ? soCCCDMatch[0].replace(/\s/g, "") : "---";
              // ⬆️ --- KẾT THÚC SỬA --- ⬆️

              console.log("🆔 Số CCCD:", soCCCD);

              const data = { hoTen, ngaySinh, soCCCD, uri: imageUri };
              setFrontData(data);
              setImagePreview(imageUri);
              setCurrentSide("back");
              Alert.alert(
                "Thành công: Mặt trước",
                "Đã nhận diện xong mặt trước. Vui lòng lật thẻ và quét MẶT SAU."
              );
              dataToReturn = data;

            } else if (detectedSide === "back") {
              console.log("🔍 Đang xử lý MẶT SAU...");
              // ... (bóc tách) ...
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
              Alert.alert(
                "Hoàn tất: Mặt sau",
                `Nơi cấp: ${noiCap}\nTrạng thái: ${matchResult}`
              );
              const data = { ngayCap: "---", noiCap, uri: imageUri };
              setBackData(data);
              dataToReturn = data;

            } else if (detectedSide === "license") {
              console.log("🔍 Đang xử lý GIẤY PHÉP KINH DOANH...");
              // ... (bóc tách) ...
              const businessCodeMatch = normalized.match(/\b\d{10}\b/);
              const companyNameMatch = normalized.match(/CONG TY[ A-Z0-9]+/);
              const legalRepMatch =
                normalized.match(/HO VA TEN[:\s]*([A-Z\s]+)/) ||
                normalized.match(/NGUOI DAI DIEN[ A-Z0-9\s]+/);
              const addressMatch =
                normalized.match(/(DIA CHI|TRU SO CHINH)[:\s]*([A-Z0-9,\s]+)/);
              const businessCode = businessCodeMatch ? businessCodeMatch[0].trim() : "---";
              const companyName = companyNameMatch ? companyNameMatch[0].replace(/CONG TY\s*/, "CÔNG TY ").trim() : "---";
              const legalRep = legalRepMatch ? (legalRepMatch[1] || legalRepMatch[0]).replace(/NGUOI DAI DIEN|HO VA TEN/gi, "").trim() : "---";
              const address = addressMatch ? (addressMatch[2] || addressMatch[0]).trim() : "---";
              Alert.alert(
                "Thành công: Giấy phép KD",
                `Công ty: ${companyName}\nMã số: ${businessCode}`
              );
              const data = { companyName, businessCode, legalRep, address, uri: imageUri };
              setImagePreview(imageUri);
              setCurrentSide("license");
              setCameraActive(false);
              setModalVisible(true);
              dataToReturn = data;
            }

          }
        }
      }
      console.log("========== ✅ OCR HOÀN TẤT ==========");
    } catch (err) {
      console.error("❌ Lỗi OCR:", err);
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
    const result = await processImageOCR(uri, expectedSide);
    return result;
  };

  // ⬇️ --- SỬA HÀM PICK IMAGE (ĐÃ LÀM Ở BƯỚC TRƯỚC) --- ⬇️
  const pickImageFromLibrary = async (
    expectedSide?: "front" | "back" | "license"
  ): Promise<any | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selected = result.assets[0];
      if (selected.uri) {
        return await processImageOCR(selected.uri, expectedSide);
      }
    }
    return null;
  };
  // ⬆️ --- KẾT THÚC SỬA --- ⬆️

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