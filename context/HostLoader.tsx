import { useEffect } from 'react';
// (Giả sử bạn có AuthContext để lấy thông tin user đã đăng nhập)
import { useUser } from '@/context/UserContext'; // <<<--- SỬA 1: Đổi 'useAuth' thành 'useUser'
import { useHost } from '@/context/HostContext';
// (Đây là API call bị thiếu mà tôi thấy bạn đã comment)
import { getAllHotelsByUser } from '@/service/HotelAPI';

const HostIdLoader = () => {
    // Lấy user từ AuthContext (Giả sử)
    const { user } = useUser(); // <<<--- SỬA 2: Đổi 'useAuth' thành 'useUser'
    // Lấy hotelId và hàm setHotelId từ HostContext
    const { hotelId, setHotelId } = useHost();

    useEffect(() => {
        const fetchHotelId = async (userId) => {
            try {
                console.log(`Bắt đầu tìm hotelId cho user: ${userId}`);
                // 1. Gọi API để lấy khách sạn của user này
                // (Bạn cần bỏ comment import cho hàm này)
                const hotels = await getAllHotelsByUser(userId);

                // 2. Kiểm tra xem có khách sạn không
                if (hotels && hotels.length > 0) {
                    // Lấy ID của khách sạn đầu tiên (giả sử host chỉ có 1)
                    const firstHotelId = hotels[0].id;

                    // 3. BƯỚC QUAN TRỌNG NHẤT: Cập nhật Context
                    console.log(`✅ Đã tìm thấy hotelId: ${firstHotelId}. Đang cập nhật vào HostContext...`);
                    setHotelId(firstHotelId);

                } else {
                    console.warn(`⚠️ Host (userId: ${userId}) này không sở hữu khách sạn nào.`);
                    setHotelId(null); // Đặt là null nếu không tìm thấy
                }
            } catch (error) {
                console.error("❌ Lỗi nghiêm trọng khi đang fetch hotelId:", error);
                setHotelId(null); // Đặt là null nếu có lỗi
            }
        };

        // Chỉ chạy logic này khi:
        // 1. Đã có thông tin user
        // 2. User là ROLE_HOST
        // 3. hotelId trong context VẪN CÒN là null (nghĩa là chưa được fetch)
        if (user && user.role === 'ROLE_HOST' && hotelId === null) {
            fetchHotelId(user.id); // user.id là ID của người dùng đã đăng nhập
        }

    }, [user, hotelId, setHotelId]); // Chạy lại logic này khi user thay đổi

    return null; // Component này không render ra bất cứ thứ gì
};

export default HostIdLoader;