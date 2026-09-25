const { User } = require('../models');
const ApiError = require('../utils/apiError');

class RescuerService {
  /**
   * Lấy thông tin chi tiết hồ sơ Cứu hộ viên của chính mình
   */
  async getProfile(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new ApiError(404, 'Không tìm thấy thông tin tài khoản');
    }

    if (!user.roles.includes('RESCUER')) {
      throw new ApiError(403, 'Tài khoản này chưa được cấp quyền Cứu hộ viên (RESCUER)');
    }

    return {
      _id: user._id,
      phone: user.phone,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      address: user.address,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      roles: user.roles,
      status: user.status,
      isVerified: user.isVerified,
      rescuer: user.rescuer || {},
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Cập nhật thông tin cơ bản của Cứu hộ viên
   */
  async updateProfile(userId, data) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'Không tìm thấy tài khoản');
    }

    if (!user.roles.includes('RESCUER')) {
      throw new ApiError(403, 'Tài khoản này không có quyền Cứu hộ viên');
    }

    // Các trường cho phép cập nhật trong hồ sơ rescuer
    if (data.idNumber !== undefined) user.rescuer.idNumber = data.idNumber;
    if (data.vehicleType !== undefined) user.rescuer.vehicleType = data.vehicleType;

    // Cho phép cập nhật thêm thông tin hiển thị nếu có
    if (data.fullName !== undefined) user.fullName = data.fullName;
    if (data.address !== undefined) user.address = data.address;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    if (data.gender !== undefined) user.gender = data.gender;
    if (data.dateOfBirth !== undefined) user.dateOfBirth = data.dateOfBirth;

    await user.save();

    return this.getProfile(userId);
  }

  /**
   * Cập nhật danh sách kỹ năng chuyên môn
   */
  async updateSkills(userId, skills) {
    if (!Array.isArray(skills)) {
      throw new ApiError(400, 'Danh sách kỹ năng (skills) phải là một mảng chuỗi');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'Không tìm thấy tài khoản');
    }

    if (!user.roles.includes('RESCUER')) {
      throw new ApiError(403, 'Tài khoản này không có quyền Cứu hộ viên');
    }

    // Làm sạch và lọc kỹ năng trùng
    const cleanSkills = Array.from(new Set(skills.map(s => String(s).trim()).filter(Boolean)));

    user.rescuer.skills = cleanSkills;
    await user.save();

    return {
      userId: user._id,
      skills: user.rescuer.skills,
    };
  }

  /**
   * Cập nhật kinh nghiệm cứu hộ
   */
  async updateExperience(userId, experience) {
    if (typeof experience !== 'string') {
      throw new ApiError(400, 'Kinh nghiệm (experience) phải là định dạng chuỗi');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'Không tìm thấy tài khoản');
    }

    if (!user.roles.includes('RESCUER')) {
      throw new ApiError(403, 'Tài khoản này không có quyền Cứu hộ viên');
    }

    user.rescuer.experience = experience.trim();
    await user.save();

    return {
      userId: user._id,
      experience: user.rescuer.experience,
    };
  }

  /**
   * Cập nhật trạng thái sẵn sàng (Availability Status)
   */
  async updateAvailability(userId, availabilityStatus) {
    const validStatuses = ['OFFLINE', 'AVAILABLE', 'BUSY', 'ON_MISSION', 'SUSPENDED'];
    if (!validStatuses.includes(availabilityStatus)) {
      throw new ApiError(
        400,
        `Trạng thái '${availabilityStatus}' không hợp lệ. Cho phép: ${validStatuses.join(', ')}`
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'Không tìm thấy tài khoản');
    }

    if (!user.roles.includes('RESCUER')) {
      throw new ApiError(403, 'Tài khoản này không có quyền Cứu hộ viên');
    }

    // Kiểm tra nếu tài khoản chưa được xác minh thì không cho bật AVAILABLE
    if (availabilityStatus === 'AVAILABLE' && user.rescuer.verificationStatus !== 'VERIFIED') {
      throw new ApiError(
        400,
        'Hồ sơ cứu hộ viên chưa được duyệt (VERIFIED). Không thể chuyển sang trạng thái AVAILABLE!'
      );
    }

    user.rescuer.availabilityStatus = availabilityStatus;
    await user.save();

    return {
      userId: user._id,
      availabilityStatus: user.rescuer.availabilityStatus,
    };
  }
}

module.exports = new RescuerService();
