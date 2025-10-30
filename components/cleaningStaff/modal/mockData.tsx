// data/mockData.js

export const MOCK_TASKS = [
  // Công việc cần làm
  { 
    id: '1', 
    roomNumber: '205', 
    title: 'Kiểm tra check-out', 
    subtitle: 'Yêu cầu khẩn cấp', 
    priority: 'urgent', // 'urgent' -> màu đỏ
    status: 'todo' 
  },
  { 
    id: '2', 
    roomNumber: '301', 
    title: 'Bảo trì', 
    subtitle: 'Dọn dẹp định kỳ', 
    priority: 'maintenance', // 'maintenance' -> màu xanh dương
    status: 'todo' 
  },
  
  // Công việc đang làm
  { 
    id: '3', 
    roomNumber: '102', 
    title: 'Dọn dẹp gấp', 
    subtitle: 'Yêu cầu khẩn cấp', 
    priority: 'urgent', 
    status: 'in-progress' 
  },
  { 
    id: '4', 
    roomNumber: '505', 
    title: 'Bảo trì', 
    subtitle: 'Dọn dẹp định kỳ', 
    priority: 'maintenance', 
    status: 'in-progress' 
  },

  // Công việc đã hoàn thành
  { 
    id: '5', 
    roomNumber: '404', 
    title: 'Dọn dẹp gấp', 
    subtitle: 'Yêu cầu khẩn cấp', 
    priority: 'urgent', 
    status: 'done' 
  },
  { 
    id: '6', 
    roomNumber: '101', 
    title: 'Bảo trì', 
    subtitle: 'Dọn dẹp định kỳ', 
    priority: 'maintenance', 
    status: 'done' 
  },
];