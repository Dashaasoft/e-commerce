import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { UserContext } from "../context/UserContext";
import { useCart } from "../context/CartContext";
import axios from "axios";

const CheckoutInfoScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const { cartItems, calculateTotal, clearCart } = useCart();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phonenumber || "");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const districts = [
    "Баянзүрх",
    "Хан-Уул",
    "Баянгол",
    "Сүхбаатар",
    "Чингэлтэй",
    "Сонгино хайрхан",
  ];

  const neighborhoods = {
    Баянзүрх: Array.from({ length: 32 }, (_, i) => `${i + 1}-р хороо`),
    "Хан-Уул": Array.from({ length: 32 }, (_, i) => `${i + 1}-р хороо`),
    Баянгол: Array.from({ length: 32 }, (_, i) => `${i + 1}-р хороо`),
    Сүхбаатар: Array.from({ length: 32 }, (_, i) => `${i + 1}-р хороо`),
    Чингэлтэй: Array.from({ length: 32 }, (_, i) => `${i + 1}-р хороо`),
    "Сонгино хайрхан": Array.from({ length: 32 }, (_, i) => `${i + 1}-р хороо`),
  };

  const isFormValid = () => {
    return name && phone && district && neighborhood && address;
  };

  const handleCheckout = async () => {
    if (!isFormValid()) {
      Alert.alert("Анхаар", "Бүх шаардлагатай талбарыг бөглөнө үү");
      return;
    }

    try {
      setIsLoading(true);
      
      const orderData = {
        userId: user._id,
        items: cartItems.map(item => ({
          productId: item._id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          size: item.size || 'default',
          image: item.image.url
        })),
        totalAmount: Number(calculateTotal()),
        shippingInfo: {
          name: name,
          phone: phone,
          district: district,
          neighborhood: neighborhood,
          address: address,
          additionalInfo: additionalInfo
        }
      };

      // Navigate to PaymentScreen with order data
      navigation.navigate('Төлбөр төлөх', { orderData });
      
    } catch (error) {
      console.error('Error preparing order data:', error);
      Alert.alert("Алдаа", "Мэдээлэл бэлтгэхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.label}>Нэр</Text>
      <TextInput
        style={styles.input}
        placeholder="Нэрээ оруулна уу"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Утасны дугаар</Text>
      <TextInput
        style={styles.input}
        placeholder="Утасны дугаараа оруулна уу"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Дүүрэг сонгох</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={district}
          onValueChange={(itemValue) => {
            setDistrict(itemValue);
            setNeighborhood("");
          }}
          style={Platform.OS === "ios" ? styles.pickerIOS : styles.picker}
        >
          <Picker.Item label="Дүүрэг сонгох" value="" />
          {districts.map((item) => (
            <Picker.Item key={item} label={item} value={item} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Хороо сонгох</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={neighborhood}
          onValueChange={setNeighborhood}
          style={Platform.OS === "ios" ? styles.pickerIOS : styles.picker}
          enabled={!!district}
        >
          <Picker.Item label="Хороо сонгох" value="" />
          {district && neighborhoods[district].map((item) => (
            <Picker.Item key={item} label={item} value={item} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Хүргүүлэх хаяг</Text>
      <TextInput
        style={styles.input}
        placeholder="Хаягаа оруулна уу"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Нэмэлт мэдээлэл</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Нэмэлт мэдээлэл оруулна уу"
        value={additionalInfo}
        onChangeText={setAdditionalInfo}
        multiline
      />

      <TouchableOpacity
        style={[styles.checkoutButton, (!isFormValid() || isLoading) && styles.disabledButton]}
        onPress={handleCheckout}
        disabled={!isFormValid() || isLoading}
      >
        <Text style={styles.checkoutButtonText}>
          {isLoading ? "Түр хүлээнэ үү..." : "Үргэлжлүүлэх"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    backgroundColor: "#fff",
    height: 50,
  },
  pickerIOS: {
    width: "100%",
    backgroundColor: "#fff",
    height: 180,
  },
  checkoutButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CheckoutInfoScreen;
