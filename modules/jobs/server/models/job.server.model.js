'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Job Schema
 */
var JobSchema = new Schema({
  name: {
    type: String,
    required: 'Xin nhập tên nghề nghiệp',
    unique: 'Nghề nghiệp đã tồn tại trong hệ thống',
    trim: true,
  }
});

JobSchema.index({ name: 'text' });

module.exports = mongoose.model('Job', JobSchema);