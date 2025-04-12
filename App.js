import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/loginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ProductList from "./screens/ProductList";
import BottomTabsNavigator from "./screens/BottomTabsNavigator";
import ProfileScreen from "./screens/ProfileScreen";
import CategoryScreen from "./screens/CategoryScreen";
import ProductDetails from "./screens/ProductDetails";
import ShoppingCart from "./screens/ShoppingCart";
import SaleScreen from "./screens/SaleScreen";
import { CartProvider } from "./context/CartContext";
import CheckoutScreen from "./screens/CheckoutScreen";
import { UserProvider } from "./context/UserContext";

const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="Home"
          >
            {/* Authentication Flow */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />

            {/* Main App Flow */}
            <Stack.Screen name="MainContainer" component={BottomTabsNavigator} />

            <Stack.Screen name="Home" component={BottomTabsNavigator} />
            <Stack.Screen name="ProductList" component={ProductList} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Category" component={CategoryScreen} />
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetails}
              options={{ title: "Бүтээгдэхүүний дэлгэрэнгүй" }}
            />
            <Stack.Screen name="ShoppingCartTab" component={ShoppingCart} />
            <Stack.Screen name="Sales" component={SaleScreen} />
            <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />

          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </UserProvider>
  );
}
