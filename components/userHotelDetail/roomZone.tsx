import { urlImage } from '@/constants/BaseURL';
import RoomTypeImage from '@/models/RoomTypeImage';
import { TypeOfRoomUtility } from '@/models/TypeOfRoomUtility/TypeOfRoomUtilityResponse';
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

interface RoomZoneProps {
    utilityOfTypeRoom: TypeOfRoomUtility[];
    roomTypeImage: RoomTypeImage[];
}
export default function RoomZone({ utilityOfTypeRoom, roomTypeImage }: RoomZoneProps) {
    console.log("utilityOfTypeRoom: ", utilityOfTypeRoom);
    if (utilityOfTypeRoom.length > 0) {
        console.log("utilityOfTypeRoomImage: ", urlImage + utilityOfTypeRoom[0].imageUrl
        );
    }
    console.log("roomTypeImage: " + roomTypeImage);

    return (
        <View style={{ backgroundColor: '#EFEFEF', borderRadius: 15, width: '100%', height: 400 }}>
            <Text style={{ color: '#275DE5', fontWeight: 'bold', margin: 10, fontSize: 20, marginLeft: 10 }}>Phòng có sẵn</Text>
            <View style={{ flexDirection: 'row', backgroundColor: 'white', width: '100%', padding: 10 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}

                >
                    <Text style={{ color: '#009EDE', fontWeight: 'bold', backgroundColor: '#F2F2F2', padding: 10, borderRadius: 10, marginRight: 10 }}>Miễn phí hủy phòng</Text>
                    <Text style={{ color: '#009EDE', fontWeight: 'bold', backgroundColor: '#F2F2F2', padding: 10, borderRadius: 10, marginRight: 10 }}>Miễn phí bữa sáng</Text>

                </ScrollView>
            </View>

            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ height: 150 }}    // ✨ thêm chiều cao bằng đúng chiều cao ảnh
                    contentContainerStyle={{ alignItems: 'center' }} // căn giữa nếu muốn
                >
                    {roomTypeImage.map((image) => (
                        <Image key={image.id} style={{ width: 300, height: 150, marginRight: 10 }} source={{ uri: urlImage + image.image }} />
                    ))}

                </ScrollView>

                <Text style={{ marginTop: 15, marginLeft: 15, color: 'black', fontSize: 15, fontWeight: 'bold' }}>Tiện ích phòng</Text>
            </View>
            <View style={{ backgroundColor: 'white', width: '100%', padding: 20, marginTop: 10 }}>
                <View style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    {utilityOfTypeRoom?.map((utility) => (
                        <View key={utility.id} style={{ flexDirection: 'row', marginRight: 15, marginBottom: 10, width: '33%' }}>
                            <Image style={{ width: 20, height: 20, marginRight: 5, }} source={{ uri: urlImage + utility.imageUrl }} />
                            <Text style={{ fontWeight: 'bold', fontSize: 12, display: 'flex', alignItems: 'center' }}>{utility.utilityName}</Text>
                        </View>
                    ))} 
                    {/* <View style={{ flexDirection: 'row', marginRight: 15 }}>
                        <Ionicons style={{ marginRight: 5 }} name="expand" size={15} color="black" />
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>20.0m2</Text>
                    </View> */}
                    {/* <View style={{ flexDirection: 'row', marginRight: 15 }}>
                        <Ionicons style={{ marginRight: 5 }} name="bed" size={15} color="black" />
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>1 giường cỡ queen</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginRight: 15 }}>
                        <Ionicons style={{ marginRight: 5 }} name="wifi" size={15} color="black" />
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Có wifi</Text>
                    </View> */}

                </View>
            </View>


        </View>
        
        
    );
}

const styles = StyleSheet.create({

});
