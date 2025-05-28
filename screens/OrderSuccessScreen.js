import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "./Header";

const OrderSuccessScreen = ({ navigation, route }) => {
  const { orderId } = route.params;

  return (
    <View style={styles.container}>
      <Header
        navigation={navigation}
        showBanner={false}
        showFilterButton={false}
        showSearchButton={false}
        showCategoryButton={false}
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Icon name="checkmark-circle" size={80} color="#28a745" />
        </View>
        
        <Text style={styles.title}>Захиалга амжилттай бүртгэгдлээ!</Text>
        <Text style={styles.orderId}>Захиалгын дугаар: {orderId}</Text>
        
        <Text style={styles.message}>
          Таны захиалга амжилттай бүртгэгдлээ. Захиалгын төлөв, хүргэлтийн мэдээллийг "Миний захиалгууд" хэсгээс хянах боломжтой.
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Orders")}
          >
            <Text style={styles.buttonText}>Захиалгууд харах</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.homeButton]}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buttonText}>Нүүр хуудас руу буцах</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  orderId: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    backgroundColor: "#020904",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  homeButton: {
    backgroundColor: "#28a745",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OrderSuccessScreen; 