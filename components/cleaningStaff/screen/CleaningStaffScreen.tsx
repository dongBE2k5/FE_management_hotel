// screens/HomeScreen.js
import HeaderProfile from '@/components/HeaderProfile';
import { getRoomByHotel } from '@/service/RoomAPI'; // Đảm bảo đường dẫn này đúng
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Xóa MOCK_TASKS vì không dùng nữa
import TaskCard from '../modal/TaskCard';

// ==================================================================
// CÁC HÀM XỬ LÝ DỮ LIỆU BẠN ĐÃ CUNG CẤP
// ==================================================================

const mapRoomStatusToTaskStatus = (roomStatus) => {
    switch (roomStatus) {
        case 'NEEDCLEANING':
            return 'todo';
        case 'REQUEST':
            return 'todo';
        case 'CLEANING':
            return 'in-progress';
        case 'AVAILABLE':
            return 'done';
        default:
            return 'todo'; // Mặc định
    }
};

const transformData = (rooms = []) => {
    // 1. Chỉ định các trạng thái được phép
    const allowedStatuses = ['NEEDCLEANING', 'AVAILABLE', 'REQUEST', 'CLEANING'];

    // 2. Lọc mảng
    const filteredRooms = rooms.filter(room => allowedStatuses.includes(room.status));

    // 3. Chuyển đổi mảng đã lọc
    return filteredRooms.map(room => {
        const taskStatus = mapRoomStatusToTaskStatus(room.status);
        
        // Ưu tiên: REQUEST nếu là 'REQUEST', ngược lại là 'NORMAL'
        const taskPriority = (room.status === 'REQUEST') ? 'REQUEST' : 'NORMAL';

        // CHỈ cho phép hành động khi 'Cần làm' hoặc 'Đang làm'
        const isActionable = (taskStatus === 'todo' || taskStatus === 'in-progress');

        let title = `Phòng ${room.roomNumber}`;
        if (room.status === 'CLEANING') {
            title = `Phòng ${room.roomNumber} (Đang dọn...)`;
        } else if (room.status === 'AVAILABLE') {
            title = `Phòng ${room.roomNumber} (Sẵn sàng)`;
        } else if (room.status === 'REQUEST') {
            title = `Phòng ${room.roomNumber} (Yêu cầu khẩn)`;
        }

        return {
            id: room.id.toString(),
            roomNumber: room.roomNumber,
            title: title,
            description: room.description, 
            status: taskStatus, 
            priority: taskPriority, 
            typeRoom: room.typeRoom, // Giả định API trả về
            actionable: isActionable, 
        };
    });
};


// ==================================================================
// CÁC COMPONENT GIAO DIỆN (Giữ nguyên)
// ==================================================================

// Component lọc
const TaskFilter = ({ activeFilter, onChange }) => {
    const filters = [
        { key: 'todo', label: 'Cần làm' },
        { key: 'in-progress', label: 'Đang làm' },
        { key: 'done', label: 'Hoàn thành' },
    ];

    return (
        <View style={styles.filterContainer}>
            {filters.map((filter) => (
                <TouchableOpacity
                    key={filter.key}
                    style={[
                        styles.filterButton,
                        activeFilter === filter.key && styles.filterButtonActive
                    ]}
                    onPress={() => onChange(filter.key)}
                >
                    <Text style={[
                        styles.filterText,
                        activeFilter === filter.key && styles.filterTextActive
                    ]}>
                        {filter.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

// Component thống kê (ĐÃ SỬA để nhận props)
const StatsCards = ({ stats = { todo: 0, incidents: 0, done: 0 } }) => (
    <View style={styles.statsContainer}>
        <View style={styles.statCard}>
            <Ionicons name="list-outline" size={24} color="#0062E0" />
            <Text style={styles.statNumber}>{stats.todo}</Text>
            <Text style={styles.statLabel}>Cần xử lý</Text>
        </View>
        <View style={styles.statCard}>
            <Ionicons name="alert-circle-outline" size={24} color="#E53E3E" />
            <Text style={styles.statNumber}>{stats.incidents}</Text>
            <Text style={styles.statLabel}>Sự cố</Text>
        </View>
        <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#38A169" />
            <Text style={styles.statNumber}>{stats.done}</Text>
            <Text style={styles.statLabel}>Đã dọn</Text>
        </View>
    </View>
);

// Component màn hình trống (Giữ nguyên)
const EmptyState = ({ message, title }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-done-circle-outline" size={60} color="#CBD5E0" />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
    </View>
);

// ==================================================================
// COMPONENT CHÍNH (ĐÃ SỬA)
// ==================================================================

export default function HomeScreen() {

    const navigation = useNavigation();
    
    // SỬA 1: Khởi tạo mảng rỗng và thêm state loading
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('todo'); 

    // SỬA 2: Lọc dữ liệu (Giữ nguyên)
    const filteredTasks = useMemo(() =>
        allTasks.filter(task => task.status === activeFilter),
        [allTasks, activeFilter]
    );

    // (NÂNG CẤP): Tính toán số liệu thống kê tự động
    const stats = useMemo(() => {
        const todo = allTasks.filter(t => t.status === 'todo').length;
        // Đếm các task là 'REQUEST' và chưa 'done'
        const incidents = allTasks.filter(t => t.priority === 'REQUEST' && t.status !== 'done').length;
        const done = allTasks.filter(t => t.status === 'done').length;
        return { todo, incidents, done };
    }, [allTasks]);


    // SỬA 3: Lấy dữ liệu từ API khi component mount
    useEffect(() => {
        const fetchRoomByHotel = async () => {
            try {
                setIsLoading(true);
                // 1. Gọi API
                const data = await getRoomByHotel(1); 
                
                // 2. Xử lý dữ liệu bằng hàm của bạn
                const transformedTasks = transformData(data);
                
                // 3. Cập nhật state
                setAllTasks(transformedTasks);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu phòng:", error);
                // Xử lý lỗi (ví dụ: hiển thị thông báo)
            } finally {
                setIsLoading(false);
            }
        }
    
        fetchRoomByHotel();
    }, []); // Chỉ chạy 1 lần khi mount

    // SỬA 4: Sửa logic `handleTaskAction`
    const handleTaskAction = (taskId, status, priority) => {
        const nextStatus = { 'todo': 'in-progress', 'in-progress': 'done' };

        if (nextStatus[status]) {
            // Cập nhật trạng thái local (Optimistic Update)
            setAllTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, status: nextStatus[status] } : task
                )
            );
            
            // TODO: Gọi API để cập nhật trạng thái trên server ở đây
            // Ví dụ: updateRoomStatus(taskId, nextStatus[status]);
        }
        
        // SỬA LỖI: Kiểm tra 'REQUEST' thay vì 'urgent'
        if (priority === "REQUEST") {
            navigation.navigate("CheckRoomScreen", { 
                taskId: taskId, 
                priority: priority, 
                status: status 
            });
        }
    };

    // Hiển thị loading
    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#0062E0" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <>
                        <HeaderProfile />
                        {/* (NÂNG CẤP): Truyền stats vào component */}
                        <StatsCards stats={stats} />

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={22} color="#A0AEC0" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm kiếm số phòng..."
                                placeholderTextColor="#A0AEC0"
                            />
                        </View>

                        <TaskFilter
                            activeFilter={activeFilter}
                            onChange={setActiveFilter}
                        />
                    </>
                }
                data={filteredTasks}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TaskCard 
                        task={item} 
                        onAction={() => handleTaskAction(item.id, item.status, item.priority)} 
                    />
                )}
                ListEmptyComponent={
                    <EmptyState title="Không có công việc" message="Bạn đã hoàn thành mọi thứ!" />
                }
                contentContainerStyle={{ paddingBottom: 20 }}
                style={styles.list}
            />
        </View>
    );
}

// ==================================================================
// STYLES (Thêm style 'center' cho loading)
// ==================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FA', 
    },
    // Style mới cho loading
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        backgroundColor: '#F5F8FA',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginTop: 20,
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
        elevation: 3,
        shadowColor: '#1A202C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A202C',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#718096',
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 20,
        marginTop: 20,
        paddingHorizontal: 15,
        elevation: 2,
        shadowColor: '#1A202C',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    searchInput: {
        flex: 1,
        height: 50,
        marginLeft: 10,
        fontSize: 16,
        color: '#1A202C',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 15,
        backgroundColor: '#EDF2F7',
        borderRadius: 10,
        padding: 4,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#FFFFFF',
        elevation: 1,
        shadowColor: '#1A202C',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#718096',
    },
    filterTextActive: {
        color: '#0062E0',
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        padding: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A5568',
        marginTop: 10,
    },
    emptyMessage: {
        fontSize: 16,
        color: '#A0AEC0',
        marginTop: 5,
        textAlign: 'center',
    },
});