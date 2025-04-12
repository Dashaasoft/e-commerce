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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");

  const navigation = useNavigation();

  const handleRegister = async () => {
    // Keyboard-г хаах
    Keyboard.dismiss();

    if (name && email && phonenumber && password && password1) {
      if (password !== password1) {
        Alert.alert("Алдаа", "Нууц үг тохирохгүй байна.");
        return;
      }

      try {
        const response = await axios.post(
          "http://192.168.36.181:5000/user/register",
          {
            name: name,
            email: email,
            phonenumber: phonenumber,
            password: password,
            password1: password1,
          }
        );

        if (response.status === 200) {
          // Show the success alert and navigate automatically after a short delay
          Alert.alert("Амжилттай", "Та бүртгүүллээ.");
          setTimeout(() => {
            // Navigate directly to the Login screen after a short delay (e.g., 2 seconds)
            navigation.replace("Home");
          }, 2000); // 2 seconds delay (you can adjust this)
        }
      } catch (error) {
        if (error.response) {
          Alert.alert(
            "Алдаа",
            error.response.data.message || "Бүртгэлд алдаа гарлаа."
          );
        } else {
          Alert.alert("Алдаа", "Интернет холболт алдаатай байна.");
        }
      }
    } else {
      Alert.alert("Алдаа", "Бүх талбарыг бөглөнө үү.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Шинээр бүртгүүлэх</Text>
        <TextInput
          style={styles.input}
          placeholder="Хэрэглэгчийн нэр"
          value={name}
          onChangeText={setName}
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
          value={phonenumber}
          onChangeText={setPhonenumber}
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
          value={password1}
          onChangeText={setPassword1}
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
    backgroundColor: "#f7f7f7", // Light background color
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28, // Larger title
    fontWeight: "700",
    color: "#333", // Darker color for better contrast
    marginBottom: 30, // Add spacing between title and inputs
  },
  input: {
    width: "100%",
    height: 50, // Increase height for better touchability
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10, // More rounded corners for input fields
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff", // White background for inputs
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  button: {
    backgroundColor: "#007BFF", // Blue background for button
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
