// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Text,
//   StatusBar,
//   Platform,
//   Animated,
//   Dimensions,
// } from "react-native";
// import Icon from "react-native-vector-icons/FontAwesome";
// import { LinearGradient } from "expo-linear-gradient";
// import { useCart } from "../context/CartContext";

// const { width } = Dimensions.get("window");
// const BANNER_HEIGHT = 180;

// const Header = ({
//   toggleSearch,
//   toggleFilterModal,
//   navigation,
//   showLogo = true,
//   showBanner = true,
//   showFilterButton = true,
//   showSearchButton = true,
//   showBackButton = true,
//   isFilterActive = false,
// }) => {
//   const { cartItems } = useCart();
//   const [statusBarStyle, setStatusBarStyle] = useState("dark-content");

//   // Animated values
//   const bannerScale = useRef(new Animated.Value(1.2)).current;
//   const bannerOpacity = useRef(new Animated.Value(0)).current;
//   const headerHeight = useRef(new Animated.Value(0)).current;
//   const cartBounce = useRef(new Animated.Value(1)).current;

//   // Status bar animation
//   const statusBarTranslate = useRef(new Animated.Value(-30)).current;

//   useEffect(() => {
//     if (showBanner) {
//       // Animate banner entrance with zoom effect
//       Animated.parallel([
//         Animated.timing(bannerScale, {
//           toValue: 1,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(bannerOpacity, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.timing(headerHeight, {
//           toValue: 1,
//           duration: 600,
//           useNativeDriver: false,
//         }),
//         Animated.timing(statusBarTranslate, {
//           toValue: 0,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//       ]).start();

//       // Set light status bar when banner is shown (assuming banner is dark)
//       setStatusBarStyle("light-content");
//     } else {
//       setStatusBarStyle("dark-content");
//     }
//   }, [showBanner]);

//   // Cart badge animation when items change
//   useEffect(() => {
//     if (cartItems.length > 0) {
//       Animated.sequence([
//         Animated.timing(cartBounce, {
//           toValue: 1.3,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//         Animated.spring(cartBounce, {
//           toValue: 1,
//           friction: 4,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }
//   }, [cartItems.length]);

//   // Status bar height for different platforms
//   const STATUS_BAR_HEIGHT =
//     Platform.OS === "ios" ? 44 : StatusBar.currentHeight;

//   // Calculate header opacity based on banner position
//   const headerBgOpacity = headerHeight.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0.5, 1],
//   });

//   return (
//     <View style={styles.container}>
//       {/* Animated Status Bar Background */}
//       <Animated.View
//         style={[
//           styles.statusBarBg,
//           {
//             height: STATUS_BAR_HEIGHT,
//             transform: [{ translateY: statusBarTranslate }],
//           },
//         ]}
//       >
//         <StatusBar
//           translucent
//           backgroundColor="transparent"
//           barStyle={statusBarStyle}
//         />
//       </Animated.View>

//       {/* Banner with Gradient Overlay */}
//       {showBanner && (
//         <Animated.View
//           style={[
//             styles.bannerContainer,
//             {
//               opacity: bannerOpacity,
//               transform: [{ scale: bannerScale }],
//               height: BANNER_HEIGHT,
//             },
//           ]}
//         >
//           <Image
//             source={require("../image/banner.jpg")}
//             style={styles.bannerImage}
//             resizeMode="cover"
//           />
//           <LinearGradient
//             colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]}
//             style={styles.bannerGradient}
//           />

//           {/* Banner Content - Optional text overlay on banner */}
//           <View style={styles.bannerContent}>
//             <Text style={styles.bannerTitle}>Discover New Arrivals</Text>
//             <Text style={styles.bannerSubtitle}>
//               Shop the latest collection
//             </Text>
//           </View>
//         </Animated.View>
//       )}

//       {/* Header */}
//       <Animated.View
//         style={[
//           styles.header,
//           {
//             opacity: headerBgOpacity,
//             borderBottomWidth: showBanner ? 0 : 1,
//             backgroundColor: showBanner ? "rgba(255,255,255,0.95)" : "#fff",
//           },
//         ]}
//       >
//         {/* Back button */}
//         {showBackButton && navigation.canGoBack() && (
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backButton}
//           >
//             <View style={styles.iconCircle}>
//               <Icon name="arrow-left" size={18} color="#333" />
//             </View>
//           </TouchableOpacity>
//         )}

//         {/* Logo */}
//         {showLogo && (
//           <View style={styles.logoContainer}>
//             <Image
//               source={require("../assets/EZ-commerce-Logo-black.png")}
//               style={styles.logo}
//               resizeMode="contain"
//             />
//           </View>
//         )}

//         {/* Icons Container */}
//         <View style={styles.iconsContainer}>
//           {/* Search button with pulsing effect when active */}
//           {showSearchButton && (
//             <TouchableOpacity onPress={toggleSearch} style={styles.iconButton}>
//               <View style={styles.iconCircle}>
//                 <Icon name="search" size={18} color="#333" />
//               </View>
//             </TouchableOpacity>
//           )}

//           {/* Filter button with indicator */}
//           {showFilterButton && (
//             <TouchableOpacity
//               onPress={toggleFilterModal}
//               style={styles.iconButton}
//             >
//               <View
//                 style={[
//                   styles.iconCircle,
//                   isFilterActive && styles.activeIconCircle,
//                 ]}
//               >
//                 <Icon
//                   name="sliders"
//                   size={18}
//                   color={isFilterActive ? "#fff" : "#333"}
//                 />
//               </View>
//               {isFilterActive && <View style={styles.activeFilterIndicator} />}
//             </TouchableOpacity>
//           )}

//           {/* Shopping Cart button with bounce animation */}
//           <TouchableOpacity
//             style={styles.cartIcon}
//             onPress={() => navigation.navigate("ShoppingCartTab")}
//           >
//             <View style={styles.iconCircle}>
//               <Icon name="shopping-cart" size={18} color="#333" />
//             </View>

//             {cartItems.length > 0 && (
//               <Animated.View
//                 style={[
//                   styles.cartBadge,
//                   { transform: [{ scale: cartBounce }] },
//                 ]}
//               >
//                 <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
//               </Animated.View>
//             )}
//           </TouchableOpacity>
//         </View>
//       </Animated.View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#fff",
//   },
//   statusBarBg: {
//     backgroundColor: "rgba(0,0,0,0.5)",
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//   },
//   bannerContainer: {
//     position: "relative",
//     overflow: "hidden",
//   },
//   bannerImage: {
//     width: "100%",
//     height: "100%",
//     position: "absolute",
//   },
//   bannerGradient: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     top: 0,
//     bottom: 0,
//   },
//   bannerContent: {
//     position: "absolute",
//     bottom: 20,
//     left: 20,
//     right: 20,
//   },
//   bannerTitle: {
//     color: "#fff",
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 5,
//     textShadowColor: "rgba(0, 0, 0, 0.75)",
//     textShadowOffset: { width: -1, height: 1 },
//     textShadowRadius: 10,
//   },
//   bannerSubtitle: {
//     color: "#fff",
//     fontSize: 16,
//     textShadowColor: "rgba(0, 0, 0, 0.75)",
//     textShadowOffset: { width: -1, height: 1 },
//     textShadowRadius: 10,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderBottomColor: "#eee",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     zIndex: 5,
//   },
//   backButton: {
//     marginRight: 5,
//   },
//   logoContainer: {
//     flex: 1,
//     alignItems: "center",
//   },
//   logo: {
//     width: 130,
//     height: 40,
//   },
//   iconsContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginLeft: 15,
//   },
//   iconButton: {
//     padding: 8,
//     marginLeft: 5,
//     position: "relative",
//   },
//   iconCircle: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#f2f2f2",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 1,
//     elevation: 2,
//   },
//   activeIconCircle: {
//     backgroundColor: "#6C63FF",
//   },
//   activeFilterIndicator: {
//     position: "absolute",
//     right: 5,
//     top: 5,
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: "#FF4757",
//     borderWidth: 1,
//     borderColor: "#fff",
//   },
//   cartIcon: {
//     marginLeft: 5,
//     padding: 8,
//     position: "relative",
//   },
//   cartBadge: {
//     position: "absolute",
//     right: 2,
//     top: 2,
//     backgroundColor: "#FF4757",
//     borderRadius: 12,
//     width: 22,
//     height: 22,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#fff",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1,
//   },
//   cartBadgeText: {
//     color: "white",
//     fontSize: 10,
//     fontWeight: "bold",
//   },
// });

// export default Header;

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
  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
  };

  // Fetch products data
  const fetchProducts = useCallback(() => {
    setLoading(true);
    fetch("http://10.150.33.23:5000/api/products")
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
    fetch("http://10.150.33.23:5000/api/categories")
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
  // In ProductList.js
  useEffect(() => {
    if (route.params?.reset) {
      setSelectedCategory("Бүгд");
      setSortOption(null);
    } else if (route.params?.category) {
      setSelectedCategory(route.params.category);
    }
  }, [route.params]);
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
  };

  // Handle sort option selection
  const handleSortOptionPress = (option) => {
    setSortOption(option);
    setIsFilterModalVisible(false);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "Бүгд" || product.category === selectedCategory;

      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
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

  return (
    <View style={styles.container}>
      {/* Header component */}
      <Header
        toggleSearch={toggleSearch}
        navigation={navigation}
        showFilterButton={true}
        showBackButton={false}
        isFilterActive={isFilterActive} // Шүүлтүүр идэвхтэй эсэхийг дамжуулна
        toggleFilterModal={toggleFilterModal}
        onSearchSubmit={handleSearchSubmit} // Хайлтын функцыг дамжуулах
        isProductList={false} // New prop to control background color
      />

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
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryItem,
                selectedCategory === item.name && styles.selectedCategoryItem,
              ]}
              onPress={() => handleCategoryPress(item.name)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.name && styles.selectedCategoryText,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

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
                  Баталгаажсан захиалга дэлгүүрээс ирж авна. Дэлгүүр өдрийн
                  11:00-19:00 цагийн хооронд ажиллана.
                </Text>
              </View>
              <View style={styles.footerItem}>
                <Icon name="calendar-outline" size={20} color="#6C63FF" />
                <Text style={styles.footerText}>
                  Хүргэлт Ням гаригт хийгдэх боломжтой байна.
                </Text>
              </View>
              <View style={styles.footerItem}>
                <Icon name="location-outline" size={20} color="#6C63FF" />
                <Text style={styles.footerText}>
                  Хөдөө орон нутагруу хүргэлт хийгдэхгүй.
                </Text>
              </View>
              <View style={styles.footerItem}>
                <Icon name="alert-circle-outline" size={20} color="#6C63FF" />
                <Text style={styles.footerText}>
                  Хүргэлтээр очсон барааг буцаах, өөр төрлийн бараагаар солих
                  боломжгүй.
                </Text>
              </View>
              <Text style={styles.footerTitle}>ТӨЛБӨРИЙН МЭДЭЭЛЭЛ</Text>
              <View style={styles.footerItem}>
                <Icon name="card-outline" size={20} color="#6C63FF" />
                <Text style={styles.footerText}>
                  Голомт Банк 3005154045 "Кидалт ХХК" тоот данс / Гүйлгээний
                  утга дээр зөвхөн захиалгын КОД, Утасны дугаараа бичиж
                  төлбөрийг шилжүүлэх.
                </Text>
              </View>
              <View style={styles.footerItem}>
                <Icon name="warning-outline" size={20} color="#6C63FF" />
                <Text style={styles.footerText}>
                  Төлбөр хийгдээгүй тохиолдолд захиалга цуцлагдахыг анхаарна уу.
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
    paddingVertical: 10,
    elevation: 3,
  },
  categoryItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
  },
  selectedCategoryItem: {
    backgroundColor: "#6C63FF",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  selectedCategoryText: {
    color: "#fff",
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
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
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
    marginTop: 10,
    gap: 15,
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
});

export default ProductList;

// import React, { useEffect, useState, useRef, useCallback } from "react";
// import {
//   Text,
//   Image,
//   View,
//   FlatList,
//   ActivityIndicator,
//   TouchableOpacity,
//   TextInput,
//   Keyboard,
//   StyleSheet,
//   Animated,
//   Easing,
//   Dimensions,
//   ScrollView,
// } from "react-native";
// import Header from "./Header";
// import Icon from "react-native-vector-icons/Ionicons";
// import { Linking } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";

// const { width } = Dimensions.get("window");
// const ITEM_WIDTH = width / 2 - 16; // Half screen minus margin
// const RECENT_ITEM_WIDTH = ITEM_WIDTH; // 70% of screen width for recent items

// const ProductList = ({ navigation, route }) => {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([{ _id: 0, name: "Бүгд" }]);
//   const [selectedCategory, setSelectedCategory] = useState(
//     route.params?.category || "Бүгд"
//   );
//   const [loading, setLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isSearchVisible, setIsSearchVisible] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const searchInputRef = useRef(null);

//   // Animation related
//   const scrollX = useRef(new Animated.Value(0)).current;
//   const recentScrollRef = useRef(null);

//   const fetchProducts = useCallback(() => {
//     setLoading(true);
//     fetch("http://192.168.1.7:5000/api/products")
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Network response was not ok");
//         }
//         return response.json();
//       })
//       .then((data) => {
//         // Sort by creation date to get newest first
//         const sortedProducts = [...data].sort(
//           (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//         );
//         setProducts(sortedProducts);
//         setLoading(false);
//         setIsRefreshing(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching data: ", error.message);
//         setLoading(false);
//         setIsRefreshing(false);
//       });
//   }, []);

//   const fetchCategories = useCallback(() => {
//     fetch("http://192.168.1.7:5000/api/categories")
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Network response was not ok");
//         }
//         return response.json();
//       })
//       .then((data) => {
//         setCategories([{ _id: 0, name: "Бүгд" }, ...data]);
//         if (route.params?.category) {
//           setSelectedCategory(route.params.category);
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching categories: ", error.message);
//       });
//   }, [route.params?.category]);

//   useEffect(() => {
//     fetchProducts();
//     fetchCategories();
//   }, [fetchProducts, fetchCategories]);

//   // Auto-scrolling effect for recently added products
//   // Replace your current auto-scrolling useEffect with this version
//   useEffect(() => {
//     let isMounted = true;
//     let timeoutId;

//     const startAutoScroll = () => {
//       if (
//         !isMounted ||
//         !recentScrollRef.current ||
//         products.length === 0 ||
//         selectedCategory !== "Бүгд" ||
//         searchQuery !== ""
//       ) {
//         return;
//       }

//       const recentItems = products.slice(0, 4);
//       const totalContentWidth = recentItems.length * RECENT_ITEM_WIDTH;
//       const maxScroll = Math.max(totalContentWidth - width + 32, 0);

//       const SCROLL_DURATION = 2000;
//       const SCROLL_INTERVAL = 40;

//       let scrollPosition = 0;
//       let scrollDirection = 1;

//       const animateScroll = () => {
//         if (!isMounted || !recentScrollRef.current) {
//           return;
//         }

//         scrollPosition +=
//           (scrollDirection * maxScroll * SCROLL_INTERVAL) / SCROLL_DURATION;

//         if (scrollPosition >= maxScroll) {
//           scrollPosition = maxScroll;
//           scrollDirection = -1;
//         } else if (scrollPosition <= 0) {
//           scrollPosition = 0;
//           scrollDirection = 1;
//         }

//         recentScrollRef.current.scrollTo({
//           x: scrollPosition,
//           animated: false,
//         });

//         if (isMounted) {
//           timeoutId = setTimeout(animateScroll, SCROLL_INTERVAL);
//         }
//       };

//       animateScroll();
//     };

//     startAutoScroll();

//     return () => {
//       isMounted = false;
//       if (timeoutId) {
//         clearTimeout(timeoutId);
//       }
//     };
//   }, [products, selectedCategory, searchQuery, width]);

//   const toggleSearch = () => {
//     setIsSearchVisible((prev) => !prev);
//     if (!isSearchVisible) {
//       setTimeout(() => {
//         searchInputRef.current?.focus();
//       }, 100);
//     } else {
//       Keyboard.dismiss();
//       setSearchQuery("");
//     }
//   };

//   const onRefresh = () => {
//     setIsRefreshing(true);
//     fetchProducts();
//   };

//   const handleCategoryPress = (category) => {
//     setSelectedCategory(category);
//   };

//   const filteredProducts = products.filter((product) => {
//     const matchesCategory =
//       selectedCategory === "Бүгд" || product.category === selectedCategory;
//     const matchesSearch =
//       searchQuery === "" ||
//       product.name.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   // Get recently added products (first 4 newest items)
//   const recentlyAdded = products.slice(0, 4);

//   // Render a recent product item in the horizontal list
//   const renderRecentItem = (item) => (
//     <TouchableOpacity
//       key={`recent-${item._id}`}
//       style={styles.recentCard}
//       onPress={() => navigation.navigate("ProductDetails", { product: item })}
//       activeOpacity={0.9}
//     >
//       <Image
//         source={{ uri: item.image.url }}
//         style={styles.recentProductImage}
//         resizeMode="cover"
//       />
//       <View style={styles.recentTextContainer}>
//         <Text style={styles.productName} numberOfLines={1}>
//           {item.name}
//         </Text>
//         <Text style={styles.productPrice}>{item.price.toLocaleString()}₮</Text>
//         {item.createdAt &&
//           new Date(item.createdAt) >
//             new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
//             <View style={styles.newBadge}>
//               <Text style={styles.newBadgeText}>Шинэ</Text>
//             </View>
//           )}
//       </View>
//     </TouchableOpacity>
//   );

//   // Render a product item in the main grid
//   const renderProductItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() => navigation.navigate("ProductDetails", { product: item })}
//       activeOpacity={0.9}
//     >
//       <Image
//         source={{ uri: item.image.url }}
//         style={styles.productImage}
//         resizeMode="cover"
//       />
//       <View style={styles.textContainer}>
//         <Text style={styles.productName} numberOfLines={1}>
//           {item.name}
//         </Text>
//         <Text style={styles.productPrice}>{item.price.toLocaleString()}₮</Text>
//         {item.createdAt &&
//           new Date(item.createdAt) >
//             new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
//             <View style={styles.newBadge}>
//               <Text style={styles.newBadgeText}>Шинэ</Text>
//             </View>
//           )}
//       </View>
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#6C63FF" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Header toggleSearch={toggleSearch} navigation={navigation} />

//       {isSearchVisible && (
//         <View style={styles.searchContainer}>
//           <TextInput
//             ref={searchInputRef}
//             style={styles.searchInput}
//             placeholder="Бүтээгдэхүүн хайх..."
//             placeholderTextColor="#999"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//           <TouchableOpacity onPress={toggleSearch} style={styles.searchClose}>
//             <Icon name="close" size={24} color="#666" />
//           </TouchableOpacity>
//         </View>
//       )}

//       <View style={styles.categoryContainer}>
//         <FlatList
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           data={categories}
//           keyExtractor={(item) => item._id.toString()}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               style={[
//                 styles.categoryItem,
//                 selectedCategory === item.name && styles.selectedCategoryItem,
//               ]}
//               onPress={() => handleCategoryPress(item.name)}
//             >
//               <Text
//                 style={[
//                   styles.categoryText,
//                   selectedCategory === item.name && styles.selectedCategoryText,
//                 ]}
//               >
//                 {item.name}
//               </Text>
//             </TouchableOpacity>
//           )}
//         />
//       </View>

//       {/* Main ScrollView to enable scrolling for everything */}
//       <ScrollView
//         contentContainerStyle={styles.scrollViewContent}
//         showsVerticalScrollIndicator={false}
//         refreshing={isRefreshing}
//         onRefresh={onRefresh}
//       >
//         {recentlyAdded.length > 0 &&
//           selectedCategory === "Бүгд" &&
//           searchQuery === "" && (
//             <>
//               <View style={styles.sectionHeader}>
//                 <Text style={styles.sectionTitle}>Сүүлд нэмэгдсэн</Text>
//               </View>

//               {/* Horizontal scrolling recent products */}
//               <ScrollView
//                 ref={recentScrollRef}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={[
//                   styles.recentScrollContent,
//                   { paddingRight: width * 0.1 },
//                 ]}
//                 pagingEnabled={false}
//                 snapToInterval={RECENT_ITEM_WIDTH}
//                 decelerationRate="fast"
//                 scrollEventThrottle={16}
//                 onScroll={Animated.event(
//                   [{ nativeEvent: { contentOffset: { x: scrollX } } }],
//                   { useNativeDriver: false }
//                 )}
//               >
//                 {recentlyAdded.map((item) => renderRecentItem(item))}
//               </ScrollView>
//             </>
//           )}

//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>
//             {selectedCategory === "Бүгд"
//               ? "Бүх бүтээгдэхүүн"
//               : selectedCategory}
//           </Text>
//         </View>

//         {/* Main product grid */}
//         <View style={styles.productsGrid}>
//           {filteredProducts.length === 0 ? (
//             <View style={styles.emptyContainer}>
//               <Icon name="search-outline" size={50} color="#ccc" />
//               <Text style={styles.emptyText}>
//                 {searchQuery
//                   ? "Хайлтын илэрц олдсонгүй"
//                   : "Бүтээгдэхүүн байхгүй байна"}
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.gridContainer}>
//               {filteredProducts.map((item) => (
//                 <View key={item._id.toString()} style={styles.gridItem}>
//                   {renderProductItem({ item })}
//                 </View>
//               ))}
//             </View>
//           )}
//         </View>

//         {/* Footer section */}
//         {filteredProducts.length > 0 && (
//           <View style={styles.footer}>
//             <Text style={styles.footerTitle}>ХҮРГЭЛТИЙН НӨХЦӨЛ</Text>
//             <View style={styles.footerItem}>
//               <Icon name="time-outline" size={20} color="#6C63FF" />
//               <Text style={styles.footerText}>
//                 Баталгаажсан захиалга дэлгүүрээс ирж авна. Дэлгүүр өдрийн
//                 11:00-19:00 цагийн хооронд ажиллана.
//               </Text>
//             </View>
//             <View style={styles.footerItem}>
//               <Icon name="calendar-outline" size={20} color="#6C63FF" />
//               <Text style={styles.footerText}>
//                 Хүргэлт Ням гаригт хийгдэх боломжтой байна.
//               </Text>
//             </View>
//             <View style={styles.footerItem}>
//               <Icon name="location-outline" size={20} color="#6C63FF" />
//               <Text style={styles.footerText}>
//                 Хөдөө орон нутагруу хүргэлт хийгдэхгүй.
//               </Text>
//             </View>
//             <View style={styles.footerItem}>
//               <Icon name="alert-circle-outline" size={20} color="#6C63FF" />
//               <Text style={styles.footerText}>
//                 Хүргэлтээр очсон барааг буцаах, өөр төрлийн бараагаар солих
//                 боломжгүй.
//               </Text>
//             </View>

//             <Text style={styles.footerTitle}>ТӨЛБӨРИЙН МЭДЭЭЛЭЛ</Text>
//             <View style={styles.footerItem}>
//               <Icon name="card-outline" size={20} color="#6C63FF" />
//               <Text style={styles.footerText}>
//                 Голомт Банк 3005154045 "Кидалт ХХК" тоот данс / Гүйлгээний утга
//                 дээр зөвхөн захиалгын КОД, Утасны дугаараа бичиж төлбөрийг
//                 шилжүүлэх.
//               </Text>
//             </View>
//             <View style={styles.footerItem}>
//               <Icon name="warning-outline" size={20} color="#6C63FF" />
//               <Text style={styles.footerText}>
//                 Төлбөр хийгдээгүй тохиолдолд захиалга цуцлагдахыг анхаарна уу.
//               </Text>
//             </View>

//             <View style={styles.socialContainer}>
//               <TouchableOpacity
//                 onPress={() =>
//                   Linking.openURL("https://www.facebook.com/Ts.Dashzeveg")
//                 }
//               >
//                 <Icon name="logo-facebook" size={30} color="#4267B2" />
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() =>
//                   Linking.openURL("https://www.instagram.com/supergunig/")
//                 }
//               >
//                 <Icon name="logo-instagram" size={30} color="#E4405F" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f9f9f9",
//   },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginHorizontal: 15,
//     marginBottom: 10,
//   },
//   searchInput: {
//     flex: 1,
//     height: 45,
//     borderColor: "#ddd",
//     borderWidth: 1,
//     borderRadius: 25,
//     paddingHorizontal: 20,
//     backgroundColor: "#fff",
//     fontSize: 15,
//     color: "#333",
//     paddingRight: 45,
//   },
//   searchClose: {
//     position: "absolute",
//     right: 15,
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   categoryContainer: {
//     paddingVertical: 12,
//     backgroundColor: "#fff",
//     elevation: 2,
//   },
//   categoryItem: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginHorizontal: 6,
//     borderRadius: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   selectedCategoryItem: {
//     backgroundColor: "#6C63FF",
//   },
//   categoryText: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#555",
//   },
//   selectedCategoryText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   card: {
// flex: 1,
// margin: 6,
// backgroundColor: "#fff",
// borderRadius: 12,
// overflow: "hidden",
// elevation: 3,
// shadowColor: "#000",
// shadowOffset: { width: 0, height: 2 },
// shadowOpacity: 0.1,
// shadowRadius: 4,
//   },
//   productImage: {
//     width: "100%",
//     height: 150,
//   },
//   textContainer: {
//     padding: 12,
//     position: "relative",
//   },
//   recentScrollContent: {
//     paddingHorizontal: 8,
//     paddingBottom: 16,
//     paddingRight: 16,
//   },
//   recentCard: {
//     width: RECENT_ITEM_WIDTH,
//     marginHorizontal: 8,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     overflow: "hidden",
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   recentProductImage: {
//     width: "100%",
//     height: 150,
//   },
//   recentTextContainer: {
//     padding: 12,
//     position: "relative",
//   },
//   productName: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 5,
//   },
//   productPrice: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#6C63FF",
//   },
//   newBadge: {
//     position: "absolute",
//     top: -15,
//     right: 10,
//     backgroundColor: "#FF4757",
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 10,
//   },
//   newBadgeText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "bold",
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#fff",
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#333",
//   },
//   scrollViewContent: {
//     flexGrow: 1,
//     paddingBottom: 100, // Adjust based on the footer height
//   },
//   productsGrid: {
//     flex: 1,
//   },
//   gridContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     paddingHorizontal: 2,
//   },
//   gridItem: {
//     width: "50%",
//     paddingVertical: 2,
//   },
//   emptyContainer: {
//     padding: 40,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   emptyText: {
//     fontSize: 16,
//     color: "#666",
//     marginTop: 10,
//   },
// footer: {
//   padding: 20,
//   backgroundColor: "#fff",
//   borderTopWidth: 1,
//   borderTopColor: "#eee",
//   marginTop: 20,
//   bottom: 0, // Ensures it stays at the bottom of the page
//   width: "100%", // To ensure it spans the full width
// },
// footerTitle: {
//   fontSize: 16,
//   fontWeight: "bold",
//   color: "#333",
//   marginTop: 15,
//   marginBottom: 10,
// },
// footerItem: {
//   flexDirection: "row",
//   marginBottom: 10,
//   alignItems: "flex-start",
// },
// footerText: {
//   flex: 1,
//   fontSize: 14,
//   color: "#555",
//   marginLeft: 10,
//   lineHeight: 20,
// },
// socialContainer: {
//   flexDirection: "row",
//   justifyContent: "center",
//   marginTop: 20,
//   gap: 20,
// },
// });

// export default ProductList;
