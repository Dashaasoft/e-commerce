
import React, { useState, useEffect, useCallback } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ProductList from "./ProductList";
import CategoryScreen from "./CategoryScreen";
import ProfileScreen from "./ProfileScreen";
import SaleScreen from "./SaleScreen";
import ShoppingCart from "./ShoppingCart";

// Screen names
const ProductListName = "ProductList";
const CategoryScreenName = "CategoryScreen";
const ProfileScreenName = "ProfileTab";
const SaleScreenName = "SaleScreen";
const ShoppingCartName = "ShoppingCart";

const Tab = createBottomTabNavigator();

function MainContainer({ navigation }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem("user_token");
    setIsLoggedIn(!!token);
  };

  return (
    <Tab.Navigator
      initialRouteName={ProductListName}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let rn = route.name;

          if (rn === ProductListName) {
            iconName = focused ? "home" : "home-outline";
          } else if (rn === CategoryScreenName) {
            iconName = focused ? "list" : "list-outline";
          } else if (rn === SaleScreenName) {
            iconName = focused ? "pricetag" : "pricetag-outline";
          } else if (rn === ProfileScreenName) {
            iconName = focused ? "person" : "person-outline";
          } else if (rn === ShoppingCartName) {
            iconName = focused ? "cart" : "cart-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#00000",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#fff",
          paddingTop: 5,
          height: 70,
          borderRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "system-ui", // Add your custom font family here
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name={ProductListName}
        component={ProductList}
        options={{ title: "Нүүр", headerShown: false }}
      />
      <Tab.Screen
        name={CategoryScreenName}
        component={CategoryScreen}
        options={{ title: "Ангилал", headerShown: false }}
      />
      <Tab.Screen
        name={SaleScreenName}
        component={SaleScreen}
        options={{ title: "Хямдрал", headerShown: false }}
      />
      <Tab.Screen
        name={ProfileScreenName}
        component={ProfileScreen}
        options={{ title: "Профайл", headerShown: false }}
      />
      {/* <Tab.Screen
        name={ShoppingCartName}
        component={ShoppingCart}
        options={{ title: "Сагс", headerShown: false }}
      /> */}
    </Tab.Navigator>
  );
}

export default MainContainer;
