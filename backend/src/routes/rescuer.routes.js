const express = require('express');
const router = express.Router();
const rescuerController = require('../controllers/rescuer.controller');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Tất cả endpoints /rescuer đều yêu cầu đăng nhập và có vai trò RESCUER (hoặc ADMIN)
router.use(authenticate);
router.use(authorize('RESCUER', 'ADMIN'));

/**
 * @route   GET /rescuer/me
 * @desc    Lấy thông tin hồ sơ cứu hộ của chính user đang đăng nhập
 */
router.get('/me', rescuerController.getMyProfile);

/**
 * @route   PATCH /rescuer/me
 * @desc    Cập nhật thông tin cơ bản hồ sơ cứu hộ
 */
router.patch('/me', rescuerController.updateMyProfile);

/**
 * @route   PATCH /rescuer/me/skills
 * @desc    Cập nhật danh sách kỹ năng chuyên môn
 */
router.patch('/me/skills', rescuerController.updateMySkills);

/**
 * @route   PATCH /rescuer/me/experience
 * @desc    Cập nhật thông tin kinh nghiệm
 */
router.patch('/me/experience', rescuerController.updateMyExperience);

/**
 * @route   PATCH /rescuer/me/availability
 * @desc    Cập nhật trạng thái sẵn sàng (OFFLINE, AVAILABLE, BUSY, ON_MISSION, SUSPENDED)
 */
router.patch('/me/availability', rescuerController.updateMyAvailability);

module.exports = router;
