import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

// API-ийн үндсэн хаяг
const API_BASE_URL = "http://10.150.35.107:5000/api";

export default function RegisterScreen() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigation = useNavigation();

  const handleRegister = async () => {
    Keyboard.dismiss();

    if (!userName || !email || !phoneNumber || !password || !confirmPassword) {
      Alert.alert("Алдаа", "Бүх талбарыг бөглөнө үү.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Алдаа", "Нууц үг тохирохгүй байна.");
      return;
    }

    try {
      console.log("Бүртгэл хийх мэдээлэл:", {
        userName,
        email,
        phoneNumber,
        password,
      });

      const response = await axios.post(`${API_BASE_URL}/users/register`, {
        userName,
        email,
        phoneNumber,
        password,
      });

      console.log("Серверийн хариу:", response.data);

      if (response.data) {
        const { _id, userName, email, phoneNumber, role } = response.data;
        Alert.alert(
          "Амжилттай",
          `Бүртгэл амжилттай боллоо!\n\nХэрэглэгчийн мэдээлэл:\nID: ${_id}\nНэр: ${userName}\nИ-мэйл: ${email}\nУтас: ${phoneNumber}\nЭрх: ${role}`
        );
        setTimeout(() => {
          navigation.replace("Home");
        }, 2000);
      }
    } catch (error) {
      console.error("Бүртгэлийн алдаа:", error);

      if (error.response) {
        // Серверийн алдааны мэдээлэл
        console.error("Серверийн алдааны мэдээлэл:", error.response.data);
        Alert.alert(
          "Алдаа",
          error.response.data.message || "Бүртгэлд алдаа гарлаа."
        );
      } else if (error.request) {
        // Сүлжээний алдаа
        console.error("Сүлжээний алдаа:", error.request);
        Alert.alert(
          "Сүлжээний алдаа",
          "Сервертэй холбогдоход алдаа гарлаа. Та сүлжээгээ шалгана уу."
        );
      } else {
        // Бусад алдаа
        console.error("Алдааны мэдээлэл:", error.message);
        Alert.alert("Алдаа", "Бүртгэл хийхэд алдаа гарлаа. Дахин оролдоно уу.");
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Шинээр бүртгүүлэх</Text>
        <TextInput
          style={styles.input}
          placeholder="Хэрэглэгчийн нэр"
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="И-мэйл"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Утасны дугаар"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Нууц үг"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Нууц үгээ давтана уу"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Бүртгүүлэх</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  button: {
    backgroundColor: "#6a11cb",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
