// import React, { createContext, useState, useContext } from 'react';

// const CartContext = createContext();

// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);

//   const addToCart = (product, quantity, size) => {
//     setCartItems((prevItems) => {
//       const existingItem = prevItems.find((item) => item._id === product._id);
//       if (existingItem) {
//         return prevItems.map((item) =>
//           item._id === product._id
//             ? { ...item, quantity: item.quantity + quantity, size }
//             : item
//         );
//       }
//       return [...prevItems, { ...product, quantity, size }];
//     });
//   };

//   const removeFromCart = (productId) => {
//     setCartItems((prevItems) =>
//       prevItems.filter((item) => item._id !== productId)
//     );
//   };

//   const updateQuantity = (productId, quantity) => {
//     setCartItems((prevItems) =>
//       prevItems.map((item) =>
//         item._id === productId ? { ...item, quantity } : item
//       )
//     );
//   };

//   const calculateTotal = () => {
//     return cartItems.reduce(
//       (total, item) => total + item.price * item.quantity,
//       0
//     );
//   };

//   return (
//     <CartContext.Provider
//       value={{ cartItems, addToCart, removeFromCart, updateQuantity, calculateTotal }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// import React, { createContext, useContext, useEffect, useState } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);

//   // 🛒 Сагсны мэдээллийг хадгалах функц
//   const saveCartToStorage = async (items) => {
//     try {
//       await AsyncStorage.setItem("cart", JSON.stringify(items));
//     } catch (error) {
//       console.error("Сагс хадгалах үед алдаа гарлаа:", error);
//     }
//   };

//   // 📤 Сагсны өгөгдлийг `AsyncStorage`-оос унших
//   const loadCartFromStorage = async () => {
//     try {
//       const storedCart = await AsyncStorage.getItem("cart");
//       if (storedCart) {
//         setCartItems(JSON.parse(storedCart));
//       }
//     } catch (error) {
//       console.error("Сагсны мэдээлэл авах үед алдаа гарлаа:", error);
//     }
//   };

//   useEffect(() => {
//     loadCartFromStorage();
//   }, []);

//   // 🆕 Сагсанд нэмэх
//   const addToCart = (item) => {
//     const existingItem = cartItems.find((cartItem) => cartItem._id === item._id);
//     if (existingItem) {
//       // Хэрэв бүтээгдэхүүн сагсанд байгаа бол тоо ширхэгийг нэмэгдүүлнэ
//       const updatedCart = cartItems.map((cartItem) =>
//         cartItem._id === item._id
//           ? { ...cartItem, quantity: cartItem.quantity + 1 }
//           : cartItem
//       );
//       setCartItems(updatedCart);
//       saveCartToStorage(updatedCart);
//     } else {
//       // Шинэ бүтээгдэхүүн нэмэх
//       const updatedCart = [...cartItems, { ...item, quantity: 1 }]; // Анхны quantity = 1
//       setCartItems(updatedCart);
//       saveCartToStorage(updatedCart);
//     }
//   };

//   // ❌ Сагснаас хасах
//   const removeFromCart = (id) => {
//     const updatedCart = cartItems.filter((item) => item._id !== id);
//     setCartItems(updatedCart);
//     saveCartToStorage(updatedCart);
//   };

//   // 🔢 Тоо ширхэг шинэчлэх
//   const updateQuantity = (id, quantity) => {
//     const updatedCart = cartItems.map((item) =>
//       item._id === id ? { ...item, quantity } : item
//     );
//     setCartItems(updatedCart);
//     saveCartToStorage(updatedCart);
//   };

//   // 💰 Нийт үнэ тооцоолох
//   const calculateTotal = () => {
//     return cartItems.reduce((total, item) => {
//       const price = parseFloat(item.price) || 0; // price-г тоо болгон хувиргах
//       const quantity = parseInt(item.quantity) || 0; // quantity-г тоо болгон хувиргах
//       return total + price * quantity;
//     }, 0);
//   };

//   return (
//     <CartContext.Provider
//       value={{ cartItems, addToCart, removeFromCart, updateQuantity, calculateTotal }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => useContext(CartContext);

import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Сагсны контекст үүсгэх
const CartContext = createContext();

// Сагсны контекстийг ашиглах функц
export const useCart = () => useContext(CartContext);

// Сагсны провайдер компонент
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // Сагсны бүтээгдэхүүнүүдийг хадгалах төлөв

  // Компонент ачаалагдах үед AsyncStorage-ээс сагсны бүтээгдэхүүнүүдийг ачаалах
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        const savedCartItems = await AsyncStorage.getItem("cartItems");
        if (savedCartItems) {
          setCartItems(JSON.parse(savedCartItems)); // JSON string-ийг объект болгон хувиргах
        }
      } catch (error) {
        console.error(
          "AsyncStorage-ээс сагсны бүтээгдэхүүн ачаалахад алдаа гарлаа:",
          error
        );
      }
    };

    loadCartItems();
  }, []);

  // Сагсны бүтээгдэхүүн өөрчлөгдөх үед AsyncStorage-д хадгалах
  useEffect(() => {
    const saveCartItems = async () => {
      try {
        await AsyncStorage.setItem("cartItems", JSON.stringify(cartItems)); // Объектыг JSON string болгон хадгалах
      } catch (error) {
        console.error(
          "AsyncStorage-д сагсны бүтээгдэхүүн хадгалахад алдаа гарлаа:",
          error
        );
      }
    };

    saveCartItems();
  }, [cartItems]);

  // Сагсанд бүтээгдэхүүн нэмэх функц
  const addToCart = (product, quantity, size, color) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item._id === product._id && item.size === size && item.color === color
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // 👇 image.url хөрвүүлж өгөх
      const newItem = {
        ...product,
        quantity,
        size,
        color,
        image: {
          url:
            product.image?.url || // хэрвээ байгаа бол
            product.images?.[0] || // олон зурагтай бол эхнийх
            "https://via.placeholder.com/150", // fallback зураг
        },
      };

      return [...prevItems, newItem];
    });
  };

  // Сагснаас бүтээгдэхүүн хасах функц
  const removeFromCart = (productId, size, color) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item._id === productId && item.size === size && item.color === color)
      )
    );
  };

  // Бүтээгдэхүүний тоо ширхэгийг өөрчлөх функц
  const updateQuantity = (productId, size, color, quantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Нийт үнийг тооцоолох функц
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Сагсыг цэвэрлэх функц
  const clearCart = () => {
    setCartItems([]);
    AsyncStorage.removeItem("cartItems");
  };

  // Сагсны контекстийг бусад компонентуудад нийлүүлэх
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        calculateTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
