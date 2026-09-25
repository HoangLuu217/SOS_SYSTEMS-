const ApiError = require('../utils/apiError');

/**
 * Middleware phân quyền dựa trên danh sách roles được phép truy cập
 * @param  {...string} allowedRoles - Danh sách role (ví dụ: 'RESCUER', 'LOCAL_AUTHORITY', 'ADMIN')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Yêu cầu xác thực tài khoản trước khi truy cập.'));
    }

    const userRoles = req.user.roles || [];
    // ADMIN luôn có toàn quyền truy cập
    if (userRoles.includes('ADMIN')) {
      return next();
    }

    const hasPermission = allowedRoles.some(role => userRoles.includes(role));

    if (!hasPermission) {
      return next(
        new ApiError(
          403,
          `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
};

module.exports = {
  authorize,
};
