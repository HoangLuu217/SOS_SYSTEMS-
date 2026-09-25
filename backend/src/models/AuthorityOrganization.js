const mongoose = require('mongoose');

const authorityOrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên cơ quan/tổ chức là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tên không được vượt quá 200 ký tự'],
    },
    type: {
      type: String,
      required: [true, 'Loại cơ quan/tổ chức là bắt buộc'],
      enum: {
        values: ['PROVINCE', 'DISTRICT', 'WARD', 'RESCUE_CENTER', 'OTHER'],
        message: 'Loại tổ chức {VALUE} không hợp lệ',
      },
    },
    code: {
      type: String,
      required: [true, 'Mã cơ quan/tổ chức là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdministrativeArea',
      required: [true, 'Khu vực quản lý (areaId) là bắt buộc'],
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$|^\+?[1-9]\d{8,14}$/.test(v);
        },
        message: 'Số điện thoại liên hệ cơ quan không hợp lệ',
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Email cơ quan không đúng định dạng',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        message: 'Trạng thái {VALUE} không hợp lệ',
      },
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
    collection: 'authority_organizations',
  }
);

// Indexes
authorityOrganizationSchema.index({ areaId: 1 });
authorityOrganizationSchema.index({ type: 1 });
authorityOrganizationSchema.index({ status: 1 });

module.exports = mongoose.model('AuthorityOrganization', authorityOrganizationSchema);
