'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Company Schema
 */
var CompanySchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Xin nhập tên công ty',
    trim: true
  },
  alias: [String],
  avatar: {
    type: String,
    default: 'modules/companies/client/img/profile/default.png',
    trim: true
  },
  description: {
    type: String,
    default: 'Chưa có mô tả',
    trim: true
  },
  website: {
    type: String,
    default: 'Chưa có trang web chính thức',
    trim: true
  },
  personnelSize: {
    type: String,
    default: 'Chưa có quy mô nhân sự',
    trim: true
  },
  companyType: {
    type: String,
    trim: true,
    required: 'Xin nhập kiểu công ty'
  },
  hq:{
    type: String,
    default: 'Chưa có địa chỉ trụ sở chính',
    trim: true
  },
  founded:{
    type: Date
  },
  industry:{
    type: String,
    default: 'Chưa có thông tin ngành nghề chính thức',
    trim: true
  },
  contact:{
    type: String,
    default: 'Chưa có địa chỉ liên hệ',
    trim: true
  },
  photo:[String],
  video:[String],
  state:{
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    required: 'Xin chọn trạng thái công ty'
  },
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  reviews: [{
    stayAnonymous:{
      type: Boolean,
      default: false
    },
    highlight:{
      type: Boolean,
      default: false
    },
    userID: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    bookmarkers: [{
      userID: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    title:{
      type: String,
      trim: true,
      required: 'Xin nhập tiêu đề bài đánh giá'
    },
    job: {
      type: String,
      required: 'Điền vị trí công việc'
    },
    /* Hiện tại người viết bài còn làm ỏ vị trí đánh giá hay không */
    isJobCurrent: {
      type: Boolean,
      default: true,
      required: 'Xin chọn tình trạng nghề đánh giá'
    },
    jobLength: {
      type: String,
      default: 'Chưa có thời gian làm việc tại vị trí này',
      trim: true
    },
    contract: {
      type: String,
      default: 'Chưa có kiểu hợp đồng lao động',
      trim: true
    },
    overallRev: {
      pros: {
        type: String,
        required: 'Xin nhập điểm mạnh',
        trim: true
      },
      cons: {
        type: String,
        required: 'Xin nhập điểm yếu',
        trim: true
      },
      supplement: String,
      rating: {
        type: Number,
        required: 'Xin nhập điểm đánh giá tổng thể'
      }            
    },
    salaryAndBenefit: {
      /* Salary */
      basePay: Number,
      payRaise: Number,
      cashBonus: Number,
      profitSharing: Number,
      /* Benefit */
      healthRating: Number,
      opportunityRating: Number,
      parentalLeaveRating: Number,
      timeOffRating: Number,
      pensionRating: Number,
      supplement: String
      // rating: {
      //   type: Number,
      //   required: 'Xin nhập điểm đánh giá cho lương và chế độ đãi ngộ'
      // }
    },
    upvoteCount: {
      type: Number,
      default: 0
    },
    upvoteUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    proof: {
      type: String,
      default: '',
      trim: true
    },
    state:{
      type: String,
      enum: ['waiting', 'approved', 'denied', 'trusted'],
      default: 'waiting',
      required: 'Xin chọn trạng thái bài đánh giá'
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      required: 'Thiếu thời gian cập nhập mới nhất'
    },
    comments: [{
      user: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
      },
      content: {
        type: String,
        required: 'Please fill some cmts',
        trim: true
      },
      postTime: {
        type: Date,
        default: Date.now
      }
    }],
    reports: [{
      user: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
      },
      content: {
        type: String,
        required: 'Please fill some cmts',
        trim: true
      },
      isConsidered: {
        type: Boolean,
        default: false
      }
    }]
  }]
});

CompanySchema.index({ name: 'text', 'reviews.job': 'text' });
module.exports = mongoose.model('Company', CompanySchema);