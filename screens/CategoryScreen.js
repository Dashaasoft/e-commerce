import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Platform, // Platform-specific styles for shadow
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "./Header"; // Assuming Header component exists
import { MaterialIcons } from "@expo/vector-icons";

// Define colors for easier management and consistency
const COLORS = {
  primary: "#6C63FF", // Main interactive color
  primaryLight: "#E9E7FF", // Lighter shade for backgrounds/accents
  white: "#FFFFFF",
  black: "#1A1A1A", // Darker text for better contrast
  greyLight: "#F7F7F7", // Light background grey
  greyMedium: "#E0E0E0", // Medium grey for borders/inactive elements
  greyDark: "#888888", // Darker grey for secondary text
  danger: "#FF6B6B", // Optional for reset/cancel actions
};

// Define font styles for consistency
const FONTS = {
  h1: { fontSize: 26, fontWeight: "bold", color: COLORS.black },
  h2: { fontSize: 20, fontWeight: "600", color: COLORS.black },
  h3: { fontSize: 16, fontWeight: "600", color: COLORS.black },
  body: { fontSize: 16, color: COLORS.black },
  bodySecondary: { fontSize: 14, color: COLORS.greyDark },
  chip: { fontSize: 14, fontWeight: "500" },
  button: { fontSize: 16, fontWeight: "bold" },
};

const CategoryScreen = () => {
  const navigation = useNavigation();
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    fetch("http://10.150.35.107:5000/api/categories") // Use your actual IP/URL
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const formatted = data.map((item) => ({
          id: item._id,
          name: item.name,
          subCategories: item.types || [],
          genders: ["Men", "Women", "Unisex"], // Default genders
          sizes: (item.sizes || []).sort((a, b) => {
            const isANumber = !isNaN(Number(a));
            const isBNumber = !isNaN(Number(b));
            // Sort numbers numerically first
            if (isANumber && isBNumber) return Number(a) - Number(b);
            if (isANumber) return -1; // Numbers before strings
            if (isBNumber) return 1; // Strings after numbers
            // Then sort standard sizes
            const sizeOrder = { XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6 };
            return (
              (sizeOrder[a.toUpperCase()] || 99) -
              (sizeOrder[b.toUpperCase()] || 99)
            );
          }),
          isShoeCategory: item.name.toLowerCase().includes("shoes"),
          isClothingCategory: !item.name.toLowerCase().includes("shoes"), // Simplified logic
        }));
        setCategoryData(formatted);
      })
      .catch((error) => {
        console.error("Ангилал татахад алдаа гарлаа:", error);
        // Optionally show an error message to the user
      });
  }, []);

  // Reusable Filter Chip Component
  const FilterChip = ({ label, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const openModal = (category) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const resetFiltersAndClose = () => {
    setSelectedSubCategory(null);
    setSelectedGender(null);
    setSelectedSize(null);
    setModalVisible(false); // Close after resetting
  };

  const applyFilters = () => {
    if (!selectedCategory) return; // Safety check

    const params = {
      category: selectedCategory.name,
      ...(selectedSubCategory && { subCategory: selectedSubCategory }),
      ...(selectedGender && { gender: selectedGender }),
      ...(selectedSize && { size: selectedSize }),
      reset: false, // Not a full reset, just filtered
    };

    navigation.navigate("ProductList", params);
    closeModal(); // Close modal after navigating
  };

  const showAllProducts = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedGender(null);
    setSelectedSize(null);
    setModalVisible(false);
    navigation.navigate("ProductList", { reset: true });
  };

  const genderShortcuts = [
    { label: "🛍️ Бүгд", gender: null },
    { label: "👨 Эрэгтэй", gender: "Эрэгтэй" },
    { label: "👩 Эмэгтэй", gender: "Эмэгтэй" },
    { label: "✨ Unisex", gender: "Unisex" },
  ];

  // Helper to render filter sections in the modal
  const renderFilterSection = (
    title,
    items,
    selectedValue,
    setter,
    labelExtractor = (item) => item
  ) => {
    if (!items || items.length === 0) return null;

    return (
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>{title}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollContainer}
        >
          {items.map((item, idx) => {
            const label = labelExtractor(item);
            const value = item; // Assuming the item itself is the value (like 'Men', 'S', 'T-Shirt')
            return (
              <FilterChip
                key={`${title}-${idx}`} // More specific key
                label={label}
                selected={selectedValue === value}
                onPress={() => setter(selectedValue === value ? null : value)}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        navigation={navigation}
        showBackButton={false}
        showFilterButton={false}
        showBanner={false}
        showSearchButton={false}
        showCategoryButton={false}
      />
      <Text style={styles.title}>Ангилал</Text>

      {/* Gender Shortcuts */}
      <View style={styles.shortcutsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shortcutsScrollContent}
        >
          {genderShortcuts.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.shortcut}
              onPress={() =>
                navigation.navigate("ProductList", {
                  gender: item.gender,
                  reset: true, // Reset filters when using shortcut
                })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.shortcutText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category List */}
      <ScrollView contentContainerStyle={styles.listScrollContainer}>
        {categoryData.length === 0 && (
          <Text style={styles.loadingText}>Ачааллаж байна...</Text> // Loading indicator
        )}
        {categoryData.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryItem}
            onPress={() => openModal(cat)}
            activeOpacity={0.6}
          >
            <Text style={styles.categoryText}>{cat.name}</Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={showAllProducts} // Show all products on Android back
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={showAllProducts} // Close modal and show all products when tapping outside
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            {/* X (close) button in the top right */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={showAllProducts}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={26} color="#888" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {selectedCategory?.name || "Шүүлтүүр"}
            </Text>

            {renderFilterSection(
              "Дэд ангилал",
              selectedCategory?.subCategories,
              selectedSubCategory,
              setSelectedSubCategory
            )}

            {selectedCategory?.genders &&
              (selectedCategory.isShoeCategory ||
                selectedCategory.isClothingCategory) &&
              renderFilterSection(
                "Хүйс",
                selectedCategory.genders,
                selectedGender,
                setSelectedGender,
                (g) =>
                  g === "Men" ? "Эрэгтэй" : g === "Women" ? "Эмэгтэй" : "Unisex" // Label extractor for gender
              )}

            {renderFilterSection(
              selectedCategory?.isShoeCategory
                ? "Гутлын хэмжээ"
                : "Хувцасны хэмжээ",
              selectedCategory?.sizes,
              selectedSize,
              setSelectedSize
            )}

            {/* Action Buttons */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.resetButton]}
                onPress={showAllProducts}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, styles.resetButtonText]}>
                  Цэвэрлэх
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyFilters}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, styles.applyButtonText]}>
                  Үзэх
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white, // Use white background
  },
  title: {
    ...FONTS.h1, // Use defined font style
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
  },
  // --- Shortcuts ---
  shortcutsContainer: {
    marginBottom: 5, // Reduced margin slightly
  },
  shortcutsScrollContent: {
    paddingHorizontal: 15, // Adjust padding
    paddingVertical: 10,
  },
  shortcut: {
    backgroundColor: COLORS.primaryLight, // Use light primary color
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20, // Softer corners
    marginRight: 12,
    minWidth: 100, // Adjust as needed
    alignItems: "center",
    justifyContent: "center",
  },
  shortcutText: {
    ...FONTS.chip, // Use chip font style
    color: COLORS.primary, // Use primary color for text
    fontWeight: "600",
  },
  // --- Category List ---
  listScrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20, // Add padding at the bottom
  },
  loadingText: {
    ...FONTS.bodySecondary,
    textAlign: "center",
    marginTop: 30,
  },
  categoryItem: {
    backgroundColor: COLORS.greyLight, // Lighter grey background
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 12, // Slightly larger radius
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Shadow for depth (Platform specific)
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryText: {
    ...FONTS.body, // Use body font style
    fontWeight: "500", // Slightly bolder
  },
  // --- Modal ---
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)", // Slightly darker overlay
  },
  modalContent: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 30, // More space at the bottom for buttons
    borderTopLeftRadius: 25, // Larger radius for modern feel
    borderTopRightRadius: 25,
    maxHeight: "75%", // Limit modal height
  },
  modalTitle: {
    ...FONTS.h2, // Use h2 style
    marginBottom: 20,
    textAlign: "center", // Center title
  },
  filterSection: {
    marginBottom: 15, // Space between filter sections
  },
  filterTitle: {
    ...FONTS.h3, // Use h3 style
    marginBottom: 12,
  },
  chipScrollContainer: {
    paddingBottom: 5, // Ensure chips don't get cut off
  },
  // --- Filter Chips ---
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: COLORS.greyLight,
    marginRight: 10,
    marginBottom: 10, // Added margin bottom for wrapping case
    borderWidth: 1,
    borderColor: COLORS.greyMedium, // Subtle border
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    ...FONTS.chip, // Use chip font style
    color: COLORS.black,
  },
  chipTextSelected: {
    color: COLORS.white,
    fontWeight: "600", // Bolder selected text
  },
  // --- Modal Buttons ---
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30, // Increased space before buttons
    paddingHorizontal: 5, // Add slight horizontal padding if needed
  },
  modalButton: {
    flex: 1, // Make buttons take equal width
    paddingVertical: 15,
    borderRadius: 12, // Consistent radius
    alignItems: "center",
    justifyContent: "center",
  },
  resetButton: {
    backgroundColor: COLORS.greyLight,
    marginRight: 10, // Space between buttons
    borderWidth: 1,
    borderColor: COLORS.greyMedium,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 10, // Space between buttons
  },
  modalButtonText: {
    ...FONTS.button, // Use button font style
  },
  resetButtonText: {
    color: COLORS.black, // Dark text for reset
    fontWeight: "600",
  },
  applyButtonText: {
    color: COLORS.white, // White text for apply
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 6,
  },
});

export default CategoryScreen;
