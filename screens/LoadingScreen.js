// screens/LoadingScreen.js
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "@react-navigation/native";

const LOTTIE_URL = "https://cdn.lottielab.com/l/2ZFBNJT14934FA.json";

const LoadingScreen = () => {
  const [animationPath, setAnimationPath] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const localPath = `${FileSystem.cacheDirectory}loading.json`;

        const download = await FileSystem.downloadAsync(LOTTIE_URL, localPath);
        setAnimationPath(download.uri);

        setTimeout(() => {
          navigation.replace("Home"); // эсвэл ProductList гэх мэт
        }, 3000);
      } catch (err) {
        console.error("⚠️ Animation татаж чадсангүй:", err);
      }
    };

    loadAnimation();
  }, []);

  if (!animationPath) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LottieView
        source={{ uri: animationPath }}
        autoPlay
        loop
        style={{ width: 250, height: 250 }}
      />
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
