import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Text,
  Image,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Keyboard,
  StyleSheet,
  Modal,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import Header from "./Header";
import Icon from "react-native-vector-icons/Ionicons";
import { Linking } from "react-native";

const ProductList = ({ navigation, route }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ _id: 0, name: "Бүгд" }]);
  const [selectedCategory, setSelectedCategory] = useState(
    route.params?.category || "Бүгд"
  );
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState(null);
  const searchInputRef = useRef(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    category: null,
    subCategory: null,
    gender: null,
    size: null,
  });

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
  };

  // Fetch products data
  const fetchProducts = useCallback(() => {
    setLoading(true);
    fetch("http://192.168.36.181:5000/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
        setIsRefreshing(false);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error.message);
        setLoading(false);
        setIsRefreshing(false);
      });
  }, []);

  // Fetch categories data
  const fetchCategories = useCallback(() => {
    fetch("http://192.168.36.181:5000/api/categories")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Add "Бүгд" (All) category at the beginning
        setCategories([{ _id: 0, name: "Бүгд" }, ...data]);

        // If a category was passed via route params, select it
        if (route.params?.category) {
          setSelectedCategory(route.params.category);
        }
      })
      .catch((error) => {
        console.error("Error fetching categories: ", error.message);
      });
  }, [route.params?.category]);

  // Load data when component mounts
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Replace the route.params useEffect in ProductList.js
  useEffect(() => {
    if (!route.params) return;

    if (route.params.reset) {
      // Reset all filters
      setSelectedCategory("Бүгд");
      setSelectedSubCategory(null);
      setSortOption(null);
      return;
    }

    // Handle category selection
    if (route.params.category) {
      setSelectedCategory(route.params.category);

      // Find subcategories for this category
      const categoryProducts = products.filter(
        (p) => p.category === route.params.category
      );
      const subCats = [
        ...new Set(categoryProducts.map((p) => p.subCategory).filter(Boolean)),
      ];
      setSubCategories(subCats);
    }

    // Handle subcategory selection
    if (route.params.subCategory) {
      setSelectedSubCategory(route.params.subCategory);
    }

    // Additional filters will be applied directly in the filteredProducts variable
  }, [route.params, products]);
  // Toggle search visibility
  const toggleSearch = () => {
    setIsSearchVisible((prev) => !prev);
    if (!isSearchVisible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      Keyboard.dismiss();
      setSearchQuery("");
    }
  };

  // Toggle filter modal visibility
  const toggleFilterModal = () => {
    setIsFilterModalVisible(!isFilterModalVisible);
  };

  // Refresh data
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProducts();
  };

  // Handle category selection
  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null); // Дэд ангилалыг цэвэрлэх

    // Route params өөрчлөх
    if (category === "Бүгд") {
      navigation.setParams({
        ...route.params,
        category: undefined,
        subCategory: undefined,
      });
    } else {
      navigation.setParams({
        ...route.params,
        category: category,
        subCategory: undefined, // Дэд ангилалыг цэвэрлэх
      });
    }

    // Дэд ангилалуудыг шинэчлэх
    if (category !== "Бүгд") {
      const categoryProducts = products.filter((p) => p.category === category);
      const subCats = [
        ...new Set(categoryProducts.map((p) => p.subCategory).filter(Boolean)),
      ];
      setSubCategories(subCats);
    } else {
      setSubCategories([]);
    }
  };

  // Handle sort option selection
  const handleSortOptionPress = (option) => {
    setSortOption(option);
    setIsFilterModalVisible(false);
  };

  // Replace the filteredProducts variable in ProductList.js with this improved version
  const filteredProducts = products
    .filter((product) => {
      if (!route.params) return true;

      const { category, subCategory, gender, size } = route.params;

      const matchesCategory =
        !category || category === "Бүгд" || product.category === category;
      const matchesSubCategory =
        !subCategory || product.subCategory === subCategory;
      const matchesGender = !gender || product.gender === gender;

      let matchesSize = true;
      if (size) {
        if (product.category === "Shoes" || product.category === "Гутал") {
          matchesSize =
            product.sizeQuantity?.shoeSizes &&
            Object.keys(product.sizeQuantity.shoeSizes).includes(size);
        } else {
          matchesSize =
            product.sizeQuantity?.clothingSizes &&
            Object.keys(product.sizeQuantity.clothingSizes).includes(size);
        }
      }

      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        matchesCategory &&
        matchesSubCategory &&
        matchesGender &&
        matchesSize &&
        matchesSearch
      );
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "date_asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "date_desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  // Truncate product name if too long
  const truncateName = (text) => {
    return text.length > 15 ? text.substring(0, 15) + "..." : text;
  };
  // Add empty item if odd number of products
  const displayData = [...filteredProducts];
  if (displayData.length % 2 !== 0) {
    displayData.push({ _id: "empty", empty: true });
  }

  // Show loading spinner
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }
  const isFilterActive = sortOption !== null;

  // Add this new component for subcategories
  const SubCategoryList = () =>
    selectedCategory !== "Бүгд" && subCategories.length > 0 ? (
      <View style={styles.subCategoryContainer}>
        <View style={styles.subCategoryHeader}>
          <Icon name="list-outline" size={18} color="#666" />
          <Text style={styles.subCategoryTitle}>Дэд ангилал</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subCategoryScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.subCategoryItem,
              !selectedSubCategory && styles.selectedSubCategoryItem,
            ]}
            onPress={() => {
              setSelectedSubCategory(null);
              // Дэд ангилалыг арилгах
              navigation.setParams({
                ...route.params,
                subCategory: undefined,
              });
            }}
          >
            <Text
              style={[
                styles.subCategoryText,
                !selectedSubCategory && styles.selectedSubCategoryText,
              ]}
            >
              Бүгд
            </Text>
          </TouchableOpacity>
          {subCategories.map((subCat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.subCategoryItem,
                selectedSubCategory === subCat &&
                  styles.selectedSubCategoryItem,
              ]}
              onPress={() => {
                setSelectedSubCategory(subCat);
                // Дэд ангилалыг тохируулах
                navigation.setParams({
                  ...route.params,
                  subCategory: subCat,
                });
              }}
            >
              <Text
                style={[
                  styles.subCategoryText,
                  selectedSubCategory === subCat &&
                    styles.selectedSubCategoryText,
                ]}
              >
                {subCat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    ) : null;
  // Category-д харьяалагдах бүтээгдэхүүний тоог олох функц
  const getCategoryProductCount = (categoryName) => {
    if (categoryName === "Бүгд") return products.length;
    return products.filter((product) => product.category === categoryName)
      .length;
  };

  // Ангиллын мэдээллийг харуулах header
  const CategoryHeader = () => {
    const selectedCat = categories.find((cat) => cat.name === selectedCategory);
    if (!selectedCat) return null;

    const productCount = getCategoryProductCount(selectedCat.name);

    return (
      <View style={styles.categoryHeaderContainer}>
        <View style={styles.selectedCategoryWrapper}>
          <View style={styles.categoryRow}>
            <View style={styles.mainCategoryInfo}>
              <Text style={styles.selectedCategoryTitle}>
                {selectedCat.name === "Бүгд"
                  ? "Бүх бүтээгдэхүүн"
                  : selectedCat.name}
              </Text>
              <Text style={styles.productCountText}>
                {productCount} бүтээгдэхүүн
              </Text>
            </View>

            {selectedSubCategory && (
              <View style={styles.subCategoryChip}>
                <Text style={styles.subCategoryChipText}>
                  {selectedSubCategory}
                </Text>
                <TouchableOpacity
                  style={styles.removeSubCategoryButton}
                  onPress={() => {
                    setSelectedSubCategory(null);
                    navigation.setParams({
                      ...route.params,
                      subCategory: undefined,
                    });
                  }}
                >
                  <Icon name="close" size={16} color="#6C63FF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        {selectedCat.name !== "Бүгд" && (
          <TouchableOpacity
            style={styles.removeCategoryButton}
            onPress={() => {
              setSelectedCategory("Бүгд");
              setSelectedSubCategory(null);
              setSortOption(null);
              navigation.setParams({
                ...route.params,
                category: undefined,
                subCategory: undefined,
                gender: undefined,
                size: undefined,
                reset: true,
              });
            }}
          >
            <Icon name="close" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header component */}
      <Header
        toggleSearch={toggleSearch}
        navigation={navigation}
        showFilterButton={true}
        showBackButton={false}
        isFilterActive={isFilterActive}
        toggleFilterModal={toggleFilterModal}
        onSearchSubmit={handleSearchSubmit}
        isProductList={false}
      />

      {/* Add SubCategoryList component after the header */}
      <SubCategoryList />

      {/* Search input field */}
      {isSearchVisible && (
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Бүтээгдэхүүн хайх..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      )}

      {/* Categories section */}
      <CategoryHeader />

      {/* Products list */}
      <FlatList
        data={displayData}
        numColumns={2}
        columnWrapperStyle={styles.row}
        keyExtractor={(item, index) => item._id || `empty-${index}`}
        renderItem={({ item }) => {
          if (item.empty) {
            return <View style={styles.emptyItem} />;
          }
          return (
            <View style={styles.itemWrapper}>
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate("ProductDetails", { product: item })
                }
              >
                <Image
                  source={{ uri: item.image.url }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.textContainer}>
                  <Text style={styles.productName}>
                    {truncateName(item.name)}
                  </Text>
                  <Text style={styles.productPrice}>
                    {item.price.toLocaleString()}₮
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Хайлтын илэрц олдсонгүй"
                : "Бүтээгдэхүүн байхгүй байна"}
            </Text>
          </View>
        }
        ListFooterComponent={
          filteredProducts.length > 0 && (
            <View style={styles.footer}>
              <Text style={styles.footerTitle}>ХҮРГЭЛТИЙН НӨХЦӨЛ</Text>
              <View style={styles.footerItem}>
                <Icon name="time-outline" size={20} color="#6C63FF" />
                <Text style={styles.footerText}>
                  Захиалга дэлгүүрээс ирж авна (11:00-19:00 цагт).
                </Text>
              </View>
              <View style={styles.footerItem}>
                <Icon name="calendar-outline" size={20} color="#6C63FF" />
                <Text style={styles.footerText}>
                  Хүргэлт зөвхөн Ням гарагт хийгдэнэ.
                </Text>
              </View>
              <View style={styles.footerItem}>
                <Icon name="location-outline" size={20} color="#6C63FF" />
                <Text style={styles.footerText}>
                  Хөдөө орон нутагт хүргэлтгүй.
                </Text>
              </View>
              <View style={styles.footerItem}>
                <Icon name="alert-circle-outline" size={20} color="#6C63FF" />
                <Text style={styles.footerText}>
                  Бараа солих, буцаах боломжгүй.
                </Text>
              </View>

              <Text style={[styles.footerTitle, { marginTop: 15 }]}>
                ТӨЛБӨРИЙН МЭДЭЭЛЭЛ
              </Text>
              <View style={styles.footerItem}>
                <Icon name="card-outline" size={20} color="#6C63FF" />
                <Text style={styles.footerText}>
                  Голомт Банк: 3005154045 ("EZcomerce ХХК"). Гүйлгээний утга:
                  Захиалгын код, утасны дугаар.
                </Text>
              </View>
              <View style={styles.footerItem}>
                <Icon name="warning-outline" size={20} color="#6C63FF" />
                <Text style={styles.footerText}>
                  Төлбөр хийгдээгүй захиалга цуцлагдана.
                </Text>
              </View>

              <View style={styles.socialContainer}>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL("https://www.facebook.com/Ts.Dashzeveg")
                  }
                >
                  <Icon name="logo-facebook" size={30} color="#4267B2" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL("https://www.instagram.com/supergunig/")
                  }
                >
                  <Icon name="logo-instagram" size={30} color="#E4405F" />
                </TouchableOpacity>
              </View>
            </View>
          )
        }
      />
      {/* Filter modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsFilterModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Шүүлтүүр</Text>

              <Text style={styles.filterSectionTitle}>Үнээр эрэмбэлэх</Text>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  sortOption === "price_asc" && styles.selectedFilterOption,
                ]}
                onPress={() => handleSortOptionPress("price_asc")}
              >
                <Text style={styles.filterOptionText}>Хямд нь эхэндээ</Text>
                {sortOption === "price_asc" && (
                  <Icon name="checkmark" size={20} color="#6C63FF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  sortOption === "price_desc" && styles.selectedFilterOption,
                ]}
                onPress={() => handleSortOptionPress("price_desc")}
              >
                <Text style={styles.filterOptionText}>Үнэтэй нь эхэндээ</Text>
                {sortOption === "price_desc" && (
                  <Icon name="checkmark" size={20} color="#6C63FF" />
                )}
              </TouchableOpacity>

              <Text style={styles.filterSectionTitle}>Огноогоор эрэмбэлэх</Text>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  sortOption === "date_desc" && styles.selectedFilterOption,
                ]}
                onPress={() => handleSortOptionPress("date_desc")}
              >
                <Text style={styles.filterOptionText}>Шинэ нь эхэндээ</Text>
                {sortOption === "date_desc" && (
                  <Icon name="checkmark" size={20} color="#6C63FF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  sortOption === "date_asc" && styles.selectedFilterOption,
                ]}
                onPress={() => handleSortOptionPress("date_asc")}
              >
                <Text style={styles.filterOptionText}>Хуучин нь эхэндээ</Text>
                {sortOption === "date_asc" && (
                  <Icon name="checkmark" size={20} color="#6C63FF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetFilterButton}
                onPress={() => handleSortOptionPress(null)}
              >
                <Text style={styles.resetFilterButtonText}>
                  Шүүлтүүр арилгах
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

// Стилийн тодорхойлолт
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  searchInput: {
    height: 40,
    margin: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#333",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryContainer: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    minWidth: 100,
  },
  selectedCategoryItem: {
    backgroundColor: "#6C63FF",
    elevation: 3,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  selectedCategoryText: {
    color: "#fff",
    fontWeight: "600",
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  itemWrapper: {
    width: "48%",
    marginBottom: 10,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  textContainer: {
    alignItems: "flex-start",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6C63FF",
  },
  footer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: 15,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 30,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 10,
    flex: 1,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    gap: 20,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: "70%",
  },
  modalContent: {
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginTop: 15,
    marginBottom: 10,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },
  selectedFilterOption: {
    backgroundColor: "#e6e1ff",
    borderColor: "#6C63FF",
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 15,
    color: "#333",
  },
  resetFilterButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#6C63FF",
    borderRadius: 10,
    alignItems: "center",
  },
  resetFilterButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  activeFilterIndicator: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C63FF",
  },
  listContent: {
    backgroundColor: "#fff", // White background for the product list
    paddingTop: 10, // Optional for some padding at the top
  },
  subCategoryContainer: {
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  subCategoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
  },
  selectedSubCategoryItem: {
    backgroundColor: "#6C63FF",
  },
  subCategoryText: {
    fontSize: 14,
    color: "#666",
  },
  selectedSubCategoryText: {
    color: "#fff",
  },
  categoryInfoContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  categoryInfoText: {
    fontSize: 14,
    color: "#666",
  },
  categoryHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
  },
  selectedCategoryWrapper: {
    flex: 1,
  },
  selectedCategoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productCountText: {
    fontSize: 13,
    color: "#666",
  },
  removeCategoryButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    elevation: 2,
  },
  subCategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  subCategoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
  },
  subCategoryScrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  mainCategoryInfo: {
    flex: 1,
  },
  subCategoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  subCategoryChipText: {
    fontSize: 14,
    color: "#666",
    marginRight: 6,
  },
  removeSubCategoryButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProductList;
