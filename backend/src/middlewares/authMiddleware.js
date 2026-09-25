const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/apiError');

/**
 * Middleware xác thực người dùng qua JWT hoặc Dev Header
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Hỗ trợ header x-user-id trong môi trường testing/development
    const devUserId = req.headers['x-user-id'];

    if (!token && !devUserId) {
      throw new ApiError(401, 'Bạn chưa đăng nhập. Vui lòng cung cấp token xác thực!');
    }

    let user = null;

    if (token) {
      const secret = process.env.JWT_SECRET || 'sos_system_jwt_secret_key_2026';
      const decoded = jwt.verify(token, secret);
      user = await User.findById(decoded.id || decoded._id);
    } else if (devUserId) {
      user = await User.findById(devUserId);
    }

    if (!user) {
      throw new ApiError(401, 'Tài khoản người dùng không tồn tại hoặc đã bị vô hiệu hóa.');
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new ApiError(403, 'Tài khoản của bạn hiện đang bị khóa hoặc ngưng hoạt động.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
};
