import * as Linking from "expo-linking";

// Tạo URL từ Linking
const linkingUrl = Linking.createURL("/");

let ip = "192.168.1.6"; // fallback mặc định

try {
    const parsed = new URL(linkingUrl);
    console.log("Lay ip host thanh cong ", parsed.hostname);
    // Nếu hostname khác "localhost" (ví dụ exp://192.168.1.6:19000)
    if (parsed.hostname && parsed.hostname !== "192.168.1.6") {
        ip = parsed.hostname;
        console.log("Lay ip host thanh cong ", ip);

    } else {
        // ⚙️ fallback IP LAN của bạn (hoặc để localhost)
        ip = "192.168.1.6";
    }
} catch (error) {
    console.warn("Invalid Linking URL, fallback to IP LAN:", error);
    ip = "192.168.1.6";
}

const BaseUrl = `http://${ip}:8080/api`;
const urlIP = `http://${ip}:8080`;
// const getBaseUrl = ip;
export default BaseUrl;
export {urlIP} ;