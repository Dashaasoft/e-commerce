import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  StatusBar,
  Platform,
  Animated,
  SafeAreaView,
  TextInput,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useCart } from "../context/CartContext";

const Header = ({
  toggleSearch,
  toggleFilterModal,
  navigation,
  showLogo = true,
  showBanner = true,
  showFilterButton = true,
  showSearchButton = true,
  showBackButton = true,
  showCategoryButton = true,
  isFilterActive = false,
  onSearchSubmit,
}) => {
  const { cartItems } = useCart();
  const bannerYPosition = useRef(new Animated.Value(-150)).current;
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchInputRef = useRef(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const banners = [
    require("../image/banner.jpg"),
    require("../image/banner#.jpg"),
    require("../image/banner1.jpg"),
    require("../image/banner6.jpg"),
  ];

  useEffect(() => {
    if (showBanner) {
      Animated.timing(bannerYPosition, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showBanner]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change banner every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Get status bar height for proper spacing
  const statusBarHeight = Platform.OS === "ios" ? 50 : StatusBar.currentHeight;

  const handleToggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (!searchVisible) {
      // When opening search, focus the input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // When closing search, clear the text
      setSearchText("");
      if (onSearchSubmit) {
        onSearchSubmit("");
      }
    }
  };

  const handleCategoryPress = () => {
    navigation.navigate("CategoryScreen");
  };

  // This effect will trigger search as user types
  useEffect(() => {
    if (onSearchSubmit) {
      onSearchSubmit(searchText);
    }
  }, [searchText, onSearchSubmit]);

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Banner with overlay icons */}
      <View style={styles.bannerContainer}>
        {showBanner ? (
          <View style={styles.bannerWrapper}>
            <Animated.View
              style={[
                styles.banner,
                { transform: [{ translateY: bannerYPosition }] },
              ]}
            >
              {banners.map((banner, index) => (
                <Animated.Image
                  key={index}
                  source={banner}
                  style={[
                    styles.bannerImage,
                    {
                      opacity: currentBannerIndex === index ? 1 : 0,
                    },
                  ]}
                  resizeMode="cover"
                />
              ))}
            </Animated.View>
            <View style={styles.pagination}>
              {banners.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentBannerIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.placeholderBanner} />
        )}

        {/* Overlay Header */}
        <SafeAreaView
          style={[styles.overlayHeader, { paddingTop: statusBarHeight }]}
        >
          <View style={styles.headerContent}>
            {/* Left Section - Category Button and Back Button */}
            <View style={styles.leftSection}>
              {showCategoryButton && (
                <TouchableOpacity
                  onPress={handleCategoryPress}
                  style={styles.categoryButton}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Icon name="bars" size={20} color="#000000" />
                </TouchableOpacity>
              )}

              {showBackButton &&
                navigation &&
                navigation.canGoBack &&
                navigation.canGoBack() && (
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  >
                    <Icon name="arrow-left" size={20} color="#000000" />
                  </TouchableOpacity>
                )}
            </View>

            {/* Search Input (Visible when search is active) */}
            {searchVisible && (
              <View style={styles.searchContainer}>
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Хайх..."
                  placeholderTextColor="#CCCCCC"
                  value={searchText}
                  onChangeText={setSearchText}
                  autoCapitalize="none"
                />
                {searchText.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                      setSearchText("");
                    }}
                  >
                    <Icon name="times-circle" size={16} color="#666666" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Icons Container - Right Side */}
            <View style={styles.iconsContainer}>
              {showSearchButton && (
                <TouchableOpacity
                  onPress={handleToggleSearch}
                  style={[
                    styles.iconButton,
                    searchVisible && styles.activeIconButton,
                  ]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name={searchVisible ? "times" : "search"}
                    size={24}
                    color="#000000" // Change icon color to black
                  />
                </TouchableOpacity>
              )}

              {!searchVisible && showFilterButton && (
                <TouchableOpacity
                  onPress={toggleFilterModal}
                  style={styles.iconButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name="sliders"
                    size={24}
                    color={isFilterActive ? "#6C63FF" : "#000000"} // Change icon color to black
                  />
                  {isFilterActive && (
                    <View style={styles.activeFilterIndicator} />
                  )}
                </TouchableOpacity>
              )}

              {!searchVisible && (
                <TouchableOpacity
                  style={styles.cartIcon}
                  onPress={() => navigation.navigate("ShoppingCartTab")}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="shopping-cart" size={24} color="#000000" />
                  {""}
                  {/* Change icon color to black */}
                  {cartItems.length > 0 && (
                    <View style={styles.cartBadge}>
                      {/* Ensure that the count is wrapped inside a <Text> component */}
                      <Text style={styles.cartBadgeText}>
                        {cartItems.length.toString()}
                        {""}
                        {/* Ensure it's a string */}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  bannerContainer: {
    position: "relative",
    width: "100%",
  },
  bannerWrapper: {
    width: "100%",
    height: 220,
    position: "relative",
  },
  banner: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  bannerImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  placeholderBanner: {
    width: "100%",
    height: 80,
    backgroundColor: "#6C63FF",
  },
  overlayHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: 80,
  },
  categoryButton: {
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderRadius: 20,
    marginRight: 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderRadius: 20,
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 12,
    // backgroundColor: "rgba(255, 255, 255, 0.22)", // Change background color to
    borderRadius: 20,
    padding: 0, // Төсөөлөлд гарч буй зайг багасгах
  },
  activeIconButton: {
    backgroundColor: "#6C63FF",
  },
  cartIcon: {
    marginLeft: 12,
    padding: 8,
    position: "relative",
    // backgroundColor: "white", // Change background color to white
    borderRadius: 20,
  },
  cartBadge: {
    position: "absolute",
    right: -6,
    top: -2,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  activeFilterIndicator: {
    position: "absolute",
    right: 5,
    top: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    width: 8,
    height: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    marginRight: 10,
    position: "relative",
  },
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: "rgba(255, 255, 255, 0.38)",
    borderRadius: 18,
    paddingLeft: 12,
    paddingRight: 35,
    color: "#333333",
    fontSize: 14,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    padding: 0,
  },
  pagination: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#FFFFFF",
  },
});

export default Header;
