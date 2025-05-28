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
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Constants for API base URL
const API_BASE_URL = "http://10.150.35.107:5000/api";

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Address management states
  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    receiverName: "",
    province: "Улаанбаатар",
    district: "",
    khoroo: "",
    address: "",
    additionalInfo: "",
    phone: "",
    isDefault: false,
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Login form states
  const [loginUname, setLoginUname] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Order history states
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // FAQ chatbot states
  const [faqVisible, setFaqVisible] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);

  // FAQ data
  const faqList = [
    {
      question: "Захиалга хэрхэн хийх вэ?",
      answer:
        "Та бүтээгдэхүүнээ сонгож, сагсанд нэмээд, захиалга баталгаажуулах товчийг дарна уу.",
    },
    {
      question: "Хүргэлтийн төлбөр хэд вэ?",
      answer:
        "Хүргэлтийн төлбөр хот дотор 3000₮, хөдөө орон нутагт 5000₮ байна.",
    },
    {
      question: "Захиалгын төлөвийг яаж шалгах вэ?",
      answer:
        "Профайл хэсгийн 'Миний захиалгууд' цэснээс захиалгын төлөвийг харж болно.",
    },
    {
      question: "Буцаалт хэрхэн хийх вэ?",
      answer:
        "Бүтээгдэхүүн хүлээн авснаас хойш 48 цагийн дотор манай 7777-7014 операторт хандана уу.",
    },
    {
      question: "Төлбөрийн ямар аргуудтай вэ?",
      answer: "QPay, HiPay, дансаар шилжүүлэх болон зээлээр авах боломжтой.",
    },
  ];

  // Effect to update local state when user changes
  useEffect(() => {
    if (user) {
      console.log("User context updated:", user);
      console.log("User name:", user.userName);
      console.log("User phone:", user.phoneNumber);
      console.log("User email:", user.email);

      // Update local state with user data
      setName(user.userName || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");

      // Log the updated state values
      console.log("Updated state values:", {
        name: user.userName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  // Fetch user's orders
  const fetchOrders = async () => {
    if (!user) return;

    setIsLoadingOrders(true);
    try {
      console.log("Fetching orders for user:", user._id);
      console.log("Using token:", user.token);

      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Orders data:", data);

      if (data.success) {
        // The API returns orders in data.data, not data.orders
        const ordersWithPaymentMethod = data.data.map((order) => {
          console.log("Order ID:", order._id);
          console.log("Order payment method:", order.paymentMethod);
          console.log("Order full data:", JSON.stringify(order, null, 2));

          // If payment method is missing, try to set a default
          if (!order.paymentMethod) {
            console.log("Payment method is missing, setting default");
            order.paymentMethod = "Тодорхойгүй";
          }

          return order;
        });
        setOrders(ordersWithPaymentMethod || []);
      } else {
        throw new Error(data.message || "Захиалгуудыг авахад алдаа гарлаа");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Don't show alert to avoid spamming the user with alerts
      // Just set empty orders array
      setOrders([]);
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

  // Get payment status text and color
  const getPaymentStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { text: "Төлөгдөөгүй", color: "#FFA500" };
      case "paid":
        return { text: "Төлөгдсөн", color: "#28a745" };
      case "failed":
        return { text: "Амжилтгүй", color: "#dc3545" };
      default:
        return { text: "Тодорхойгүй", color: "#666" };
    }
  };

  // Get payment method details
  const getPaymentMethodInfo = (method) => {
    console.log("Getting payment method info for:", method);

    // Handle null or undefined
    if (!method) {
      console.log("Payment method is null or undefined");
      return {
        name: "Тодорхойгүй",
        icon: "help-circle-outline",
        color: "#666",
        description: "Төлбөрийн арга тодорхойгүй",
      };
    }

    // Convert to string and trim
    const methodStr = String(method).trim();
    console.log("Normalized payment method:", methodStr);

    switch (methodStr) {
      case "QPay":
        return {
          name: "QPay",
          icon: "card-outline",
          color: "#6a11cb",
          description: "QPay хэтэвчээр төлөгдсөн",
        };
      case "HiPay":
        return {
          name: "HiPay",
          icon: "card-outline",
          color: "#2575fc",
          description: "HiPay хэтэвчээр төлөгдсөн",
        };
      case "Зээлээр авах":
        return {
          name: "Зээлээр авах",
          icon: "cash-outline",
          color: "#ff9800",
          description: "Зээлээр авсан",
        };
      case "Дансаар шилжүүлэх":
        return {
          name: "Дансаар шилжүүлэх",
          icon: "business-outline",
          color: "#4caf50",
          description: "Дансаар шилжүүлсэн",
        };
      default:
        console.log("Unknown payment method:", methodStr);
        return {
          name: methodStr || "Тодорхойгүй",
          icon: "help-circle-outline",
          color: "#666",
          description: "Төлбөрийн арга тодорхойгүй",
        };
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
    console.log("Rendering order item:", item._id);
    console.log("Order payment method:", item.paymentMethod);

    // Ensure payment method is set
    if (!item.paymentMethod) {
      console.log("Payment method is missing, setting default");
      item.paymentMethod = "Тодорхойгүй";
    }

    const statusInfo = getStatusInfo(item.orderStatus);
    const paymentStatusInfo = getPaymentStatusInfo(item.paymentStatus);
    const paymentMethodInfo = getPaymentMethodInfo(item.paymentMethod);

    console.log("Payment method info:", paymentMethodInfo);

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

        <View
          style={[
            styles.paymentStatusContainer,
            { backgroundColor: paymentStatusInfo.color + "20" },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: paymentStatusInfo.color },
            ]}
          />
          <Text
            style={[styles.paymentStatus, { color: paymentStatusInfo.color }]}
          >
            {paymentStatusInfo.text}
          </Text>
        </View>

        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>
            Захиалгын дугаар: {item._id.slice(-6)}
          </Text>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.orderDate}>
            Огноо: {formatDate(item.createdAt)}
          </Text>
          <Text style={styles.orderTotal}>
            Нийт дүн:{" "}
            {item.totalAmount ? item.totalAmount.toLocaleString() : "0"}₮
          </Text>
          <View style={styles.paymentMethodContainer}>
            <Icon
              name={paymentMethodInfo.icon}
              size={18}
              color={paymentMethodInfo.color}
              style={styles.paymentMethodIcon}
            />
            <View style={styles.paymentMethodTextContainer}>
              <Text style={styles.paymentMethod}>
                Төлбөрийн арга: {paymentMethodInfo.name}
              </Text>
              <Text style={styles.paymentMethodDescription}>
                {paymentMethodInfo.description}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.shippingInfo}>
          <Text style={styles.shippingTitle}>Хүргэлтийн мэдээлэл:</Text>
          {item.shippingInfo ? (
            <>
              <Text style={styles.shippingText}>
                Хүлээн авагч:{" "}
                {item.shippingInfo.receiverName || "Нэр оруулаагүй"}
              </Text>
              <Text style={styles.shippingText}>
                Утас: {item.shippingInfo.phone || "Утас оруулаагүй"}
              </Text>
              <Text style={styles.shippingText}>
                Аймаг/Хот: {item.shippingInfo.province || "Оруулаагүй"}
              </Text>
              <Text style={styles.shippingText}>
                Дүүрэг: {item.shippingInfo.district || "Оруулаагүй"}
              </Text>
              <Text style={styles.shippingText}>
                Хороо: {item.shippingInfo.khoroo || "Оруулаагүй"}
              </Text>
              <Text style={styles.shippingText}>
                Хаяг: {item.shippingInfo.address || "Оруулаагүй"}
              </Text>
              {item.shippingInfo.additionalInfo && (
                <Text style={styles.shippingText}>
                  Нэмэлт мэдээлэл: {item.shippingInfo.additionalInfo}
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.shippingText}>Хүргэлтийн мэдээлэл байхгүй</Text>
          )}
        </View>

        <View style={styles.orderItems}>
          <Text style={styles.orderItemsTitle}>Захиалсан бүтээгдэхүүн:</Text>
          {item.products && item.products.length > 0 ? (
            item.products.map((product, index) => (
              <View key={index} style={styles.productItem}>
                <View style={styles.productImageContainer}>
                  {product.productSnapshot &&
                  product.productSnapshot.images &&
                  product.productSnapshot.images.length > 0 ? (
                    <Image
                      source={{ uri: product.productSnapshot.images[0] }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.productImage, styles.noImage]}>
                      <Icon name="image-outline" size={24} color="#ccc" />
                    </View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {product.productSnapshot
                      ? product.productSnapshot.name
                      : "Бүтээгдэхүүн"}
                  </Text>
                  <Text style={styles.productDetails}>
                    Тоо хэмжээ: {product.quantity || 1} | Хэмжээ:{" "}
                    {product.selectedSize || "Тодорхойгүй"}
                    {product.selectedColor
                      ? ` | Өнгө: ${product.selectedColor}`
                      : ""}
                  </Text>
                  <Text style={styles.productPrice}>
                    {product.productSnapshot && product.productSnapshot.price
                      ? (
                          product.productSnapshot.price *
                          (product.quantity || 1)
                        ).toLocaleString()
                      : "0"}
                    ₮
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noProductsText}>Бүтээгдэхүүн байхгүй</Text>
          )}
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
      Alert.alert("Алдаа", "Имэйл болон нууц үгээ оруулна уу");
      return;
    }

    setLoginLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginUname,
          password: loginPassword,
        }),
      });

      const data = await response.json();
      console.log("Login response data:", data);

      if (data.token) {
        const userData = {
          token: data.token,
          _id: data._id,
          email: data.email,
          role: data.role,
          userName: data.userName,
          phoneNumber: data.phoneNumber,
        };

        // Токеныг AsyncStorage дээр хадгалах
        await AsyncStorage.setItem("user_token", data.token);
        await AsyncStorage.setItem("user_id", data._id);

        console.log("Setting user data:", userData);
        setUser(userData);

        // Set all user info from response
        setName(data.userName);
        setEmail(data.email);
        setPhoneNumber(data.phoneNumber);
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

    // AsyncStorage-ээс токен болон user ID-г авах
    const token = await AsyncStorage.getItem("user_token");
    const userId = await AsyncStorage.getItem("user_id");

    if (!token || !userId) {
      Alert.alert("Алдаа", "Та эхлээд нэвтэрнэ үү");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Updating user with data:", {
        userName: name,
        email: email,
        phoneNumber: phoneNumber,
      });

      const response = await fetch(
        `http://10.150.35.107:5000/api/users/update/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            userName: name,
            email: email,
            phoneNumber: phoneNumber,
          }),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Update response:", data);

      if (response.ok) {
        // Update user context with new data
        const newUserData = {
          ...user,
          userName: name,
          email: email,
          phoneNumber: phoneNumber,
        };

        console.log("Updated user data:", newUserData);
        setUser(newUserData);

        // Update local state
        setName(name);
        setEmail(email);
        setPhoneNumber(phoneNumber);

        // Only call triggerSuccessAnimation ONCE here
        triggerSuccessAnimation();
      } else {
        console.error("Update failed:", data);
        Alert.alert(
          "Алдаа",
          data.message ||
            "Мэдээлэл шинэчлэхэд алдаа гарлаа. Дэлгэрэнгүй: " +
              JSON.stringify(data)
        );
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert(
        "Алдаа",
        `Сервертэй холбогдоход алдаа гарлаа. Дэлгэрэнгүй: ${error.message}`
      );
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
          // AsyncStorage-ээс токен болон user ID-г устгах
          await AsyncStorage.removeItem("user_token");
          await AsyncStorage.removeItem("user_id");
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

  // Fetch user's addresses
  const fetchAddresses = async () => {
    if (!user) return;

    setIsLoadingAddresses(true);
    try {
      const token = await AsyncStorage.getItem("user_token");
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setAddresses(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch addresses");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      Alert.alert("Error", "Failed to load your addresses");
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Add or update address
  const saveAddress = async () => {
    if (!user) return;

    // Validate required fields
    if (
      !newAddress.receiverName ||
      !newAddress.district ||
      !newAddress.address ||
      !newAddress.phone
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsAddingAddress(true);
    try {
      const token = await AsyncStorage.getItem("user_token");
      const url = editingAddressId
        ? `${API_BASE_URL}/addresses/${editingAddressId}`
        : `${API_BASE_URL}/addresses`;

      const method = editingAddressId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        Alert.alert(
          "Success",
          editingAddressId
            ? "Address updated successfully"
            : "Address added successfully"
        );
        setShowAddressModal(false);
        resetAddressForm();
        fetchAddresses();
      } else {
        throw new Error(data.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      Alert.alert("Error", "Failed to save address");
    } finally {
      setIsAddingAddress(false);
    }
  };

  // Set address as default
  const setDefaultAddress = async (addressId) => {
    if (!user) return;

    try {
      const token = await AsyncStorage.getItem("user_token");
      const response = await fetch(
        `${API_BASE_URL}/addresses/${addressId}/default`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        fetchAddresses();
      } else {
        throw new Error(data.message || "Failed to set default address");
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      Alert.alert("Error", "Failed to set default address");
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    if (!user) return;

    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("user_token");
              const response = await fetch(
                `${API_BASE_URL}/addresses/${addressId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!response.ok) {
                throw new Error(
                  `Server responded with status: ${response.status}`
                );
              }

              const data = await response.json();
              if (data.success) {
                fetchAddresses();
              } else {
                throw new Error(data.message || "Failed to delete address");
              }
            } catch (error) {
              console.error("Error deleting address:", error);
              Alert.alert("Error", "Failed to delete address");
            }
          },
        },
      ]
    );
  };

  // Edit address
  const editAddress = (address) => {
    setNewAddress({
      receiverName: address.receiverName,
      province: address.province,
      district: address.district,
      khoroo: address.khoroo || "",
      address: address.address,
      additionalInfo: address.additionalInfo || "",
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setEditingAddressId(address._id);
    setShowAddressModal(true);
  };

  // Reset address form
  const resetAddressForm = () => {
    setNewAddress({
      receiverName: "",
      province: "Улаанбаатар",
      district: "",
      khoroo: "",
      address: "",
      additionalInfo: "",
      phone: "",
      isDefault: false,
    });
    setEditingAddressId(null);
  };

  // Open add address modal
  const openAddAddressModal = () => {
    resetAddressForm();
    setShowAddressModal(true);
  };

  // Close address modal
  const closeAddressModal = () => {
    setShowAddressModal(false);
    resetAddressForm();
  };

  // Effect to fetch addresses when user changes
  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Render address item
  const renderAddressItem = ({ item }) => (
    <View style={styles.addressItem}>
      <View style={styles.addressHeader}>
        <Text style={styles.addressName}>{item.receiverName}</Text>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Үндсэн</Text>
          </View>
        )}
      </View>

      <Text style={styles.addressPhone}>{item.phone}</Text>
      <Text style={styles.addressDetails}>
        {item.province}, {item.district}
        {item.khoroo ? `, ${item.khoroo}` : ""}
      </Text>
      <Text style={styles.addressDetails}>{item.address}</Text>
      {item.additionalInfo && (
        <Text style={styles.addressDetails}>{item.additionalInfo}</Text>
      )}

      <View style={styles.addressActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.addressActionButton}
            onPress={() => setDefaultAddress(item._id)}
          >
            <Icon name="star-outline" size={18} color="#6a11cb" />
            <Text style={styles.actionButtonText}>Үндсэн болгох</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.addressActionButton}
          onPress={() => editAddress(item)}
        >
          <Icon name="create-outline" size={18} color="#6a11cb" />
          <Text style={styles.actionButtonText}>Засах</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addressActionButton, styles.deleteButton]}
          onPress={() => deleteAddress(item._id)}
        >
          <Icon name="trash-outline" size={18} color="#f44336" />
          <Text style={[styles.actionButtonText, styles.deleteText]}>
            Устгах
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Add district and khoroo data
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

  // FAQ Chatbot Modal
  const renderFaqModal = () => (
    <Modal
      visible={faqVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setFaqVisible(false);
        setSelectedFaq(null);
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "92%",
            backgroundColor: "#fff",
            borderRadius: 18,
            padding: 0,
            maxHeight: "85%",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#6a11cb",
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
            }}
          >
            <Text
              style={{
                fontSize: 19,
                fontWeight: "bold",
                color: "#fff",
                letterSpacing: 0.5,
              }}
            >
              Түгээмэл асуулт
            </Text>
            <TouchableOpacity
              onPress={() => {
                setFaqVisible(false);
                setSelectedFaq(null);
              }}
            >
              <Icon name="close" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
          {!selectedFaq ? (
            <ScrollView style={{ paddingHorizontal: 0 }}>
              {faqList.map((faq, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={{
                    paddingVertical: 18,
                    paddingHorizontal: 22,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f0f0f0",
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: idx % 2 === 0 ? "#fafbff" : "#fff",
                  }}
                  onPress={() => setSelectedFaq(faq)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="chatbubble-ellipses-outline"
                    size={22}
                    color="#6a11cb"
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ fontSize: 16, color: "#333", flex: 1 }}>
                    {faq.question}
                  </Text>
                  <Icon name="chevron-forward" size={20} color="#bbb" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 28,
                minHeight: 260,
              }}
              style={{ width: "100%" }}
            >
              <View
                style={{
                  backgroundColor: "#f5f7fa",
                  borderRadius: 12,
                  padding: 22,
                  marginBottom: 30,
                  width: "100%",
                  shadowColor: "#6a11cb",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#6a11cb",
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  {selectedFaq.question}
                </Text>
                <Text
                  style={{
                    fontSize: 15.5,
                    color: "#222",
                    textAlign: "center",
                    lineHeight: 23,
                  }}
                >
                  {selectedFaq.answer}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  alignSelf: "center",
                  backgroundColor: "#6a11cb",
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  marginTop: 0,
                  shadowColor: "#6a11cb",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => setSelectedFaq(null)}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  Буцах
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

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
      {/* Амжилтын мэдэгдэл дэлгэцийн голд */}
      {saveSuccess && (
        <Animated.View
          style={[
            styles.successNotification,
            styles.successNotificationCenter,
            successAnimationStyle,
          ]}
        >
          <Icon name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.successText}>Амжилттай хадгалагдлаа!</Text>
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* FAQ and Logout buttons inside header */}
          <View style={styles.headerButtonsRow}>
            <TouchableOpacity
              style={styles.inlineFaqButton}
              onPress={() => setFaqVisible(true)}
            >
              <Icon name="chatbubbles-outline" size={20} color="#fff" />
              <Text style={styles.faqButtonText}>Түгээмэл асуулт</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inlineLogoutButton}
              onPress={handleLogout}
            >
              <Icon name="log-out-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
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
          {/* Divider */}
          <View style={styles.profileDivider} />
        </View>

        {/* Хувийн мэдээлэл хэсэг */}
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

          {/* Хадгалах товч (доод талд) */}
          <TouchableOpacity
            style={[
              styles.saveButtonBottom,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="save-outline" size={18} color="white" />
                <Text style={styles.saveButtonText}>Хадгалах</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Хаяг удирдах хэсэг */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Миний хаягууд</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={openAddAddressModal}
            >
              <Icon name="add-circle-outline" size={24} color="#6a11cb" />
              <Text style={styles.addButtonText}>Шинэ хаяг нэмэх</Text>
            </TouchableOpacity>
          </View>

          {isLoadingAddresses ? (
            <ActivityIndicator size="large" color="#6a11cb" />
          ) : addresses.length > 0 ? (
            <FlatList
              data={addresses}
              renderItem={renderAddressItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.addressesList}
            />
          ) : (
            <View style={styles.emptyAddressesContainer}>
              <Icon name="location-outline" size={50} color="#ccc" />
              <Text style={styles.noAddressesText}>Хаяг байхгүй байна</Text>
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={openAddAddressModal}
              >
                <Text style={styles.addAddressButtonText}>
                  Эхний хаягаа нэмэх
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Захиалгын түүх хэсэг */}
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
            <View style={styles.emptyOrdersContainer}>
              <Icon name="receipt-outline" size={50} color="#ccc" />
              <Text style={styles.noOrdersText}>Захиалга байхгүй байна</Text>
              <TouchableOpacity
                style={styles.shopNowButton}
                onPress={() => navigation.navigate("Home")}
              >
                <Text style={styles.shopNowButtonText}>Дэлгүүр рүү очих</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAQ Modal */}
      {renderFaqModal()}

      {/* Address Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeAddressModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddressId ? "Хаяг засах" : "Шинэ хаяг нэмэх"}
              </Text>
              <TouchableOpacity onPress={closeAddressModal}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Хүлээн авагчийн нэр *</Text>
                <View style={styles.inputFieldContainer}>
                  <Icon
                    name="person-outline"
                    size={20}
                    color="#6a11cb"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputField}
                    value={newAddress.receiverName}
                    onChangeText={(text) =>
                      setNewAddress({ ...newAddress, receiverName: text })
                    }
                    placeholder="Хүлээн авагчийн нэр"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Утасны дугаар *</Text>
                <View style={styles.inputFieldContainer}>
                  <Icon
                    name="call-outline"
                    size={20}
                    color="#6a11cb"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputField}
                    value={newAddress.phone}
                    onChangeText={(text) =>
                      setNewAddress({ ...newAddress, phone: text })
                    }
                    placeholder="Утасны дугаар"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Аймаг/Хот *</Text>
                <View style={styles.inputFieldContainer}>
                  <Icon
                    name="location-outline"
                    size={20}
                    color="#6a11cb"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputField}
                    value={newAddress.province}
                    onChangeText={(text) =>
                      setNewAddress({ ...newAddress, province: text })
                    }
                    placeholder="Аймаг/Хот"
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Дүүрэг *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newAddress.district}
                    onValueChange={(itemValue) => {
                      setNewAddress({
                        ...newAddress,
                        district: itemValue,
                        khoroo: "",
                      });
                    }}
                    style={
                      Platform.OS === "ios" ? styles.pickerIOS : styles.picker
                    }
                  >
                    <Picker.Item label="Дүүрэг сонгох" value="" />
                    {districts.map((item) => (
                      <Picker.Item key={item} label={item} value={item} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Хороо</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newAddress.khoroo}
                    onValueChange={(itemValue) =>
                      setNewAddress({ ...newAddress, khoroo: itemValue })
                    }
                    style={
                      Platform.OS === "ios" ? styles.pickerIOS : styles.picker
                    }
                    enabled={!!newAddress.district}
                  >
                    <Picker.Item label="Хороо сонгох" value="" />
                    {newAddress.district &&
                      neighborhoods[newAddress.district].map((item) => (
                        <Picker.Item key={item} label={item} value={item} />
                      ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Дэлгэрэнгүй хаяг *</Text>
                <View style={styles.inputFieldContainer}>
                  <Icon
                    name="home-outline"
                    size={20}
                    color="#6a11cb"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputField}
                    value={newAddress.address}
                    onChangeText={(text) =>
                      setNewAddress({ ...newAddress, address: text })
                    }
                    placeholder="Дэлгэрэнгүй хаяг"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Нэмэлт мэдээлэл</Text>
                <View style={styles.inputFieldContainer}>
                  <Icon
                    name="information-circle-outline"
                    size={20}
                    color="#6a11cb"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputField}
                    value={newAddress.additionalInfo}
                    onChangeText={(text) =>
                      setNewAddress({ ...newAddress, additionalInfo: text })
                    }
                    placeholder="Нэмэлт мэдээлэл (заавал биш)"
                  />
                </View>
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    setNewAddress({
                      ...newAddress,
                      isDefault: !newAddress.isDefault,
                    })
                  }
                >
                  <Icon
                    name={newAddress.isDefault ? "checkbox" : "square-outline"}
                    size={24}
                    color="#6a11cb"
                  />
                  <Text style={styles.checkboxLabel}>Үндсэн хаяг болгох</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Хадгалах болон Болих товчнуудыг хэвтээ байрлалд зөв харуулах */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeAddressModal}
              >
                <Text style={styles.cancelButtonText}>Болих</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveModalButton}
                onPress={saveAddress}
                disabled={isAddingAddress}
              >
                {isAddingAddress ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingAddressId ? "Шинэчлэх" : "Хадгалах"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    display: "none",
  },
  saveButtonBottom: {
    marginTop: 10,
    alignSelf: "flex-end",
    backgroundColor: "#6a11cb",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    gap: 7,
    shadowColor: "#6a11cb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  // Success notification
  successNotification: {
    position: "absolute",
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
  successNotificationCenter: {
    top: "45%",
    alignSelf: "center",
    left: "7%",
    right: "7%",
    width: "86%",
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
  paymentMethodContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  paymentMethodIcon: {
    marginRight: 8,
  },
  paymentMethodTextContainer: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
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
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
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
  emptyOrdersContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 20,
  },
  noOrdersText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 15,
  },
  shopNowButton: {
    backgroundColor: "#6a11cb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  shopNowButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noImage: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  noProductsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  paymentStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Address management styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#6a11cb",
    fontWeight: "bold",
    marginLeft: 5,
  },
  addressesList: {
    paddingBottom: 20,
  },
  addressItem: {
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
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  defaultBadge: {
    backgroundColor: "#6a11cb20",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  defaultText: {
    color: "#6a11cb",
    fontSize: 12,
    fontWeight: "bold",
  },
  addressPhone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  addressDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  addressActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  addressActionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  actionButtonText: {
    color: "#6a11cb",
    marginLeft: 5,
    fontSize: 14,
  },
  deleteButton: {
    color: "#f44336",
  },
  deleteText: {
    color: "#f44336",
  },
  emptyAddressesContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 20,
  },
  noAddressesText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 15,
  },
  addAddressButton: {
    backgroundColor: "#6a11cb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addAddressButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalForm: {
    maxHeight: "70%",
  },
  checkboxContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
    justifyContent: "center",
  },
  saveModalButton: {
    flex: 1,
    backgroundColor: "#6a11cb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
  },
  picker: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    height: 50,
  },
  pickerIOS: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    height: 180,
  },
  faqButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },

  // FAQ Button styles
  headerButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  inlineFaqButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6a11cb",
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: "#6a11cb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inlineLogoutButton: {
    backgroundColor: "#f44336",
    borderRadius: 22,
    padding: 10,
    elevation: 6,
    shadowColor: "#f44336",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  // Divider under avatar/name/email
  profileDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#eee",
    marginTop: 22,
    marginBottom: 0,
  },
});
