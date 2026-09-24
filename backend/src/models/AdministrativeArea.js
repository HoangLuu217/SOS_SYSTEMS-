const mongoose = require('mongoose');

/**
 * GeoJSON Polygon Schema for Administrative Boundary
 */
const polygonBoundarySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon',
      required: true,
    },
    coordinates: {
      type: [[[Number]]], // Mảng chứa các Linear Ring (mỗi ring gồm các cặp [lng, lat])
      required: [true, 'Tọa độ ranh giới GeoJSON Polygon là bắt buộc khi khai báo boundary'],
      validate: {
        validator: function (rings) {
          if (!Array.isArray(rings) || rings.length === 0) return false;
          // Kiểm tra ring đầu tiên (ngoài cùng) phải có ít nhất 4 điểm và điểm đầu trùng điểm cuối
          for (const ring of rings) {
            if (!Array.isArray(ring) || ring.length < 4) return false;
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) return false;
            // Kiểm tra từng điểm có lng [-180, 180] và lat [-90, 90]
            for (const pt of ring) {
              if (
                typeof pt[0] !== 'number' ||
                typeof pt[1] !== 'number' ||
                pt[0] < -180 ||
                pt[0] > 180 ||
                pt[1] < -90 ||
                pt[1] > 90
              ) {
                return false;
              }
            }
          }
          return true;
        },
        message: 'Tọa độ GeoJSON Polygon không hợp lệ (cần khép kín [lng, lat] hợp lệ).',
      },
    },
  },
  { _id: false }
);

const administrativeAreaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên đơn vị hành chính là bắt buộc'],
      trim: true,
      maxlength: [150, 'Tên không quá 150 ký tự'],
    },
    code: {
      type: String,
      required: [true, 'Mã đơn vị hành chính là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Loại đơn vị hành chính là bắt buộc'],
      enum: {
        values: ['COUNTRY', 'PROVINCE', 'DISTRICT', 'WARD'],
        message: 'Cấp hành chính {VALUE} không hợp lệ',
      },
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdministrativeArea',
      default: null,
    },
    boundary: {
      type: polygonBoundarySchema,
      default: undefined,
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'INACTIVE'],
        message: 'Trạng thái {VALUE} không hợp lệ',
      },
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
    collection: 'administrative_areas',
  }
);

// Indexes
administrativeAreaSchema.index({ code: 1 }, { unique: true });
administrativeAreaSchema.index({ parentId: 1 });
administrativeAreaSchema.index({ type: 1 });
administrativeAreaSchema.index({ boundary: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('AdministrativeArea', administrativeAreaSchema);
