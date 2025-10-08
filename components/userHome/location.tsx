import type LocationModel from "@/models/Location";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  locations: LocationModel[];
  changeLocation: (id: number) => void;
};

export default function LocationSelector({ locations, changeLocation }: Props) {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

  useEffect(() => {
    if (locations.length > 0 && selectedLocation === null) {
      const firstId = locations[0].id;
      setSelectedLocation(firstId);
      changeLocation(firstId);
    }
  }, [locations]);

  return (
    <View style={{ flexDirection: "row", padding: 10 }}>
      {locations.map((location) => (
        <TouchableOpacity
          key={location.id}
          onPress={() => {
            setSelectedLocation(location.id);
            changeLocation(location.id);
          }}
          style={[
            styles.locationButton,
            selectedLocation === location.id && styles.activeButton,
          ]}
        >
          <Text
            style={[
              styles.locationText,
              selectedLocation === location.id && styles.activeText,
            ]}
          >
            {location.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}


const styles = StyleSheet.create({
    locationButton: {
        borderRadius: 5,
        padding: 8,
        marginRight: 5,
        backgroundColor: 'transparent', // không màu nếu không active
    },
    activeButton: {
        backgroundColor: '#73c5fc', // màu khi active
    },
    locationText: {
        fontSize: 12,
        color: '#0F4DEB',
        fontWeight: 'bold',
    },
    activeText: {
        color: '#fff',
    },
});
