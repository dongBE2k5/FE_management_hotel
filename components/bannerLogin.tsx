import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function LoginBanner(props) {
  return (
    <>
      <ImageBackground
        source={require("../assets/images/loginBanner.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>{props.title}</Text>
          <Text style={styles.subtitle}>{props.subtitle}</Text>
        </View>
      </ImageBackground>

      {/* Icon mũi tên ở dưới banner */}
      <View style={styles.arrowContainer}>
       <AntDesign name="arrow-left" size={20} color="blue" />
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
    transform: [{ translateY: 20 }]
  },
  subtitle: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
    top: "50%",
    transform: [{ translateY: 20 }]
  },
  arrowContainer: {
    alignItems: "flex-start",
    marginTop: 10, // khoảng cách với banner
    paddingHorizontal:10,

  }
});
