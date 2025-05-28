import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { API_URL } from "../config";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Send code, 2: Verify code, 3: Reset password
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert("Алдаа", "И-мэйл хаягаа оруулна уу.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Алдаа", "Зөв и-мэйл хаяг оруулна уу.");
      return;
    }

    try {
      setLoading(true);
      console.log(
        "Sending request to:",
        `${API_URL}/api/users/forgot-password`
      );
      console.log("Request data:", { email });

      const response = await axios.post(
        `${API_URL}/api/users/forgot-password`,
        {
          email,
        }
      );

      console.log("Response:", response.data);

      if (response.data.success) {
        Alert.alert("Амжилттай", response.data.message);
        setStep(2);
      }
    } catch (error) {
      console.error("Error details:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        Alert.alert(
          "Алдаа",
          error.response.data.message || "Сервертэй холбогдоход алдаа гарлаа"
        );
      } else if (error.request) {
        console.error("Error request:", error.request);
        Alert.alert(
          "Алдаа",
          "Сервертэй холбогдох боломжгүй байна. Интернэт холболтоо шалгана уу."
        );
      } else {
        Alert.alert("Алдаа", "Алдаа гарлаа. Дахин оролдоно уу.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert("Алдаа", "Баталгаажуулах кодыг оруулна уу.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/users/verify-reset-code`,
        {
          email,
          code,
        }
      );

      if (response.data.success) {
        Alert.alert("Амжилттай", response.data.message);
        setStep(3);
      }
    } catch (error) {
      if (error.response) {
        Alert.alert(
          "Алдаа",
          error.response.data.message || "Сервертэй холбогдоход алдаа гарлаа"
        );
      } else if (error.request) {
        Alert.alert(
          "Алдаа",
          "Сервертэй холбогдох боломжгүй байна. Интернэт холболтоо шалгана уу."
        );
      } else {
        Alert.alert("Алдаа", "Алдаа гарлаа. Дахин оролдоно уу.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert("Алдаа", "Шинэ нууц үгээ оруулна уу.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Алдаа", "Нууц үгнүүд таарахгүй байна.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/users/reset-password`, {
        email,
        code,
        newPassword,
      });

      if (response.data.success) {
        Alert.alert("Амжилттай", response.data.message, [
          {
            text: "OK",
            onPress: () => {
              // Navigate to MainContainer with ProfileTab as the screen parameter
              navigation.navigate("MainContainer", { screen: "ProfileTab" });
            },
          },
        ]);
      }
    } catch (error) {
      if (error.response) {
        Alert.alert(
          "Алдаа",
          error.response.data.message || "Сервертэй холбогдоход алдаа гарлаа"
        );
      } else if (error.request) {
        Alert.alert(
          "Алдаа",
          "Сервертэй холбогдох боломжгүй байна. Интернэт холболтоо шалгана уу."
        );
      } else {
        Alert.alert("Алдаа", "Алдаа гарлаа. Дахин оролдоно уу.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.title}>Нууц үг сэргээх</Text>
      <Text style={styles.subtitle}>И-мэйл хаягаа оруулна уу</Text>

      <TextInput
        style={styles.input}
        placeholder="И-мэйл хаяг"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSendCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Код илгээх</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.title}>Код баталгаажуулах</Text>
      <Text style={styles.subtitle}>Илгээсэн кодыг оруулна уу</Text>

      <TextInput
        style={styles.input}
        placeholder="Баталгаажуулах код"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerifyCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Баталгаажуулах</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.title}>Шинэ нууц үг</Text>
      <Text style={styles.subtitle}>Шинэ нууц үгээ оруулна уу</Text>

      <TextInput
        style={styles.input}
        placeholder="Шинэ нууц үг"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Нууц үг давтах"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Нууц үг солих</Text>
        )}
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#6a11cb",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
