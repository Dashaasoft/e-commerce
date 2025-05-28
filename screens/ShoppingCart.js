import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { useCart } from "../context/CartContext";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "./Header";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../context/UserContext";

const ShoppingCart = ({ navigation }) => {
  const { cartItems, removeFromCart, updateQuantity, calculateTotal } =
    useCart();
  const { user } = useContext(UserContext);

  // Тоо ширхэг нэмэх функц
  const increaseQuantity = (productId, size, color) => {
    const item = cartItems.find(
      (item) =>
        item._id === productId && item.size === size && item.color === color
    );
    if (item) {
      updateQuantity(productId, size, color, item.quantity + 1);
    }
  };

  // Тоо ширхэг багасгах функц
  const decreaseQuantity = (productId, size, color) => {
    const item = cartItems.find(
      (item) =>
        item._id === productId && item.size === size && item.color === color
    );
    if (item && item.quantity > 1) {
      updateQuantity(productId, size, color, item.quantity - 1);
    }
  };

  // Checkout function with authentication check
  const handleCheckout = () => {
    if (user) {
      // User is logged in, proceed to checkout
      navigation.navigate("CheckoutScreen");
    } else {
      // User is not logged in, show alert
      Alert.alert(
        "Нэвтрэх шаардлагатай",
        "Төлбөр төлөхийн тулд та эхлээд системд нэвтрэх шаардлагатай.",
        [
          { text: "Цуцлах", style: "cancel" },
          {
            text: "Нэвтрэх",
            onPress: () => {
              // Доод навигацийн "ProfileTab" индексийг шууд сонгох
              navigation.navigate("MainContainer", { screen: "ProfileTab" });
            },
          },
        ]
      );
    }
  };

  // Өнгөний кодыг авах функц
  const getColorCode = (colorName) => {
    switch (colorName) {
      case "Хар":
        return "#1A1A1A";
      case "Цэнхэр":
        return "#0066CC";
      case "Саарал":
        return "#666666";
      case "Цагаан":
        return "#F5F5F5";
      case "Улаан":
        return "#E60000";
      case "Ногоон":
        return "#009933";
      case "Шар":
        return "#FFD700";
      case "Ягаан":
        return "#FF69B4";
      case "Хүрэн":
        return "#8B4513";
      default:
        return "#CCCCCC";
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Header
        navigation={navigation}
        showBanner={false}
        howBackButton={false}
        showFilterButton={false}
        showSearchButton={false}
        showCategoryButton={false}
      />
      {/* Дээд хэсгийн header */}
      <View style={styles.container}>
        {cartItems.length === 0 ? ( // Сагс хоосон эсэхийг шалгах
          <View style={styles.emptyCartContainer}>
            <Icon name="cart-outline" size={100} color="#ccc" />
            <Text style={styles.emptyCartText}>Сагс хоосон байна.</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              keyExtractor={(item) =>
                `${item._id}-${item.size}-${item.color || "no-color"}`
              }
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <Image
                    source={{
                      uri:
                        item.image?.url ||
                        item.images?.[0] ||
                        "https://via.placeholder.com/150",
                    }}
                    style={styles.productImage}
                  />

                  <View style={styles.itemDetails}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <View style={styles.variantContainer}>
                      <Text style={styles.variantText}>
                        Хэмжээ: {item.size}
                      </Text>
                      {item.color && (
                        <View style={styles.colorContainer}>
                          <Text style={styles.variantText}>Өнгө: </Text>
                          <View
                            style={[
                              styles.colorIndicator,
                              { backgroundColor: getColorCode(item.color) },
                            ]}
                          />
                          <Text style={styles.variantText}>{item.color}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          decreaseQuantity(item._id, item.size, item.color)
                        }
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          increaseQuantity(item._id, item.size, item.color)
                        }
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>
                      {item.price.toLocaleString()}₮
                    </Text>
                  </View>

                  {/* Устгах товчийг баруун талд байрлуулах */}
                  <TouchableOpacity
                    style={styles.removeButtonContainer}
                    onPress={() =>
                      removeFromCart(item._id, item.size, item.color)
                    }
                  >
                    <Icon name="trash-outline" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={styles.listContent}
            />
            <View style={styles.totalContainer}>
              <Text style={styles.totalPrice}>
                Нийт үнэ: {calculateTotal().toLocaleString()}₮
              </Text>
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutButtonText}>Төлбөр төлөх</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

// Стиль тодорхойлох
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingTop: 0,
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartText: {
    fontSize: 18,
    color: "#888",
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center", // Бүтээгдэхүүний мэдээллийг босоо төвд байрлуулах
    position: "relative", // Relative position for absolute positioning of price
  },
  productImage: {
    width: 80,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceContainer: {
    position: "absolute",
    bottom: 10,
    right: 40, // Устгах товчны зүүн талд байрлуулах
  },
  productPrice: {
    fontSize: 14,
    color: "green",
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  quantityButton: {
    backgroundColor: "#f0f0f0",
    padding: 5,
    borderRadius: 5,
    width: 30,
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  removeButtonContainer: {
    padding: 10,
  },
  totalContainer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  checkoutButton: {
    backgroundColor: "#020904",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 120,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 5,
    zIndex: 10000,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0)",
    paddingVertical: 0,
    paddingHorizontal: 5,
    borderRadius: 20,
  },
  variantContainer: {
    marginVertical: 5,
  },
  variantText: {
    fontSize: 14,
    color: "#555",
  },
  colorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

export default ShoppingCart;
