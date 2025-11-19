import React, { useEffect, useState } from 'react';
import { FlatList, NativeEventEmitter, NativeModules, StyleSheet, Text, View } from 'react-native';

const { SettingsModule, NotificationModule, LoggerModule, AppInfoModule } = NativeModules;

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function logStart() {
      const packageName = await AppInfoModule.getPackageName();
     console.log(LoggerModule.logDebug(packageName, '🚀 App đã khởi động!'));
    }
    // ✅ Log chỉ khi app khởi động
    try {
      LoggerModule.logDebug('MyApp', '🚀 App đã khởi động!');
      LoggerModule.logInfo('MyApp', '🟢 Đang chạy bình thường');
    } catch (e) {
      console.warn('LoggerModule chưa sẵn sàng', e);
    }

    const timer = setTimeout(() => {
      NotificationModule.getActiveNotifications()
        .then((data) => {
          if (Array.isArray(data)) {
            const vcbNotification = data.filter(
              (n) => n.package === 'com.VCB' || n.package === 'com.vnpay.bidv'
            );
            console.log('🏦 VCB Notifications:', vcbNotification);
            setNotifications(vcbNotification);
          } else {
            console.warn('⚠️ Không phải mảng:', data);
          }
        })
        .catch((err) => console.error('❌ Error:', err));

      try {
        const eventEmitter = new NativeEventEmitter(NotificationModule);
        const sub = eventEmitter.addListener('notificationReceived', (data) => {
          setNotifications((prev) => [data, ...prev]);
        });
        return () => sub.remove();
      } catch (e) {
        console.error('🚨 NativeEventEmitter lỗi:', e);
      }
    }, 1500);
    logStart()
    return () => clearTimeout(timer);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.package}>{item.package}</Text>
      <Text style={styles.title}>{item.title || '(Không có tiêu đề)'}</Text>
      <Text style={styles.text}>{item.text || '(Không có nội dung)'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📲 Danh sách thông báo VCB & BIDV</Text>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.empty}>Không có thông báo nào hiển thị.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  package: {
    color: '#5aa9e6',
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    marginTop: 4,
  },
  text: {
    color: '#ccc',
    marginTop: 2,
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});
