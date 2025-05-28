import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from "react-native";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { UserContext } from "../context/UserContext";

const PaymentScreen = ({ navigation, route }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { cartItems, calculateTotal, clearCart } = useCart();
  const { user } = useContext(UserContext);

  const { orderData } = route.params || {};

  const paymentOptions = [
    {
      id: 1,
      name: "QPay",
      icon: require("../assets/qpay.jpeg"),
      description: "Төлбөрөө QPay хэтэвчээ ашиглан төлөх сонголт",
    },
    {
      id: 2,
      name: "HiPay",
      icon: require("../assets/hipay.png"),
      description: "Төлбөрөө HiPay хэтэвчээ ашиглан төлөх сонголт",
    },
    {
      id: 3,
      name: "Зээлээр авах",
      icon: require("../assets/zeel.png"),
      description: "Зээлийн эрх үүсэх боломжтой тохиолдолд",
    },
    {
      id: 4,
      name: "Дансаар шилжүүлэх",
      icon: require("../assets/bank.png"),
      description: "Дансаар ашиглан шилжүүлэг хийх",
    },
  ];

  const handlePaymentOptionPress = (option) => {
    setSelectedOption(option);
  };

  // Get payment method icon based on the payment method
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "QPay":
        return require("../assets/qpay.jpeg");
      case "HiPay":
        return require("../assets/hipay.png");
      case "Зээлээр авах":
        return require("../assets/zeel.png");
      case "Дансаар шилжүүлэх":
        return require("../assets/bank.png");
      default:
        return null;
    }
  };

  const handlePayment = async () => {
    if (!selectedOption) {
      Alert.alert("Анхаар", "Төлбөрийн сонголтоо сонгоно уу!");
      return;
    }

    setIsLoading(true);

    try {
      // Захиалгын мэдээллийг бэлтгэх
      const finalOrderData = {
        ...orderData,
        paymentMethod: selectedOption.name,
        paymentStatus: "pending",
        orderStatus: "pending",
      };

      // Ensure payment method is included
      if (!finalOrderData.paymentMethod) {
        finalOrderData.paymentMethod = selectedOption.name;
      }

      // Double-check payment method
      console.log("Selected payment option:", selectedOption);
      console.log("Selected payment method name:", selectedOption.name);
      finalOrderData.paymentMethod = selectedOption.name;

      console.log("Sending order data:", finalOrderData); // Debug log
      console.log("Payment method selected:", selectedOption.name); // Additional log for payment method
      console.log(
        "Final payment method in order data:",
        finalOrderData.paymentMethod
      ); // Additional log for payment method

      // Захиалгын мэдээллийг өгөгдлийн санд хадгалах
      const response = await axios.post(
        "http://10.150.35.107:5000/api/orders",
        finalOrderData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Order creation response:", response.data); // Debug log
      console.log(
        "Payment method in response:",
        response.data.data?.paymentMethod
      ); // Check if payment method is in response
      console.log(
        "Full response data:",
        JSON.stringify(response.data, null, 2)
      ); // Log full response data

      if (response.data.success) {
        // Сагсыг цэвэрлэх
        clearCart();

        // Төлбөрийн сонголтод тохирсон үйлдэл хийх
        if (selectedOption.name === "Дансаар шилжүүлэх") {
          const url = "https://e.khanbank.com/auth/login";
          try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
              await Linking.openURL(url);
              Alert.alert(
                "Амжилттай",
                `Таны захиалга амжилттай хийгдлээ. Захиалгын дугаар: ${response.data.data._id}`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      navigation.getParent()?.navigate("Home");
                    },
                  },
                ]
              );
            } else {
              Alert.alert(
                "Алдаа",
                "Khan Bank апп суулгаагүй байна. Та апп-ыг суулгана уу."
              );
            }
          } catch (error) {
            console.error(
              "Khan Bank апп руу нэвтрүүлэхэд алдаа гарлаа:",
              error
            );
          }
        } else {
          Alert.alert(
            "Амжилттай",
            `Таны захиалга амжилттай хийгдлээ. Захиалгын дугаар: ${response.data.data._id}`,
            [
              {
                text: "OK",
                onPress: () => {
                  navigation.getParent()?.navigate("Home");
                },
              },
            ]
          );
        }
      } else {
        throw new Error(
          response.data.message || "Захиалга үүсгэхэд алдаа гарлаа"
        );
      }
    } catch (error) {
      console.error("Төлбөр төлөхөд алдаа гарлаа:", error);
      let errorMessage = "Төлбөр төлөхөд алдаа гарлаа. Дахин оролдоно уу.";

      if (error.response) {
        // Backend-ээс ирсэн алдааны мессеж
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // Request хийгдсэн боловч хариу ирээгүй
        errorMessage =
          "Сервертэй холбогдох боломжгүй байна. Интернэт холболтоо шалгана уу.";
      }

      Alert.alert("Алдаа", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Төлбөр төлөх</Text>
      {paymentOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.optionContainer,
            selectedOption?.id === option.id && styles.selectedOption,
          ]}
          onPress={() => handlePaymentOptionPress(option)}
          disabled={isLoading}
        >
          <Image source={option.icon} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={styles.optionName}>{option.name}</Text>
            <Text style={styles.optionDescription}>{option.description}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {selectedOption && (
        <View style={styles.selectedPaymentContainer}>
          <Text style={styles.selectedPaymentTitle}>
            Сонгосон төлбөрийн арга:
          </Text>
          <View style={styles.selectedPaymentDetails}>
            <Image
              source={getPaymentMethodIcon(selectedOption.name)}
              style={styles.selectedPaymentIcon}
            />
            <View style={styles.selectedPaymentTextContainer}>
              <Text style={styles.selectedPaymentName}>
                {selectedOption.name}
              </Text>
              <Text style={styles.selectedPaymentDescription}>
                {selectedOption.description}
              </Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.paymentButton,
          (!selectedOption || isLoading) && styles.disabledButton,
        ]}
        onPress={handlePayment}
        disabled={!selectedOption || isLoading}
      >
        <Text style={styles.paymentButtonText}>
          {isLoading ? "Түр хүлээнэ үү..." : "Захиалах"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedOption: {
    borderColor: "#28a745",
    backgroundColor: "#e8f5e9",
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  optionName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
  },
  paymentButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 0,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  paymentButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedPaymentContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f0f8ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#b0e0e6",
  },
  selectedPaymentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4169e1",
  },
  selectedPaymentDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedPaymentIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 5,
  },
  selectedPaymentTextContainer: {
    flex: 1,
  },
  selectedPaymentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  selectedPaymentDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});

export default PaymentScreen;
