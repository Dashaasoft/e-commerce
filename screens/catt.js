import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "./Header";
import { MaterialIcons } from "@expo/vector-icons";

const CategoryScreen = () => {
  const navigation = useNavigation();
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetch("http://10.150.33.209:5000/api/categories") // ← өөрийн IP-г тохируулаарай
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((cat, i) => ({
          id: i + 1,
          name: cat.name,
          subCategories: cat.subcategories?.map((sub) => sub.name) || [],
          genders: [], // Одоогоор байхгүй тул хоосон
          sizes: [], // Одоогоор байхгүй тул хоосон
        }));
        setCategoryData(formatted);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const FilterChip = ({ label, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
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
    setSelectedSubCategory(null);
  };

  const applyFilters = () => {
    navigation.navigate("ProductList", {
      category: selectedCategory?.name,
      subCategory: selectedSubCategory,
    });
    closeModal();
  };

  const genderShortcuts = [
    { label: "🛍 Бүх бүтээгдэхүүн", gender: null },
    { label: "👨 Эрэгтэй", gender: "Men" },
    { label: "👩 Эмэгтэй", gender: "Women" },
    { label: "✨ Unisex", gender: "Unisex" },
  ];

  return (
    <View style={styles.container}>
      <Header
        navigation={navigation}
        showBackButton={false}
        showFilterButton={false}
        showBanner={false}
        showSearchButton={false}
      />
      <Text style={styles.title}>Ангилал</Text>

      <View style={styles.shortcutsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genderScrollContent}
        >
          {genderShortcuts.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.shortcut}
              onPress={() =>
                navigation.navigate("ProductList", {
                  gender: item.gender,
                  reset: true,
                })
              }
            >
              <Text style={styles.shortcutText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {categoryData.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryItem}
            onPress={() => openModal(cat)}
          >
            <Text style={styles.categoryText}>{cat.name}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#6C63FF" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.subtitle}>{selectedCategory?.name}</Text>

            {selectedCategory?.subCategories.length > 0 && (
              <>
                <Text style={styles.filterTitle}>Дэд ангилал</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedCategory.subCategories.map((sub, idx) => (
                    <FilterChip
                      key={idx}
                      label={sub}
                      selected={selectedSubCategory === sub}
                      onPress={() =>
                        setSelectedSubCategory(
                          sub === selectedSubCategory ? null : sub
                        )
                      }
                    />
                  ))}
                </ScrollView>
              </>
            )}

            <View style={styles.buttonsRow}>
              <TouchableOpacity style={styles.resetButton} onPress={closeModal}>
                <Text style={styles.resetButtonText}>Болих</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={applyFilters}
              >
                <Text style={styles.viewButtonText}>Үзэх</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
    marginLeft: 20,
    marginBottom: 10,
  },
  shortcutsContainer: { marginBottom: 10 },
  genderScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  shortcut: {
    backgroundColor: "#eee",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 12,
    minWidth: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  shortcutText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  categoryItem: {
    padding: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryText: { fontSize: 16, color: "#333" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginRight: 10,
    marginBottom: 5,
  },
  chipSelected: { backgroundColor: "#6C63FF" },
  chipText: { color: "#333" },
  chipTextSelected: { color: "#fff" },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 15,
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  viewButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  resetButton: {
    backgroundColor: "#eee",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  resetButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default CategoryScreen;
