import * as Linking from "expo-linking";

// Tạo URL từ Linking
const linkingUrl = Linking.createURL("/");


let ip = "localhost"; // fallback mặc định

try {
    const parsed = new URL(linkingUrl);
    console.log("Lay ip host thanh cong ", parsed.hostname);
    // Nếu hostname khác "localhost" (ví dụ exp://192.168.1.6:19000)
    if (parsed.hostname && parsed.hostname !== "localhost") {
        ip = parsed.hostname;
        console.log("Lay ip host thanh cong ", ip);

    } else {
        // ⚙️ fallback IP LAN của bạn (hoặc để localhost)
        ip = "localhost";
    }
} catch (error) {
    console.warn("Invalid Linking URL, fallback to IP LAN:", error);
    ip = "localhost";
}

const BaseUrl = `http://${ip}:8080/api`;
//export const BaseUrl2 = `http://${ip}:8080/api`;
//export const BaseUrl = `https://prudish-leonie-noncapriciously.ngrok-free.dev/api`;

const urlIP = `http://${ip}:8080`;
 //const urlIP = `https://prudish-leonie-noncapriciously.ngrok-free.dev`;
// const getBaseUrl = ip;
export default  BaseUrl ;
// export const urlImage = `${urlIP}/uploads/`;
export const urlImage = `http://${urlIP}/uploads/`;

export { urlIP };
