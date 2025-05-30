import React, { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../context/CartContext";
import Toast from "react-native-toast-message";
import Header from "./Header";

const ProductDetails = ({ route, navigation }) => {
  const { product } = route.params;
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState({});
  const flatListRef = useRef(null);
  const imageListRef = useRef(null);
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );

  // Create an array with product images
  const productImages = product.images || [];

  // Get unique colors from variants with their display names and enhanced colors
  const uniqueColors = [
    ...new Set(product.variants?.map((v) => v.color) || []),
  ].map((color) => ({
    value: color,
    display: color,
    // Enhanced color mapping with more vibrant colors
    color:
      color === "Хар"
        ? "#1A1A1A"
        : color === "Цэнхэр"
        ? "#0066CC"
        : color === "Саарал"
        ? "#666666"
        : color === "Цагаан"
        ? "#F5F5F5"
        : color === "Улаан" ||
          color === "улаан" ||
          color === "Red" ||
          color === "red"
        ? "#E60000"
        : color === "Ногоон"
        ? "#009933"
        : color === "Шар"
        ? "#FFD700"
        : color === "Ягаан"
        ? "#FF69B4"
        : color === "Хүрэн"
        ? "#8B4513"
        : color === "Ягаан"
        ? "#FF1493"
        : "#CCCCCC", // Default color
  }));

  // Update dimensions when screen size changes
  useEffect(() => {
    const updateDimensions = () => {
      setScreenDimensions(Dimensions.get("window"));
    };

    if (Platform.OS === "web") {
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    } else {
      Dimensions.addEventListener("change", updateDimensions);
      return () => {
        if (Dimensions.removeEventListener) {
          Dimensions.removeEventListener("change", updateDimensions);
        }
      };
    }
  }, []);

  const truncateName = (text) => {
    return text.length > 15 ? text.substring(0, 15) + "..." : text;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Handle stock data based on variants
        if (product.variants && product.variants.length > 0) {
          const stockMap = {};
          product.variants.forEach((variant) => {
            stockMap[variant.size] = variant.stock;
          });
          setStockData(stockMap);
        } else {
          // For products without variants
          setStockData({ [product.size]: product.stock });
        }

        // Fetch related products
        const relatedResponse = await fetch(
          "http://10.150.35.107:5000/api/products"
        );
        const relatedData = await relatedResponse.json();

        if (relatedData.success && Array.isArray(relatedData.data)) {
          const filteredProducts = relatedData.data
            .filter((item) => item._id !== product._id)
            .map((item) => ({
              ...item,
              image: { url: item.images[0] },
            }));
          setRelatedProducts(filteredProducts);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [product]);

  // Auto-scroll for Android
  useEffect(() => {
    if (relatedProducts.length > 0 && Platform.OS === "android") {
      let currentOffset = 0;
      const interval = setInterval(() => {
        if (currentOffset < relatedProducts.length * 120 - 300) {
          currentOffset += 120;
        } else {
          currentOffset = 0;
        }
        flatListRef.current?.scrollToOffset({
          offset: currentOffset,
          animated: true,
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [relatedProducts]);

  // Get available sizes for selected color
  const getAvailableSizes = () => {
    if (!selectedColor) return [];

    if (product.variants && product.variants.length > 0) {
      return product.variants
        .filter((variant) => variant.color === selectedColor)
        .map((variant) => ({
          label: variant.size,
          value: variant.size,
          stock: variant.stock,
          isAvailable: variant.stock > 0,
          displayText:
            variant.stock > 0
              ? `${variant.size} (${variant.stock} ширхэг)`
              : `${variant.size} (Дууссан)`,
        }));
    } else if (product.size) {
      return [
        {
          label: product.size,
          value: product.size,
          stock: product.stock,
          isAvailable: product.stock > 0,
          displayText:
            product.stock > 0
              ? `${product.size} (${product.stock} ширхэг)`
              : `${product.size} (Дууссан)`,
        },
      ];
    }
    return [];
  };

  // Reset selected size when color changes
  useEffect(() => {
    setSelectedSize(null);
  }, [selectedColor]);

  const handleAddToCart = () => {
    if (!selectedColor) {
      Toast.show({
        type: "error",
        text1: "Өнгө сонгоогүй байна",
        text2: "Бүтээгдэхүүний өнгийг сонгоно уу.",
        position: "top",
        topOffset: Platform.OS === "ios" ? 90 : 165,
      });
      return;
    }

    if (!selectedSize) {
      Toast.show({
        type: "error",
        text1: "Хэмжээ сонгоогүй байна",
        text2: "Бүтээгдэхүүний хэмжээг сонгоно уу.",
        position: "top",
        topOffset: Platform.OS === "ios" ? 90 : 165,
      });
      return;
    }

    const selectedVariant = product.variants?.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
    const stock = selectedVariant ? selectedVariant.stock : product.stock;

    if (stock < quantity) {
      Toast.show({
        type: "error",
        text1: "Нөөц хүрэлцэхгүй байна",
        text2: `Сонгосон хэмжээнд ${stock} ширхэг л үлдсэн байна.`,
        position: "top",
        topOffset: Platform.OS === "ios" ? 90 : 165,
      });
      return;
    }

    addToCart(product, quantity, selectedSize, selectedColor);
    Toast.show({
      type: "success",
      text1: "Сагсанд нэмэгдлээ",
      text2: `${product.name} ${selectedColor} ${selectedSize} сагсанд амжилттай нэмэгдлээ.`,
      position: "top",
      topOffset: Platform.OS === "ios" ? 90 : 165,
    });
  };

  const orderNow = () => {
    if (!selectedSize) {
      Toast.show({
        type: "error",
        text1: "Хэмжээ сонгоогүй байна",
        text2: "Бүтээгдэхүүний хэмжээг сонгоно уу.",
        position: "top",
        topOffset: Platform.OS === "ios" ? 90 : 165,
      });
      return;
    }

    const sizeKey =
      product.category === "Clothing"
        ? selectedSize.split(" ")[0]
        : selectedSize;

    if (stockData[sizeKey] && stockData[sizeKey] < quantity) {
      Toast.show({
        type: "error",
        text1: "Нөөц хүрэлцэхгүй байна",
        text2: `Сонгосон хэмжээнд ${stockData[sizeKey]} ширхэг л үлдсэн байна.`,
        position: "top",
        topOffset: Platform.OS === "ios" ? 90 : 165,
      });
      return;
    }

    console.log(`${product.name} захиалагдлаа.`);
    console.log(`Бүтээгдэхүүн: ${product.name}`);
    console.log(`Хэмжээ: ${selectedSize}`);
    console.log(`Тоо ширхэг: ${quantity}`);
    Toast.show({
      type: "success",
      text1: "Захиалга амжилттай",
      text2: `${product.name} (${selectedSize}) бүтээгдэхүүн амжилттай захиалагдлаа.`,
      position: "top",
      topOffset: Platform.OS === "ios" ? 90 : 165,
    });
  };

  const availableSizes = getAvailableSizes();
  const hasSizes = availableSizes.length > 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  // Different rendering based on platform
  if (Platform.OS === "web") {
    return (
      <View style={styles.webMainContainer}>
        {/* Header */}
        <View style={styles.webHeaderContainer}>
          <Header
            navigation={navigation}
            showBanner={false}
            showLogo={true}
            showBackButton={false}
            howBackButton={false}
            showFilterButton={false}
            showCategoryButton={false}
          />
        </View>

        {/* Main content area */}
        <ScrollView
          style={styles.webScrollView}
          contentContainerStyle={styles.webScrollViewContent}
        >
          <View style={styles.webContainer}>
            {/* Product images */}
            <View style={styles.webImageSection}>
              <View style={styles.webImageContainer}>
                {productImages.map((imageUrl, index) => (
                  <View
                    key={index}
                    style={[
                      styles.webImageWrapper,
                      {
                        display: currentImageIndex === index ? "flex" : "none",
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.webImage}
                      resizeMode="contain"
                    />
                  </View>
                ))}

                {/* Next/Prev buttons for web */}
                {productImages.length > 1 && (
                  <View style={styles.imageNavButtons}>
                    <TouchableOpacity
                      style={styles.navButton}
                      onPress={() => {
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? productImages.length - 1 : prev - 1
                        );
                      }}
                    >
                      <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.navButton}
                      onPress={() => {
                        setCurrentImageIndex((prev) =>
                          prev === productImages.length - 1 ? 0 : prev + 1
                        );
                      }}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Image dots indicator */}
              {productImages.length > 1 && (
                <View style={styles.dotsContainer}>
                  {productImages.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setCurrentImageIndex(index);
                      }}
                    >
                      <View
                        style={[
                          styles.dot,
                          currentImageIndex === index && styles.activeDot,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Product details */}
            <View style={styles.webDetailsContainer}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.price}>
                {product.price.toLocaleString()}₮
              </Text>
              <Text style={styles.description}>{product.description}</Text>

              {/* Color Selection */}
              <Text style={styles.colorLabel}>Өнгө сонгох:</Text>
              <View style={styles.webColorButtonsContainer}>
                {uniqueColors.map((colorObj) => (
                  <TouchableOpacity
                    key={colorObj.value}
                    style={[
                      styles.webColorButton,
                      selectedColor === colorObj.value &&
                        styles.selectedColorButton,
                    ]}
                    onPress={() => setSelectedColor(colorObj.value)}
                  >
                    <View
                      style={[
                        styles.colorCircle,
                        { backgroundColor: colorObj.color },
                        selectedColor === colorObj.value &&
                          styles.selectedColorCircle,
                      ]}
                    >
                      {selectedColor === colorObj.value && (
                        <View style={styles.selectedColorInner} />
                      )}
                    </View>
                    <Text style={styles.webColorButtonText}>
                      {colorObj.display}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Size Selection - Only show if color is selected */}
              {selectedColor && (
                <>
                  <Text style={styles.label}>Хэмжээ сонгох:</Text>
                  <View style={styles.webSizeButtonsContainer}>
                    {getAvailableSizes().map((size) => (
                      <TouchableOpacity
                        key={size.value}
                        style={[
                          styles.sizeButton,
                          !size.isAvailable && styles.outOfStockButton,
                          selectedSize === size.value &&
                            styles.selectedSizeButton,
                          {
                            width: product.category === "Clothing" ? 150 : 80,
                            margin: 5,
                          },
                        ]}
                        onPress={() =>
                          size.isAvailable && setSelectedSize(size.value)
                        }
                        disabled={!size.isAvailable}
                      >
                        <Text
                          style={[
                            styles.sizeButtonText,
                            !size.isAvailable && styles.outOfStockButtonText,
                            selectedSize === size.value &&
                              styles.selectedSizeButtonText,
                          ]}
                        >
                          {size.displayText}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.label}>Тоо ширхэг:</Text>
              <View style={styles.webQuantityContainer}>
                <Button
                  title="-"
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                />
                <Text style={styles.quantityText}>{quantity}</Text>
                <Button
                  title="+"
                  onPress={() => setQuantity(quantity + 1)}
                  disabled={
                    selectedSize &&
                    stockData[selectedSize.split(" ")[0]] <= quantity
                  }
                />
              </View>

              {/* Related Products */}
              <View style={styles.relatedSection}>
                <Text style={styles.relatedTitle}>Бусад бүтээгдэхүүн:</Text>
                {relatedProducts.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View style={styles.webRelatedContainer}>
                      {relatedProducts.map((item) => (
                        <TouchableOpacity
                          key={item._id}
                          style={styles.relatedCard}
                          onPress={() =>
                            navigation.push("ProductDetails", { product: item })
                          }
                        >
                          <Image
                            source={{ uri: item.image?.url }}
                            style={styles.relatedImage}
                          />
                          <Text style={styles.relatedName}>
                            {truncateName(item.name)}
                          </Text>
                          <Text style={styles.relatedPrice}>
                            {item.price.toLocaleString()}₮
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                ) : (
                  <Text style={styles.noRelatedText}>
                    Бусад бүтээгдэхүүн байхгүй байна
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom buttons */}
        <View style={styles.webBottomButtonsContainer}>
          <TouchableOpacity
            style={[styles.cartButton, !selectedSize && styles.disabledButton]}
            onPress={handleAddToCart}
            disabled={!selectedSize}
          >
            <Ionicons
              name="cart"
              size={24}
              color={!selectedSize ? "#999" : "black"}
            />
            <Text
              style={[
                styles.cartButtonText,
                !selectedSize && styles.disabledButtonText,
              ]}
            >
              Сагслах
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.orderButton, !selectedSize && styles.disabledButton]}
            onPress={orderNow}
            disabled={!selectedSize}
          >
            <Text
              style={[
                styles.orderButtonText,
                !selectedSize && styles.disabledButtonText,
              ]}
            >
              Захиалах
            </Text>
          </TouchableOpacity>
        </View>
        <Toast position="top" topOffset={20} />
      </View>
    );
  }

  // Mobile rendering (iOS/Android)
  const Container = Platform.OS === "ios" ? SafeAreaView : View;

  return (
    <Container style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <Header
          navigation={navigation}
          showBanner={false}
          showLogo={true}
          showBackButton={true}
          showFilterButton={false}
          showSearchButton={false}
          showCategoryButton={false}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.container}>
          {/* Main and hover images */}
          <View style={styles.imageContainer}>
            {productImages.length > 0 ? (
              <>
                <FlatList
                  ref={imageListRef}
                  data={productImages}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => `product-image-${index}`}
                  renderItem={({ item }) => (
                    <Image
                      source={{ uri: item }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  )}
                  pagingEnabled
                  onScroll={(event) => {
                    const contentWidth =
                      event.nativeEvent.layoutMeasurement.width;
                    const contentOffset = event.nativeEvent.contentOffset.x;
                    const index = Math.round(contentOffset / contentWidth);
                    setCurrentImageIndex(index);
                  }}
                  scrollEventThrottle={16}
                />

                {/* Image dots indicator */}
                {productImages.length > 1 && (
                  <View style={styles.dotsContainer}>
                    {productImages.map((_, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setCurrentImageIndex(index);
                          imageListRef.current?.scrollToIndex({
                            index,
                            animated: true,
                          });
                        }}
                      >
                        <View
                          style={[
                            styles.dot,
                            currentImageIndex === index && styles.activeDot,
                          ]}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noImageContainer}>
                <Text>Зураг алга байна</Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price.toLocaleString()}₮</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Color Selection */}
          <Text style={styles.colorLabel}>Өнгө сонгох:</Text>
          <View style={styles.colorButtonsContainer}>
            {uniqueColors.map((colorObj) => (
              <TouchableOpacity
                key={colorObj.value}
                style={styles.colorButtonWrapper}
                onPress={() => setSelectedColor(colorObj.value)}
              >
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: colorObj.color },
                    selectedColor === colorObj.value &&
                      styles.selectedColorCircle,
                  ]}
                >
                  {selectedColor === colorObj.value && (
                    <View style={styles.selectedColorInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.colorName,
                    selectedColor === colorObj.value &&
                      styles.selectedColorName,
                  ]}
                >
                  {colorObj.display}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Size Selection - Only show if color is selected */}
          {selectedColor && (
            <>
              <Text style={styles.label}>Хэмжээ сонгох:</Text>
              <View style={styles.sizeButtonsContainer}>
                {getAvailableSizes().map((size) => (
                  <TouchableOpacity
                    key={size.value}
                    style={[
                      styles.sizeButton,
                      !size.isAvailable && styles.outOfStockButton,
                      selectedSize === size.value && styles.selectedSizeButton,
                      {
                        width: product.category === "Clothing" ? 120 : 70,
                        marginHorizontal: 5,
                      },
                    ]}
                    onPress={() =>
                      size.isAvailable && setSelectedSize(size.value)
                    }
                    disabled={!size.isAvailable}
                  >
                    <Text
                      style={[
                        styles.sizeButtonText,
                        !size.isAvailable && styles.outOfStockButtonText,
                        selectedSize === size.value &&
                          styles.selectedSizeButtonText,
                      ]}
                    >
                      {size.displayText}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={styles.label}>Тоо ширхэг:</Text>
          <View style={styles.quantityContainer}>
            <Button
              title="-"
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            />
            <Text style={styles.quantityText}>{quantity}</Text>
            <Button
              title="+"
              onPress={() => setQuantity(quantity + 1)}
              disabled={
                selectedSize &&
                stockData[
                  product.category === "Clothing"
                    ? selectedSize.split(" ")[0]
                    : selectedSize
                ] <= quantity
              }
            />
          </View>

          {/* Related Products */}
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Бусад бүтээгдэхүүн:</Text>
            {relatedProducts.length > 0 ? (
              <FlatList
                ref={flatListRef}
                data={relatedProducts}
                horizontal
                showsHorizontalScrollIndicator={true}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.relatedCard}
                    onPress={() =>
                      navigation.push("ProductDetails", { product: item })
                    }
                  >
                    <Image
                      source={{ uri: item.image?.url }}
                      style={styles.relatedImage}
                    />
                    <Text style={styles.relatedName}>
                      {truncateName(item.name)}
                    </Text>
                    <Text style={styles.relatedPrice}>
                      {item.price.toLocaleString()}₮
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.relatedContainer}
                initialNumToRender={4}
              />
            ) : (
              <Text style={styles.noRelatedText}>
                Бусад бүтээгдэхүүн байхгүй байна
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.cartButton,
            hasSizes && !selectedSize && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={hasSizes && !selectedSize}
        >
          <Ionicons
            name="cart"
            size={24}
            color={hasSizes && !selectedSize ? "#999" : "black"}
          />
          <Text
            style={[
              styles.cartButtonText,
              hasSizes && !selectedSize && styles.disabledButtonText,
            ]}
          >
            Сагслах
          </Text>
        </TouchableOpacity>
      </View>

      <Toast position="top" topOffset={Platform.OS === "ios" ? 90 : 100} />
    </Container>
  );
};

const styles = StyleSheet.create({
  // Mobile styles
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: "white",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  container: {
    flex: 0,
    paddingTop: 90,
    paddingBottom: 40,
    padding: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    left: 5,
    zIndex: 10000,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0)",
    paddingVertical: 0,
    paddingHorizontal: 5,
    borderRadius: 20,
  },
  imageContainer: {
    marginTop: 55,
    alignItems: "center",
    width: "100%",
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  noImageContainer: {
    width: 300,
    height: 300,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  price: {
    fontSize: 18,
    color: "green",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  sizeButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  selectedSizeButton: {
    borderColor: "#000",
    backgroundColor: "#000",
  },
  outOfStockButton: {
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
  },
  sizeButtonText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
  },
  selectedSizeButtonText: {
    color: "#fff",
  },
  outOfStockButtonText: {
    color: "#999",
    textDecorationLine: "line-through",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  relatedSection: {
    height: 200,
    marginBottom: 20,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  relatedCard: {
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingRight: 10,
    paddingLeft: 10,
    elevation: 2,
  },
  relatedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  relatedName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 5,
  },
  relatedPrice: {
    fontSize: 14,
    color: "green",
    textAlign: "center",
    marginTop: 5,
  },
  relatedContainer: {
    paddingBottom: 10,
  },
  noRelatedText: {
    fontStyle: "italic",
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    width: "100%",
    justifyContent: "center",
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    width: "48%",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#f5f5f5",
    borderColor: "#ccc",
  },
  cartButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  disabledButtonText: {
    color: "#999",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#000",
  },

  // Web-specific styles
  webMainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#fff",
    position: "relative",
  },
  webHeaderContainer: {
    position: "sticky",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "white",
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
  },
  webBackButton: {
    position: "absolute",
    top: 15,
    left: 5,
    zIndex: 1001,
    backgroundColor: "rgba(255, 255, 255, 0)",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  webScrollView: {
    flex: 1,
    overflow: "auto",
  },
  webScrollViewContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
  webContainer: {
    paddingTop: 40,
  },
  webImageSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  webImageContainer: {
    width: "100%",
    height: 300,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  webImageWrapper: {
    width: "100%",
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  webImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  imageNavButtons: {
    position: "absolute",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  webDetailsContainer: {
    paddingHorizontal: 20,
  },
  webSizeButtonsContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  webQuantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  webRelatedContainer: {
    flexDirection: "row",
    paddingBottom: 10,
  },
  webBottomButtonsContainer: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
  },
  webColorButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  webColorButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginHorizontal: 5,
  },
  selectedColorButton: {
    borderColor: "#000",
    backgroundColor: "#000",
  },
  webColorButtonText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
  },
  selectedColorButtonText: {
    color: "#fff",
  },
  colorButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 25,
    paddingHorizontal: 15,
    gap: 15,
  },
  colorButtonWrapper: {
    alignItems: "center",
    width: 80,
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedColorCircle: {
    borderWidth: 2,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedColorInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  colorName: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  selectedColorName: {
    color: "#000",
    fontWeight: "600",
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
});

export default ProductDetails;
