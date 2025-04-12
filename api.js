export const getCart = async (userId) => {
  // API дуудлага хийх эсвэл өгөгдлийн сангаас сагсны мэдээллийг авах
  // Жишээ нь:
  // const response = await fetch(`http://yourapi.com/cart/${userId}`);
  // return await response.json();
  return []; // Түр зуурын хоосон массив буцаах
};

export const addToCart = async (userId, productId, quantity, size) => {
  // API дуудлага хийх эсвэл өгөгдлийн санг шинэчлэх
  // Жишээ нь:
  // const response = await fetch(`http://yourapi.com/cart/add`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ userId, productId, quantity, size }),
  // });
  // return await response.json();
  return {}; // Түр зуурын хоосон объект буцаах
}; 