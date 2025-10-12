import * as Linking from "expo-linking";

// Tạo URL từ Linking
const linkingUrl = Linking.createURL("/");

let ip = "localhost"; // fallback mặc định

try {
    const parsed = new URL(linkingUrl);

    // Nếu hostname khác "localhost" (ví dụ exp://192.168.1.6:19000)
    if (parsed.hostname && parsed.hostname !== "localhost") {
        ip = parsed.hostname;
    } else {
        // ⚙️ fallback IP LAN của bạn (hoặc để localhost)
        ip = "192.168.1.6";
    }
} catch (error) {
    console.warn("Invalid Linking URL, fallback to IP LAN:", error);
    ip = "192.168.1.6";
}

const BaseUrl = `http://${ip}:8080/api`;
export default BaseUrl;
