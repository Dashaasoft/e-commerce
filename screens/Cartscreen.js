// import React, { useContext } from "react";
// import { View, Text, FlatList, StyleSheet } from "react-native";
// import { CartContext } from "../context/CartContext";
// import CartItem from "../components/CartItem";

// const CartScreen = () => {
//   const { cart } = useContext(CartContext);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>🛒 Миний сагс</Text>
//       {cart ? (
//         <>
//           <FlatList
//             data={cart.items}
//             keyExtractor={(item) => item.productId}
//             renderItem={({ item }) => <CartItem item={item} />}
//           />
//           <Text style={styles.total}>Нийт үнэ: {cart.total}₮</Text>
//         </>
//       ) : (
//         <Text>Сагс хоосон байна</Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#fff" },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
//   total: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
// });

// export default CartScreen;
