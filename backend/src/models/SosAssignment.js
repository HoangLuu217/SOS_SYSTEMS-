const mongoose = require('mongoose');

/**
 * GeoJSON LineString Schema for Rescue Route Geometry
 */
const lineStringGeometrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['LineString'],
      default: 'LineString',
      required: true,
    },
    coordinates: {
      type: [[Number]], // Mảng các tọa độ [longitude, latitude]
      required: [true, 'Tọa độ route geometry là bắt buộc khi khai báo LineString'],
      validate: {
        validator: function (coords) {
          if (!Array.isArray(coords) || coords.length < 2) return false;
          return coords.every(
            pt =>
              Array.isArray(pt) &&
              pt.length === 2 &&
              typeof pt[0] === 'number' &&
              typeof pt[1] === 'number' &&
              pt[0] >= -180 &&
              pt[0] <= 180 &&
              pt[1] >= -90 &&
              pt[1] <= 90
          );
        },
        message: 'Tọa độ tuyến đường LineString không hợp lệ (mỗi điểm gồm [lng (-180..180), lat (-90..90)]).',
      },
    },
  },
  { _id: false }
);

/**
 * Embedded Route Schema
 */
const routeSchema = new mongoose.Schema(
  {
    distance: {
      type: Number,
      min: [0, 'Khoảng cách không được âm'],
      default: 0, // Đơn vị: mét
    },
    duration: {
      type: Number,
      min: [0, 'Thời gian ước tính không được âm'],
      default: 0, // Đơn vị: giây
    },
    geometry: {
      type: lineStringGeometrySchema,
      default: undefined,
    },
  },
  { _id: false }
);

const sosAssignmentSchema = new mongoose.Schema(
  {
    sosId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SosRequest',
      required: [true, 'Mã yêu cầu SOS (sosId) là bắt buộc'],
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueTeam',
      required: [true, 'Đội cứu hộ (teamId) là bắt buộc'],
    },
    rescuerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cứu hộ viên phụ trách (rescuerId) là bắt buộc'],
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người điều phối phân công (assignedBy) là bắt buộc'],
    },
    route: {
      type: routeSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: {
        values: [
          'ASSIGNED',
          'ACCEPTED',
          'ON_THE_WAY',
          'ARRIVED',
          'RESCUING',
          'COMPLETED',
          'CANCELLED',
        ],
        message: 'Trạng thái điều phối {VALUE} không hợp lệ',
      },
      default: 'ASSIGNED',
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    arrivedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    note: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'sos_assignments',
  }
);

// Indexes
sosAssignmentSchema.index({ sosId: 1 });
sosAssignmentSchema.index({ teamId: 1 });
sosAssignmentSchema.index({ rescuerId: 1 });
sosAssignmentSchema.index({ vehicleId: 1 });
sosAssignmentSchema.index({ assignedBy: 1 });
sosAssignmentSchema.index({ status: 1 });
sosAssignmentSchema.index({ sosId: 1, status: 1 });
sosAssignmentSchema.index({ rescuerId: 1, status: 1 });

/**
 * Business Validation & Timeline Automation:
 * 1. Rescuer chỉ được nhận nhiệm vụ khi verificationStatus = VERIFIED và availabilityStatus = AVAILABLE
 * 2. Tự động ghi nhận mốc thời gian acceptedAt, arrivedAt, completedAt tương ứng với status
 */
sosAssignmentSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('rescuerId')) {
    const User = mongoose.model('User');
    const rescuer = await User.findById(this.rescuerId);
    if (!rescuer) {
      return next(new Error('Rescuer không tồn tại trong hệ thống.'));
    }
    if (!rescuer.roles.includes('RESCUER')) {
      return next(new Error('Người được phân công không có quyền RESCUER.'));
    }
    if (rescuer.rescuer?.verificationStatus !== 'VERIFIED') {
      return next(new Error('Chỉ cứu hộ viên đã được xác minh (VERIFIED) mới được nhận nhiệm vụ.'));
    }
    if (rescuer.rescuer?.availabilityStatus !== 'AVAILABLE') {
      return next(
        new Error(
          `Cứu hộ viên không ở trạng thái sẵn sàng (AVAILABLE) để nhận nhiệm vụ (hiện tại: ${
            rescuer.rescuer?.availabilityStatus || 'OFFLINE'
          }).`
        )
      );
    }
  }

  if (this.isModified('status')) {
    const now = new Date();
    if (this.status === 'ACCEPTED' && !this.acceptedAt) {
      this.acceptedAt = now;
    }
    if (this.status === 'ARRIVED' && !this.arrivedAt) {
      this.arrivedAt = now;
    }
    if (this.status === 'COMPLETED' && !this.completedAt) {
      this.completedAt = now;
    }
  }

  next();
});

module.exports = mongoose.model('SosAssignment', sosAssignmentSchema);
