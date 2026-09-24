const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    sosId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SosRequest',
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người tải lên (uploadedBy) là bắt buộc'],
    },
    type: {
      type: String,
      required: [true, 'Loại tệp là bắt buộc'],
      enum: {
        values: ['IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER'],
        message: 'Loại tệp {VALUE} không hợp lệ',
      },
    },
    url: {
      type: String,
      required: [true, 'Đường dẫn tệp (url) là bắt buộc'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'Tên tệp (fileName) là bắt buộc'],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'Kích thước tệp (fileSize tính theo byte) là bắt buộc'],
      min: [0, 'Kích thước tệp không được âm'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: false,
    collection: 'files',
  }
);

// Indexes
fileSchema.index({ sosId: 1 });
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ createdAt: -1 });

module.exports = mongoose.model('File', fileSchema);
