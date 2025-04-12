import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import Header from "./Header";

export default function SaleScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Separate header view */}
      <Header
        navigation={navigation}
        showBackButton={false}
        showFilterButton={false} // Фильтр товчийг нууна
        showBanner={false}
        // Буцах товчийг нууна
        showSearchButton={false} // This hides the search button
        showCategoryButton={false}
      />

      {/* Main content view */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.text}>Одоогоор хямдрал зарлаагүй байна</Text>
        {/* Other content can go here */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
