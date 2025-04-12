import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CartContext } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { handleAddToCart } = useContext(CartContext);

  return (
    <View style={styles.cartItem}>
      <Text>{item.name} ({item.size}) - {item.quantity} ш</Text>
      <Text>{item.price * item.quantity}₮</Text>
      <TouchableOpacity onPress={() => handleAddToCart(item.productId, -1, item.size)}>
        <Text style={styles.removeButton}>🗑</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1 },
  removeButton: { color: 'red', fontSize: 18 }
});

export default CartItem;
