import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import CheckoutInfoScreen from "./CheckoutInfoScreen";
import PaymentScreen from "./PaymentScreen";
import { View, SafeAreaView, StyleSheet } from "react-native";
import Header from "./Header";

const Tab = createMaterialTopTabNavigator();

const CheckoutScreen = ({ navigation, route }) => {
  return (
    <View style={{ flex: 1 }}>
      <Header
        navigation={navigation}
        showBanner={false}
        howBackButton={false}
        showFilterButton={false}
        showSearchButton={false}
        showCategoryButton={false}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{
            tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
            tabBarIndicatorStyle: { backgroundColor: '#28a745' },
            tabBarActiveTintColor: '#28a745',
            tabBarInactiveTintColor: 'gray',
          }}
        >
          <Tab.Screen 
            name="Мэдээлэл" 
            component={CheckoutInfoScreen}
            initialParams={route.params}
          />
          <Tab.Screen 
            name="Төлбөр төлөх" 
            component={PaymentScreen}
            initialParams={route.params}
          />
        </Tab.Navigator>
      </SafeAreaView>
    </View>
  );
};

export default CheckoutScreen;
