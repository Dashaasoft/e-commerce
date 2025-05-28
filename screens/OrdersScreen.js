import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { API_URL } from "../config";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "./Header";

const OrdersScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Захиалгуудыг татах
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      // The API returns orders in data.data, not data.orders
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Захиалгуудыг татах үед алдаа гарлаа:", error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Дэлгэцийг ачаалах үед захиалгуудыг татах
  useEffect(() => {
    fetchOrders();
  }, []);

  // Дарах үед захиалгын дэлгэрэнгүй мэдээллийг харуулах
  const handleOrderPress = (order) => {
    navigation.navigate("OrderDetails", { orderId: order._id });
  };

  // Захиалгын төлөвийг монгол хэл дээр харуулах
  const getOrderStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Хүлээгдэж буй";
      case "shipped":
        return "Хүргэгдэж буй";
      case "delivered":
        return "Хүргэгдсэн";
      default:
        return status;
    }
  };

  // Төлбөрийн төлөвийг монгол хэл дээр харуулах
  const getPaymentStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Төлбөр хүлээгдэж буй";
      case "paid":
        return "Төлбөр төлөгдсөн";
      case "failed":
        return "Төлбөр төлөгдөөгүй";
      default:
        return status;
    }
  };

  // Захиалгын төлөвийн өнгийг тодорхойлох
  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f39c12";
      case "shipped":
        return "#3498db";
      case "delivered":
        return "#2ecc71";
      default:
        return "#95a5a6";
    }
  };

  // Төлбөрийн төлөвийн өнгийг тодорхойлох
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f39c12";
      case "paid":
        return "#2ecc71";
      case "failed":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  // Огноог форматлах
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

  // Захиалгын мөр рендер хийх
  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Захиалга #{item._id.slice(-6)}</Text>
        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.orderTotal}>
          Нийт үнэ: {item.totalAmount.toLocaleString()}₮
        </Text>
        <Text style={styles.orderItems}>
          {item.products.length} бүтээгдэхүүн
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getOrderStatusColor(item.orderStatus) },
          ]}
        >
          <Text style={styles.statusText}>
            {getOrderStatusText(item.orderStatus)}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getPaymentStatusColor(item.paymentStatus) },
          ]}
        >
          <Text style={styles.statusText}>
            {getPaymentStatusText(item.paymentStatus)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Хоосон захиалгууд
  const renderEmptyOrders = () => (
    <View style={styles.emptyContainer}>
      <Icon name="receipt-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>Таны захиалга байхгүй байна</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.shopButtonText}>Дэлгүүр рүү очих</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        navigation={navigation}
        showBanner={false}
        showFilterButton={false}
        showSearchButton={false}
        showCategoryButton={false}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#020904" />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyOrders}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchOrders();
              }}
              colors={["#020904"]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  orderItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  orderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderItems: {
    fontSize: 14,
    color: "#666",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: "#020904",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OrdersScreen; 