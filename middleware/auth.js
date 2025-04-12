const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Authorization header шалгах
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: "Нэвтрэх эрх шаардлагатай" 
      });
    }

    // Bearer token формат шалгах
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Token формат буруу байна" 
      });
    }

    // Token verify хийх
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");
    
    // Хэрэглэгчийн мэдээллийг request-д нэмэх
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token хугацаа нь дууссан байна" 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Token буруу байна" 
      });
    }

    return res.status(500).json({ 
      success: false,
      message: "Серверийн алдаа гарлаа" 
    });
  }
};

module.exports = authMiddleware; 