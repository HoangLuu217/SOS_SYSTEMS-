/**
 * Chuẩn hóa format response trả về cho Client
 */
const sendSuccess = (res, statusCode = 200, message = 'Thành công', data = null, meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 500, message = 'Đã có lỗi xảy ra', error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || undefined,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
