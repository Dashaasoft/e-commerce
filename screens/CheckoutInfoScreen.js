import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { UserContext } from "../context/UserContext";
import { useCart } from "../context/CartContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";

// Constants for API base URL
const API_BASE_URL = "http://10.150.35.107:5000/api";

const CheckoutInfoScreen = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);
  const { cartItems, calculateTotal, clearCart } = useCart();

  const [receiverName, setReceiverName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("Улаанбаатар");
  const [district, setDistrict] = useState("");
  const [khoroo, setKhoroo] = useState("");
  const [address, setAddress] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Address selection states
  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  // User мэдээллийг шууд татаж авах
  useEffect(() => {
    if (user) {
      console.log("User data in CheckoutInfoScreen:", user);
      setReceiverName(user.userName || "");
      setPhone(user.phoneNumber || "");

      // Fetch user's addresses
      fetchAddresses();
    }
  }, [user]);

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

        // Auto-select default address if available
        const defaultAddress = data.data.find((addr) => addr.isDefault);
        if (defaultAddress) {
          selectAddress(defaultAddress);
        }
      } else {
        throw new Error(data.message || "Failed to fetch addresses");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      // Don't show alert to avoid disrupting the checkout flow
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Select an address and fill the form
  const selectAddress = (selectedAddress) => {
    setReceiverName(selectedAddress.receiverName);
    setPhone(selectedAddress.phone);
    setProvince(selectedAddress.province);
    setDistrict(selectedAddress.district);
    setKhoroo(selectedAddress.khoroo || "");
    setAddress(selectedAddress.address);
    setAdditionalInfo(selectedAddress.additionalInfo || "");
    setSelectedAddressId(selectedAddress._id);
    setUseNewAddress(false);
    setShowAddressModal(false);
  };

  // Open address selection modal
  const openAddressModal = () => {
    setShowAddressModal(true);
  };

  // Close address selection modal
  const closeAddressModal = () => {
    setShowAddressModal(false);
  };

  // Use new address instead of saved address
  const handleUseNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
    setShowAddressModal(false);
  };

  const provinces = ["Улаанбаатар"];

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
    return receiverName && phone && province && district && address;
  };

  const handleCheckout = async () => {
    if (!isFormValid()) {
      Alert.alert("Анхаар", "Бүх шаардлагатай талбарыг бөглөнө үү");
      return;
    }

    try {
      setIsLoading(true);

      // Get product details for snapshots
      const productsWithSnapshots = await Promise.all(
        cartItems.map(async (item) => {
          try {
            // Fetch product details from API
            const response = await axios.get(
              `${API_BASE_URL}/products/${item._id}`
            );

            // API-аас ирж буй хариу өгөгдлийг шууд ашиглах
            const product = response.data;

            // Validate required product fields
            if (!product || typeof product !== "object") {
              throw new Error("Product data is invalid");
            }

            return {
              product: item._id,
              quantity: Number(item.quantity),
              selectedSize: item.size || "default",
              selectedColor: item.color || "default",
              productSnapshot: {
                name: product.name || "Бүтээгдэхүүн",
                price: product.price || 0,
                images: product.images || [],
                description: product.description || "",
              },
            };
          } catch (error) {
            console.error(`Error fetching product ${item._id}:`, error);
            // Return basic info if product fetch fails
            return {
              product: item._id,
              quantity: Number(item.quantity),
              selectedSize: item.size || "default",
              selectedColor: item.color || "default",
              productSnapshot: {
                name: item.name || "Бүтээгдэхүүн",
                price: item.price || 0,
                images: item.images || [],
                description: item.description || "",
              },
            };
          }
        })
      );

      const orderData = {
        user: user._id,
        userName: user.userName || "", // Хэрэглэгчийн нэр
        products: productsWithSnapshots,
        shippingInfo: {
          receiverName: receiverName, // Хүлээн авах хүний нэр
          province: province,
          district: district,
          khoroo: khoroo,
          address: address,
          phone: phone,
          additionalInfo: additionalInfo,
        },
        totalAmount: Number(calculateTotal()),
        paymentStatus: "pending",
        orderStatus: "pending",
      };

      // Navigate to PaymentScreen with order data
      navigation.navigate("Төлбөр төлөх", { orderData });
    } catch (error) {
      console.error("Error preparing order data:", error);
      Alert.alert(
        "Алдаа",
        "Мэдээлэл бэлтгэхэд алдаа гарлаа. Дахин оролдоно уу."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Render address item in modal
  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      key={item._id}
      style={[
        styles.addressItem,
        selectedAddressId === item._id && styles.selectedAddressItem,
      ]}
      onPress={() => selectAddress(item)}
    >
      <View style={styles.addressHeader}>
        <Text style={styles.addressName}>{item.receiverName}</Text>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
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
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Address Selection Section */}
      <View style={styles.addressSelectionContainer}>
        <Text style={styles.sectionTitle}>Хүргэлтийн хаяг</Text>

        {isLoadingAddresses ? (
          <ActivityIndicator size="small" color="#6a11cb" />
        ) : addresses.length > 0 ? (
          <View>
            {!selectedAddressId && !useNewAddress && (
              <View style={styles.addressOptionsContainer}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={openAddressModal}
                >
                  <Icon name="location-outline" size={20} color="#6a11cb" />
                  <Text style={styles.optionButtonText}>
                    Хадгалсан хаягаас сонгох
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleUseNewAddress}
                >
                  <Icon name="add-circle-outline" size={20} color="#6a11cb" />
                  <Text style={styles.optionButtonText}>Шинэ хаяг оруулах</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedAddressId && !useNewAddress && (
              <View style={styles.selectedAddressContainer}>
                <Text style={styles.selectedAddressTitle}>Сонгосон хаяг:</Text>
                <Text style={styles.selectedAddressText}>
                  {receiverName}, {phone}
                </Text>
                <Text style={styles.selectedAddressText}>
                  {province}, {district}
                  {khoroo ? `, ${khoroo}` : ""}
                </Text>
                <Text style={styles.selectedAddressText}>{address}</Text>
                {additionalInfo && (
                  <Text style={styles.selectedAddressText}>
                    {additionalInfo}
                  </Text>
                )}
                <View style={styles.addressActions}>
                  <TouchableOpacity
                    style={styles.changeAddressButton}
                    onPress={openAddressModal}
                  >
                    <Text style={styles.changeAddressText}>
                      Өөр хаяг сонгох
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.changeAddressButton}
                    onPress={handleUseNewAddress}
                  >
                    <Text style={styles.changeAddressText}>
                      Шинэ хаяг оруулах
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noAddressesContainer}>
            <Text style={styles.noAddressesText}>
              Хадгалсан хаяг байхгүй байна. Шинэ хаяг оруулна уу.
            </Text>
            <TouchableOpacity
              style={styles.addNewAddressButton}
              onPress={handleUseNewAddress}
            >
              <Icon name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.addNewAddressText}>Шинэ хаяг оруулах</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Address Form - Only show if no address is selected or user wants to use a new address */}
      {(!selectedAddressId || useNewAddress) && (
        <>
          <Text style={styles.label}>Хүлээн авагчийн нэр</Text>
          <TextInput
            style={styles.input}
            placeholder="Хүлээн авагчийн нэрээ оруулна уу"
            value={receiverName}
            onChangeText={setReceiverName}
          />

          <Text style={styles.label}>Утасны дугаар</Text>
          <TextInput
            style={styles.input}
            placeholder="Утасны дугаараа оруулна уу"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Аймаг/Хот</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={province}
              onValueChange={(itemValue) => {
                setProvince(itemValue);
              }}
              style={Platform.OS === "ios" ? styles.pickerIOS : styles.picker}
            >
              <Picker.Item label="Аймаг/Хот сонгох" value="" />
              {provinces.map((item) => (
                <Picker.Item key={item} label={item} value={item} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Дүүрэг сонгох</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={district}
              onValueChange={(itemValue) => {
                setDistrict(itemValue);
                setKhoroo("");
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
              selectedValue={khoroo}
              onValueChange={setKhoroo}
              style={Platform.OS === "ios" ? styles.pickerIOS : styles.picker}
              enabled={!!district}
            >
              <Picker.Item label="Хороо сонгох" value="" />
              {district &&
                neighborhoods[district] &&
                neighborhoods[district].map((item) => (
                  <Picker.Item key={item} label={item} value={item} />
                ))}
            </Picker>
          </View>

          <Text style={styles.label}>Дэлгэрэнгүй хаяг</Text>
          <TextInput
            style={styles.input}
            placeholder="Дэлгэрэнгүй хаягаа оруулна уу"
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
        </>
      )}

      <TouchableOpacity
        style={[
          styles.checkoutButton,
          (!isFormValid() || isLoading) && styles.disabledButton,
        ]}
        onPress={handleCheckout}
        disabled={!isFormValid() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.checkoutButtonText}>
            {isLoading ? "Түр хүлээнэ үү..." : "Үргэлжлүүлэх"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Address Selection Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeAddressModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Хаяг сонгох</Text>
              <TouchableOpacity onPress={closeAddressModal}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalAddressList}>
              {addresses &&
                addresses.map((item) => renderAddressItem({ item }))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.useNewAddressModalButton}
                onPress={handleUseNewAddress}
              >
                <Text style={styles.useNewAddressModalText}>
                  Шинэ хаяг оруулах
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  // Address selection styles
  addressSelectionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  addressOptionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6a11cb",
  },
  optionButtonText: {
    color: "#6a11cb",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  selectedAddressContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedAddressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  selectedAddressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  addressActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  changeAddressButton: {
    padding: 10,
  },
  changeAddressText: {
    color: "#6a11cb",
    fontSize: 14,
    fontWeight: "bold",
  },
  noAddressesContainer: {
    alignItems: "center",
    padding: 20,
  },
  noAddressesText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
  },
  addNewAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6a11cb",
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  addNewAddressText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
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
  modalAddressList: {
    maxHeight: "70%",
  },
  addressItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedAddressItem: {
    borderColor: "#6a11cb",
    borderWidth: 2,
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
  modalActions: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  useNewAddressModalButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  useNewAddressModalText: {
    color: "#6a11cb",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CheckoutInfoScreen;
