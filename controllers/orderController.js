const Order = require('../models/Order');
const Product = require('../models/Product');

// Шинэ захиалга үүсгэх
exports.createOrder = async (req, res) => {
  try {
    const {
      user,
      products,
      shippingInfo,
      totalAmount,
      paymentMethod
    } = req.body;

    // Бүтээгдэхүүнүүдийн мэдээллийг шалгах
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Бүтээгдэхүүн олдсонгүй: ${item.product}`
        });
      }
    }

    // Шинэ захиалга үүсгэх
    const order = new Order({
      user,
      products,
      shippingInfo,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    await order.save();

    // Захиалгын мэдээллийг буцаах
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'userName email phoneNumber')
      .populate('products.product', 'name price images');

    res.status(201).json({
      success: true,
      message: 'Захиалга амжилттай үүслээ',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Захиалга үүсгэхэд алдаа гарлаа:', error);
    res.status(500).json({
      success: false,
      message: 'Захиалга үүсгэхэд алдаа гарлаа',
      error: error.message
    });
  }
};

// Хэрэглэгчийн захиалгуудыг авах
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user: userId })
      .populate('user', 'userName email phoneNumber')
      .populate('products.product', 'name price images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Захиалгуудыг авахад алдаа гарлаа:', error);
    res.status(500).json({
      success: false,
      message: 'Захиалгуудыг авахад алдаа гарлаа',
      error: error.message
    });
  }
};

// Захиалгын дэлгэрэнгүй мэдээлэл авах
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('user', 'userName email phoneNumber')
      .populate('products.product', 'name price images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Захиалга олдсонгүй'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Захиалгын мэдээлэл авахад алдаа гарлаа:', error);
    res.status(500).json({
      success: false,
      message: 'Захиалгын мэдээлэл авахад алдаа гарлаа',
      error: error.message
    });
  }
};

// Захиалгын төлөв шинэчлэх (админ)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    // Зөвхөн админ эрхтэй хэрэглэгч энэ үйлдлийг хийх боломжтой
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Энэ үйлдлийг хийх эрхгүй'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Захиалга олдсонгүй'
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Захиалгын төлөв амжилттай шинэчлэгдлээ',
      order
    });
  } catch (error) {
    console.error('Захиалгын төлөв шинэчлэхэд алдаа гарлаа:', error);
    res.status(500).json({
      success: false,
      message: 'Захиалгын төлөв шинэчлэхэд алдаа гарлаа',
      error: error.message
    });
  }
};

// Төлбөрийн төлөв шинэчлэх
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Захиалга олдсонгүй'
      });
    }

    // Зөвхөн захиалгын эзэн эсвэл админ эрхтэй хэрэглэгч энэ үйлдлийг хийх боломжтой
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Энэ үйлдлийг хийх эрхгүй'
      });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Төлбөрийн төлөв амжилттай шинэчлэгдлээ',
      order
    });
  } catch (error) {
    console.error('Төлбөрийн төлөв шинэчлэхэд алдаа гарлаа:', error);
    res.status(500).json({
      success: false,
      message: 'Төлбөрийн төлөв шинэчлэхэд алдаа гарлаа',
      error: error.message
    });
  }
}; 