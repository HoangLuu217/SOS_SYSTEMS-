const vehicleService = require('../services/vehicle.service');
const { sendSuccess } = require('../utils/apiResponse');

class VehicleController {
  /**
   * POST /vehicles
   */
  async createVehicle(req, res, next) {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);
      return sendSuccess(res, 201, 'Đăng ký phương tiện cứu hộ thành công', vehicle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /vehicles
   */
  async getVehicles(req, res, next) {
    try {
      const { vehicles, pagination } = await vehicleService.getVehicles(req.query);
      return sendSuccess(res, 200, 'Lấy danh sách phương tiện thành công', vehicles, pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /vehicles/:id
   */
  async getVehicleById(req, res, next) {
    try {
      const vehicle = await vehicleService.getVehicleById(req.params.id);
      return sendSuccess(res, 200, 'Lấy thông tin phương tiện thành công', vehicle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /vehicles/:id
   */
  async updateVehicle(req, res, next) {
    try {
      const updated = await vehicleService.updateVehicle(req.params.id, req.body);
      return sendSuccess(res, 200, 'Cập nhật thông tin phương tiện thành công', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /vehicles/:id
   */
  async deleteVehicle(req, res, next) {
    try {
      const result = await vehicleService.deleteVehicle(req.params.id);
      return sendSuccess(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /vehicles/:id/status
   */
  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const updated = await vehicleService.updateStatus(req.params.id, status);
      return sendSuccess(res, 200, 'Cập nhật trạng thái phương tiện thành công', updated);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VehicleController();
