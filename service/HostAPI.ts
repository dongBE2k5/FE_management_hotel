import BaseUrl from "@/constants/BaseURL";
import axios from "axios";

// Định nghĩa interface Host
export interface Host {
    userId: number;
    stk: string;
    nganHang: string;
    chiNhanh: string;
    cccd: number;
    //   cccdMatTruoc: string;
    //   cccdMatSau: string;
    //   giayPhepKinhDoanh: string;
    //   status: string;
}

// Kiểu phản hồi API chung
export interface ApiResponse<T> {
    message: string;
    data: T;
}

// Kiểu file upload
export interface HostFiles {
    cccdMatTruoc?: any;
    cccdMatSau?: any;
    giayPhepKinhDoanh?: any;
}

/**
 * ✅ Tạo mới Host (có thể kèm upload file)
 */
export async function createHost(form: Partial<Host>, files: HostFiles): Promise<ApiResponse<Host>> {
    const formData = new FormData();

    // ⛔️ KHÔNG DÙNG CÁCH NÀY
    // formData.append("data", JSON.stringify(form));

    // ✅ GIẢI PHÁP: Gửi JSON dưới dạng Blob với đúng Content-Type
    // 1. Tạo một Blob từ chuỗi JSON và gán type
    formData.append("data", {
        uri: "data:application/json;base64," + btoa(JSON.stringify(form)),
        name: "data.json",
        type: "application/json",
    });

    // ✅ Gửi ảnh (Phần này giữ nguyên, đã đúng)
    if (files.cccdMatTruoc) {
        formData.append("cccdMatTruoc", {
            uri: files.cccdMatTruoc.uri,
            name: files.cccdMatTruoc.fileName || "cccdMatTruoc.jpg",
            type: files.cccdMatTruoc.mimeType || "image/jpeg",
        } as any);
    }

    if (files.cccdMatSau) {
        formData.append("cccdMatSau", {
            uri: files.cccdMatSau.uri,
            name: files.cccdMatSau.fileName || "cccdMatSau.jpg",
            type: files.cccdMatSau.mimeType || "image/jpeg",
        } as any);
    }

    if (files.giayPhepKinhDoanh) {
        formData.append("giayPhepKinhDoanh", {
            uri: files.giayPhepKinhDoanh.uri,
            name: files.giayPhepKinhDoanh.fileName || "giayPhepKinhDoanh.jpg",
            type: files.giayPhepKinhDoanh.mimeType || "image/jpeg",
        } as any);
    }


    // ✅ Gửi request (Giữ nguyên)
    const { data } = await axios.post(`${BaseUrl}/host/create`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return data;
}
/**
 * ✅ Lấy thông tin host theo userId
 */
export async function getHostByUser(userId: number): Promise<ApiResponse<Host> | null> {
    try {
        const { data } = await axios.get<ApiResponse<Host>>(`${BaseUrl}/host/${userId}/user`);
        console.log(`✅ Lấy host theo userId=${userId}:`, data);
        return data;
    } catch (error) {
        console.error(`❌ Lỗi khi lấy host theo userId=${userId}:`, error);
        return null;
    }
}

/**
 * ✅ Lấy danh sách host theo trạng thái (pending, approved, rejected)
 */
export async function getHostsByStatus(status: string): Promise<ApiResponse<Host[]> | null> {
    try {
        const { data } = await axios.get<ApiResponse<Host[]>>(`${BaseUrl}/host/status/${status}`);
        console.log(`✅ Lấy danh sách host theo trạng thái=${status}:`, data);
        return data;
    } catch (error) {
        console.error(`❌ Lỗi khi lấy host theo trạng thái=${status}:`, error);
        return null;
    }
}
