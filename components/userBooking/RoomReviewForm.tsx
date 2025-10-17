import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { createRate, getRateByUserAndRoom } from '@/service/RateAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RoomReviewFormProps {
    roomId: number;
    hotelName?: string;
}

export default function RoomReviewForm({ roomId, hotelName }: RoomReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasRated, setHasRated] = useState(false);
    const [userRate, setUserRate] = useState<any>(null);

    const [showCommentModal, setShowCommentModal] = useState(false);
    const [tempComment, setTempComment] = useState(''); // nhập trong modal

    const tags = ['Phòng sạch', 'Nội thất đẹp', 'Dịch vụ tốt', 'Nhân viên thân thiện'];

    useEffect(() => {
        const fetchUserRate = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) return;

                const res = await getRateByUserAndRoom(Number(userId), roomId);
                if (res && res.id) {
                    setHasRated(true);
                    setUserRate(res);
                    setRating(res.rateNumber);
                    setSelectedTags(res.likedPoints || []);
                    setComment(res.comment || '');
                } else {
                    setHasRated(false);
                }
            } catch (error) {
                console.error('Error fetching rate:', error);
            }
        };
        fetchUserRate();
    }, [roomId]);

    const toggleTag = (tag: string) => {
        if (hasRated) return;
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá!');
            return;
        }

        try {
            setLoading(true);
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập trước khi đánh giá.');
                return;
            }

            const rateData = {
                rateNumber: rating,
                likedPoints: selectedTags,
                comment,
                user: { id: Number(userId) },
                room: { id: roomId },
            };

            await createRate(rateData);
            Alert.alert('Thành công', 'Cảm ơn bạn đã đánh giá phòng này!');
            setHasRated(true);
        } catch (error) {
            console.error('Error creating rate:', error);
            Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <ScrollView
                style={styles.container}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <Text style={styles.header}>{hotelName}</Text>
                <Text style={styles.subHeader}>
                    {hasRated
                        ? 'Đánh giá của bạn'
                        : 'Hãy chia sẻ trải nghiệm của bạn về phòng này'}
                </Text>

                {/* ⭐ Rating */}
                <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <TouchableOpacity
                            key={i}
                            disabled={hasRated}
                            onPress={() => !hasRated && setRating(i)}
                        >
                            <Ionicons
                                name={i <= rating ? 'star' : 'star-outline'}
                                size={32}
                                color={i <= rating ? '#FFD700' : '#ccc'}
                                style={{ marginHorizontal: 4 }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 💬 Tags */}
                <Text style={styles.sectionTitle}>Những điều bạn thích nhất</Text>
                <View style={styles.tagsContainer}>
                    {tags.map(tag => (
                        <TouchableOpacity
                            key={tag}
                            disabled={hasRated}
                            style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
                            onPress={() => toggleTag(tag)}
                        >
                            <Text
                                style={[
                                    styles.tagText,
                                    selectedTags.includes(tag) && styles.tagTextSelected,
                                ]}
                            >
                                {tag}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ✏️ Comment */}
                <Text style={styles.sectionTitle}>Cảm nhận của bạn</Text>
                <TouchableOpacity
                    disabled={hasRated}
                    onPress={() => {
                        if (!hasRated) {
                            setTempComment(comment);
                            setShowCommentModal(true);
                        }
                    }}
                >
                    <View style={[styles.textArea, hasRated && { backgroundColor: '#f7f7f7' }]}>
                        <Text style={{ color: comment ? '#333' : '#999' }}>
                            {comment || 'Nhấn để nhập cảm nhận của bạn...'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* 🔘 Submit */}
                {!hasRated && (
                    <TouchableOpacity
                        style={[styles.submitButton, loading && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitText}>
                            {loading ? 'Đang gửi...' : 'GỬI ĐÁNH GIÁ'}
                        </Text>
                    </TouchableOpacity>
                )}

                {hasRated && (
                    <View style={styles.infoBox}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={{ color: '#4CAF50', marginLeft: 6 }}>
                            Bạn đã đánh giá phòng này
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* 📝 Modal nhập comment */}
            <Modal visible={showCommentModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Nhập cảm nhận của bạn</Text>
                        <TextInput
                            style={styles.modalInput}
                            multiline
                            value={tempComment}
                            onChangeText={setTempComment}
                            placeholder="Ví dụ: Phòng đẹp, view biển, nhân viên nhiệt tình..."
                            textAlignVertical="top"
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                                <Text style={styles.cancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setComment(tempComment.trim());
                                    setShowCommentModal(false);
                                }}
                            >
                                <Text style={styles.saveText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff', padding: 16 },
    header: { fontSize: 20, fontWeight: '700', color: '#333' },
    subHeader: { color: '#777', marginTop: 4, marginBottom: 16 },
    starContainer: { flexDirection: 'row', marginVertical: 10 },
    sectionTitle: { fontWeight: '600', color: '#333', marginTop: 20, marginBottom: 10 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: {
        borderColor: '#73c5fcff',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        margin: 4,
    },
    tagSelected: { backgroundColor: '#73c5fcff' },
    tagText: { color: '#73c5fcff', fontSize: 13 },
    tagTextSelected: { color: '#fff' },
    textArea: {
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#73c5fcff',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitText: { color: '#fff', fontWeight: '700' },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        backgroundColor: '#E8F5E9',
        padding: 10,
        borderRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '100%',
    },
    modalTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        height: 120,
        padding: 10,
        color: '#333',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
    },
    cancelText: { color: '#999', marginRight: 20, fontSize: 15 },
    saveText: { color: '#73c5fcff', fontWeight: '600', fontSize: 15 },
});
