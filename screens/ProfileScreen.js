import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Constants for API base URL
const API_BASE_URL = "http://192.168.36.181:5000";

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Login form states
  const [loginUname, setLoginUname] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Order history states
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Effect to update local state when user changes
  useEffect(() => {
    if (user) {
      console.log("User context updated:", user);
      setName(user.name || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phonenumber || "");
    }
  }, [user]);

  // Fetch user's orders
  const fetchOrders = async () => {
    if (!user) return;

    setIsLoadingOrders(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/user/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        throw new Error(data.message || "Захиалгуудыг авахад алдаа гарлаа");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Алдаа", "Захиалгуудыг авахад алдаа гарлаа");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Set up polling for order status updates
  useEffect(() => {
    if (user) {
      fetchOrders();
      // Poll every 30 seconds for updates
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Get status text and color
  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { text: "Хүлээгдэж байна", color: "#FFA500" };
      case "processing":
        return { text: "Бэлтгэгдэж байна", color: "#FFD700" };
      case "shipped":
        return { text: "Хүргэлтэнд гарсан", color: "#4169E1" };
      case "delivered":
        return { text: "Хүргэгдсэн", color: "#28a745" };
      case "cancelled":
        return { text: "Цуцлагдсан", color: "#dc3545" };
      default:
        return { text: "Тодорхойгүй", color: "#666" };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render order item
  const renderOrderItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <View style={styles.orderItem}>
        <View
          style={[
            styles.statusContainer,
            { backgroundColor: statusInfo.color + "20" },
          ]}
        >
          <View
            style={[styles.statusDot, { backgroundColor: statusInfo.color }]}
          />
          <Text style={[styles.orderStatus, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>

        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>
            Захиалгын дугаар: {item.orderNumber}
          </Text>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.orderDate}>
            Огноо: {formatDate(item.createdAt)}
          </Text>
          <Text style={styles.orderTotal}>
            Нийт дүн: {item.totalAmount.toLocaleString()}₮
          </Text>
          <Text style={styles.paymentMethod}>
            Төлбөрийн арга: {item.paymentMethod}
          </Text>
        </View>

        <View style={styles.shippingInfo}>
          <Text style={styles.shippingTitle}>Хүргэлтийн мэдээлэл:</Text>
          <Text style={styles.shippingText}>{item.shippingInfo.name}</Text>
          <Text style={styles.shippingText}>{item.shippingInfo.phone}</Text>
          <Text style={styles.shippingText}>
            {item.shippingInfo.district}, {item.shippingInfo.neighborhood}
          </Text>
          <Text style={styles.shippingText}>{item.shippingInfo.address}</Text>
        </View>

        <View style={styles.orderItems}>
          <Text style={styles.orderItemsTitle}>Захиалсан бүтээгдэхүүн:</Text>
          {item.items.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <Image
                source={{ uri: product.image }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDetails}>
                  Тоо хэмжээ: {product.quantity} | Хэмжээ: {product.size}
                </Text>
                <Text style={styles.productPrice}>
                  {product.price.toLocaleString()}₮
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const triggerSuccessAnimation = () => {
    setSaveSuccess(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 1000,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setSaveSuccess(false));
      }, 1500);
    });
  };

  // Email validation function
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Phone number validation function
  const validatePhoneNumber = (phone) => {
    const re = /^[0-9]{8,}$/; // Assumes at least 8 digits
    return re.test(String(phone));
  };

  const handleLogin = async () => {
    // Basic validation
    if (!loginUname || !loginPassword) {
      Alert.alert("Алдаа", "Хэрэглэгчийн нэр болон нууц үгээ оруулна уу");
      return;
    }

    setLoginLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uname: loginUname,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        console.log("Login successful. User data:", data.user);
        await AsyncStorage.setItem("user_token", data.token);
        setUser({ token: data.token, ...data.user });
      } else {
        Alert.alert("Алдаа", data.message || "Нэвтрэх үед алдаа гарлаа");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Алдаа", "Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate inputs before submission
    if (!name.trim()) {
      Alert.alert("Алдаа", "Нэрээ оруулна уу");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Алдаа", "Зөв имэйл хаяг оруулна уу");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert("Алдаа", "Зөв утасны дугаар оруулна уу");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name,
          email,
          phonenumber: phoneNumber,
        }),
      });

      const updatedUserResponse = await response.json();

      if (updatedUserResponse.success) {
        const updatedUser = updatedUserResponse.result;

        // Merge the updated user data with existing user context
        const newUserData = {
          ...user,
          name: updatedUser.name,
          email: updatedUser.email,
          phonenumber: updatedUser.phonenumber,
        };

        console.log("Updated user data:", newUserData);
        setUser(newUserData);

        triggerSuccessAnimation();
      } else {
        Alert.alert(
          "Алдаа",
          updatedUserResponse.message || "Мэдээлэл хадгалахад алдаа гарлаа"
        );
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Алдаа", "Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Гарах", "Та системээс гарахдаа итгэлтэй байна уу?", [
      { text: "Үгүй", style: "cancel" },
      {
        text: "Тийм",
        onPress: async () => {
          await AsyncStorage.removeItem("user_token");
          setUser(null);
        },
      },
    ]);
  };

  // Success animation styles
  const successAnimationStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1.2, 1],
        }),
      },
    ],
    opacity: animation,
  };

  // Not logged in view
  if (!user) {
    return (
      <SafeAreaView style={styles.loginScreenContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.loginContainer}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Нэвтрэх</Text>
          </View>

          <View style={styles.inputContainer}>
            <Icon
              name="person-outline"
              size={20}
              color="#6a11cb"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Хэрэглэгчийн нэр"
              placeholderTextColor="#888"
              value={loginUname}
              onChangeText={setLoginUname}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon
              name="lock-closed-outline"
              size={20}
              color="#6a11cb"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Нууц үг"
              placeholderTextColor="#888"
              secureTextEntry={!showPassword}
              value={loginPassword}
              onChangeText={setLoginPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#6a11cb"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loginLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Нэвтрэх</Text>
            )}
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.linkText}>Нууц үг сэргээх</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.linkText}>Бүртгүүлэх</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Logged in view
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Success notification */}
        {saveSuccess && (
          <Animated.View
            style={[styles.successNotification, successAnimationStyle]}
          >
            <Icon name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.successText}>Амжилттай хадгалагдлаа!</Text>
          </Animated.View>
        )}

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={["#6a11cb", "#2575fc"]}
              style={styles.avatarGradient}
            >
              <Icon name="person" size={60} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.welcomeText}>Сайн байна уу, {name}</Text>
          <Text style={styles.emailText}>{email}</Text>

          {/* Action Buttons */}
          <View style={styles.headerButtonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="save-outline" size={20} color="white" />
                  <Text style={styles.saveButtonText}>Хадгалах</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Icon name="log-out-outline" size={20} color="white" />
              <Text style={styles.logoutButtonText}>Гарах</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Хувийн мэдээлэл</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Нэр</Text>
            <View style={styles.inputFieldContainer}>
              <Icon
                name="person-outline"
                size={20}
                color="#6a11cb"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputField}
                value={name}
                onChangeText={setName}
                placeholder="Нэрээ оруулна уу"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Имэйл</Text>
            <View style={styles.inputFieldContainer}>
              <Icon
                name="mail-outline"
                size={20}
                color="#6a11cb"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputField}
                value={email}
                onChangeText={setEmail}
                placeholder="Имэйл хаягаа оруулна уу"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Утасны дугаар</Text>
            <View style={styles.inputFieldContainer}>
              <Icon
                name="call-outline"
                size={20}
                color="#6a11cb"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputField}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Утасны дугаараа оруулна уу"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Order History Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Миний захиалгууд</Text>

          {isLoadingOrders ? (
            <ActivityIndicator size="large" color="#6a11cb" />
          ) : orders.length > 0 ? (
            <FlatList
              data={orders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.ordersList}
            />
          ) : (
            <Text style={styles.noOrdersText}>Захиалга байхгүй байна</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  // Common styles
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // Login screen styles
  loginScreenContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6a11cb",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#333",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#6a11cb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#6a11cb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  linkText: {
    color: "#6a11cb",
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },

  // Profile screen styles
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  emailText: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },

  // Form styles
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6a11cb",
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    marginLeft: 5,
  },
  inputFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: "#eee",
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },

  // Button styles
  headerButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#6a11cb",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    shadowColor: "#6a11cb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: "#f44336",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    shadowColor: "#f44336",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Success notification
  successNotification: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  successText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },

  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  ordersList: {
    paddingBottom: 20,
  },
  orderItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  orderDetails: {
    marginBottom: 10,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  paymentMethod: {
    fontSize: 14,
    color: "#666",
  },
  shippingInfo: {
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  shippingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  shippingText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  orderItems: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  orderItemsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  productItem: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  productDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6a11cb",
  },
  noOrdersText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});

