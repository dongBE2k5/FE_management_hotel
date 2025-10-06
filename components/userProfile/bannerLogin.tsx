import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Pressable } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

type Props = {
  title: string;
  subtitle: string;
};

export default function LoginBanner({ title, subtitle }: Props) {
  const navigation = useNavigation();

  return (
    <>
      <ImageBackground
        source={require("../../assets/images/loginBanner.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </ImageBackground>

      {/* Icon mũi tên */}
      <View style={styles.arrowContainer}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={20} color="#009EDE" />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    top: "50%",
    transform: [{ translateY: 20 }],
  },
  subtitle: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
    top: "50%",
    transform: [{ translateY: 20 }],
  },
  arrowContainer: {
    alignItems: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
  },
});
