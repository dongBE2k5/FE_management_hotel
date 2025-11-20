// Updated RevenueDashboard.tsx with correct date handling and month/year range support
import { useHost } from '@/context/HostContext';
import { getAllBookingsByHotelId } from '@/service/BookingAPI';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const formatDate = (d: Date) => d.toLocaleDateString('en-CA'); // YYYY-MM-DD

const RevenueDashboard: React.FC = () => {
  const [activeRange, setActiveRange] = useState<'7days' | 'month'>('7days');
  const { hotelId } = useHost();
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);

  if (!hotelId) return <Text>Không tìm thấy khách sạn</Text>;

  useEffect(() => {
    const getBookings = async () => {
      const res = await getAllBookingsByHotelId(hotelId);
      if (res) setBookings(res.filter((b: BookingResponse) => b.status === 'DA_THANH_TOAN'));
    };
    getBookings();
  }, []);
  

  const parsed = useMemo(() => {
    const total = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);

    const byDay: Record<string, number> = {};
    const byMonth: Record<string, number> = {};
    const rooms: Record<string, number> = {};

    bookings.forEach((b) => {
      const dayKey = b.checkInDate.split('T')[0];
      const monthKey = dayKey.slice(0, 7);

      byDay[dayKey] = (byDay[dayKey] || 0) + (b.totalPrice || 0);
      byMonth[monthKey] = (byMonth[monthKey] || 0) + (b.totalPrice || 0);
      rooms[b.room.id] = (rooms[b.room.id] || 0) + (b.totalPrice || 0);
    });
    const topRooms = Object.entries(rooms)
      .map(([room, rev]) => ({ room, rev }))
      .sort((a, b) => b.rev - a.rev)
      .slice(0, 5);

    return { total, byDay, byMonth, topRooms };
  }, [bookings]);

  const chartData7Days = useMemo(() => {
    const labels: string[] = [];
    const points: number[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = formatDate(d);

      labels.push(key.slice(5));
      points.push(parsed.byDay[key] ?? 0);
    }

    return { labels, points };
  }, [parsed.byDay]);

  const chartDataByMonth = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1–12
  
    const labels: string[] = [];
    const points: number[] = [];
  
    for (let m = 1; m <= 12; m++) {
      const key = `${currentYear}-${String(m).padStart(2, "0")}`;
      labels.push(String(m).padStart(2, "0"));
      points.push(parsed.byMonth[key] ?? 0);
    }
  
    return { labels, points };
  }, [parsed.byMonth, activeRange]);
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (o = 1) => `rgba(59,130,246,${o})`,
    labelColor: () => '#555',
    style: { borderRadius: 16 },
  };
  useEffect(() => {
    if (activeRange === '7days') {
      setTotal(chartData7Days.points.reduce((a, b) => a + b, 0));
    } else if (activeRange === 'month') {
      setTotal(chartDataByMonth.points.reduce((a, b) => a + b, 0));
    }
  }, [activeRange, chartData7Days.points, chartDataByMonth.points]);

  const formatCurrency = (n: number) => n.toLocaleString('vi-VN') + ' đ';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.header}>📊 Báo cáo doanh thu khách sạn</Text>

      <View style={styles.row}>
        <View style={styles.card}>
          <Ionicons name="cash-outline" size={28} color="#3b82f6" />
          <Text style={styles.cardLabel}>Tổng doanh thu</Text>
          <Text style={styles.cardValue}>{formatCurrency(total)}</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="calendar-outline" size={28} color="#10b981" />
          <Text style={styles.cardLabel}>Khoảng thời gian</Text>
          <Text style={styles.cardValue}>
            {activeRange === '7days' ? '7 ngày' : activeRange === 'month' ? 'Theo tháng' : ''}
          </Text>
        </View>
      </View>

      {/* Range Selector */}
      <View style={styles.rangePicker}>
        <TouchableOpacity
          onPress={() => setActiveRange('7days')}
          style={[styles.rangeButton, activeRange === '7days' && styles.activeRange]}
        >
          <Text style={activeRange === '7days' ? styles.rangeTextActive : styles.rangeText}>7 ngày</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveRange('month')}
          style={[styles.rangeButton, activeRange === 'month' && styles.activeRange]}
        >
          <Text style={activeRange === 'month' ? styles.rangeTextActive : styles.rangeText}>Tháng</Text>
        </TouchableOpacity>
      </View>

      {/* 7 Days Chart */}
      {activeRange === '7days' && (
        <LineChart
          data={{ labels: chartData7Days.labels, datasets: [{ data: chartData7Days.points }] }}
          width={width - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      )}

      {/* Month Chart */}
      {activeRange === 'month' && (
        <LineChart
          data={{ labels: chartDataByMonth.labels, datasets: [{ data: chartDataByMonth.points }] }}
          width={width - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      )}

      <Text style={styles.sectionTitle}>🏆 Top phòng theo doanh thu</Text>
      <FlatList
        data={parsed.topRooms}
        scrollEnabled={false}
        keyExtractor={(i) => i.room}
        renderItem={({ item, index }) => (
          <View style={styles.topRow}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.room}>Phòng {item.room}</Text>
            <Text style={styles.money}>{formatCurrency(item.rev)}</Text>
          </View>
        )}
      />

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

export default RevenueDashboard;

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7fb' },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginRight: 10,
    elevation: 3,
    alignItems: 'flex-start',
  },
  cardLabel: { marginTop: 8, color: '#666' },
  cardValue: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  rangePicker: { flexDirection: 'row', marginVertical: 16 },
  rangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginRight: 10,
  },
  activeRange: { backgroundColor: '#3b82f6' },
  rangeText: { color: '#333' },
  rangeTextActive: { color: '#fff', fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  chart: { borderRadius: 16, marginBottom: 20 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
  },
  rank: { fontWeight: '700', width: 24 },
  room: { flex: 1 },
  money: { fontWeight: '700', color: '#2563eb' },
});
