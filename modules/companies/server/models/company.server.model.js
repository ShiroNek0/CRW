'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  async = require('async'),
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
    required: 'Xin nhập logo công ty',
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
    required: 'Xin nhập địa chỉ trụ sở chính',
    trim: true
  },
  founded:{
    type: String,
    default: 'Chưa có năm thành lập',
    trim: true 
  },
  industry:{
    type: String,
    required: 'Xin nhập ngành nghề chính của công ty',
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
    enum: ['denied', 'approved'],
    default: 'approved',
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  overallRating: Number,
  averageRating: Number,
  reviews: [{
    userID: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    stayAnonymous:{
      type: Boolean,
      default: false
    },
    highlight:{
      type: Boolean,
      default: false
    },
    title:{
      type: String,
      trim: true,
      required: 'Xin nhập tiêu đề bài đánh giá'
    },
    job: {
      type: [String],
      required: 'Xin nhập tối thiểu một nghề nghiệp'
    },
    /* Hiện tại người viết bài còn làm ỏ vị trí đánh giá hay không */
    isJobCurrent: {
      type: Boolean,
      default: true,
    },
    jobLength: String,
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
      /* Chế độ lương */
      basePay: Number,
      payRaise: Number,
      cashBonus: Number,
      profitSharing: Number,
      /* Chế độ đãi ngộ */
      healthRating: Number,
      opportunityRating: Number,
      parentalLeaveRating: Number,
      timeOffRating: Number,
      pensionRating: Number,
      supplement: String,
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
      default: 'waiting'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    comments: [{
      userID: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: 'Thiếu ID người bình luận'
      },
      content: {
        type: String,
        required: 'Xin nhập nội dung bình luận',
        trim: true
      },
    }],
    reports: [{
      user: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: 'Thiếu ID người gửi báo cáo'
      },
      content: {
        type: String,
        required: 'Xin nhập lý do báo cáo vi phạm',
        trim: true
      },
      isConsidered: {
        type: Boolean,
        default: false
      }
    }]
  }]
});

CompanySchema.index({ name: 'text', alias: 'text' });

CompanySchema.methods.calculateRating = function(callback) {
  // Đếm các điểm số khác nhau và số lượng của chúng
  var counter = this.reviews.reduce(function (counter, item) {
    if(['approved', 'trusted'].indexOf(item.state) === -1) return counter; // Bỏ qua các bài đánh giá chưa chấp nhận
    var rate = Math.round(parseFloat(item.overallRev.rating) * 10) / 5; // Nhân đôi để dễ tính
    counter[rate] = counter.hasOwnProperty(rate) ? counter[rate] + 1 : 1;
    return counter;
  }, {});
  
  // Tính toán điểm trung bình theo Baynesia
  // Xem thêm ở http://www.evanmiller.org/ranking-items-with-star-ratings.html
  var firstPart = 0, secondPart = 0;
  var quantile = 1.96; // Mức độ chính xác thông thường
  var score = 0;
  var K = 9, N = 0; // K = 9 vì người dùng không thể bình chọn 0 sao được.
  var company = this;

  // Tính toán điểm trung bình đơn giản
  var avgScore = 0;
  async.series([
    // Đếm tổng số bài đánh giá được tính vào công thức
    function(seriesCallback) {
      async.forEachOf(counter, function(item, key, callback) {
        N += counter[key];
        callback();
      }, function(err) {
        if(err) return seriesCallback(err);
        else return seriesCallback(null);
      });
    },
    // Tính 2 điểm theo công thức
    function(seriesCallback) {
      async.forEachOf(counter, function(item, key, callback) {
        firstPart += key * (counter[key] + 1);
        secondPart += key * key * (counter[key] + 1);

        avgScore += key * counter[key];
        callback();
      }, function(err) {
        if (err) return seriesCallback(err);
        firstPart /= (N + K);
        secondPart /= (N + K);
        score = firstPart - quantile * Math.sqrt((secondPart - firstPart * firstPart) / (N + K + 1));
        score /= 2;

        avgScore /= (N * 2.0); // Cần 1.0 để kết quả là phân số thập phân thay vì số nguyên
        return seriesCallback(null);
      });
    }
  ],
  function(err) {
    if (err) return console.log(err);
    // Lưu kết quả vào DB
    company.overallRating = score;
    company.averageRating = avgScore;
    company.save(function(err, result){
      if (err) {
        if(callback) return callback(err);
        else console.log(err);
      } else {
        if(callback) return callback(null, score);
      }
    });
  });
};

module.exports = mongoose.model('Company', CompanySchema);