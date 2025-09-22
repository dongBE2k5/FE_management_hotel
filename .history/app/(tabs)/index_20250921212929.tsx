import { Image } from 'expo-image';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';



export default function HomeScreen() {
   const handlePress = () => {
    console.log('Button pressed!');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.text}>Nhấn vào đây</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
