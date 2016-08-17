'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  Company = mongoose.model('Company'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  jobs = require(path.resolve('./modules/jobs/server/controllers/jobs.server.controller')),
  users = require(path.resolve('./modules/users/server/controllers/users/users.profile.server.controller')),
  _ = require('lodash'),
  async = require('async');

/*
 *
 *
 *
 ************INTERNAL METHODS***************
 *
 *
 *
 */

function broadcastMessage(list, notification) {
  async.each(list, function(target, callback) {
    users.createNotification(target, notification, callback);
  });
}

function trimInfoCompany(item, parentCallback) {
  var company = item instanceof Company ? item.toJSON() : item;

  var numOfReviews = 0;

  async.forEachOf(item.reviews, function(element, key, callback) {
    if (['approved', 'trusted'].indexOf(element.state) >= 0) {
      numOfReviews++;
    }
    callback();
  }, function (err) {
    if (!err) {
      company.numOfReviews = numOfReviews;
    }
    company.numOfFollowers = item.followers ? item.followers.length : 0;
    delete company.reviews;
    delete company.followers;
    if (parentCallback) parentCallback(company);
  });
}

function sortAndFilterPassedReview(item, parentCallback) {
  var company = item instanceof Company ? item.toJSON() : item;

  async.filter(item.reviews, function (element, callback) {
    callback(['approved', 'trusted'].indexOf(element.state) >= 0); // Chỉ lấy các bài được duyệt
  }, function (filterResult) {
    company.reviews = filterResult.reverse(); // Xếp bài đánh giá mới nhất lên đầu
    parentCallback(company);
  });
}

// Parameter chấp nhận: name, rating=[asc, desc] (xếp theo overallRating), newestReview=[asc, desc], limit
function list(req, res, findCriteria, projectCriteria, sortCriteria, limitCriteria) {
  var findCondition = findCriteria || {};
  var projectionCondition = projectCriteria || {};
  var sortCondition = sortCriteria || {};
  var limitCondition = limitCriteria || 0;

  if (req.query.name) {
    findCondition.$text = {};
    findCondition.$text.$search = req.query.name;

    projectionCondition.score = {};
    projectionCondition.score.$meta = 'textScore';

    sortCondition.score = {};
    sortCondition.score.$meta = 'textScore';
  }

  if (req.query.rating && (req.query.rating === 'asc' || req.query.rating === 'desc')) {
    sortCondition.overallRating = req.query.rating;
  }

  if (req.query.newestReview && (req.query.newestReview === 'asc' || req.query.newestReview === 'desc')) {
    sortCondition['reviews.lastUpdated'] = req.query.newestReview;
  }

  var limit = parseInt(req.query.limit, 10);
  if (!isNaN(limit) && limit > 0) limitCondition = limit;

  // Lấy từ công ty mới nhất
  sortCondition._id = -1;

  Company.find(findCondition).select(projectionCondition).sort(sortCondition).limit(limitCondition).lean().exec(function(err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var arrayResult = [];
      async.each(result, function(item, eachCallback) {
        trimInfoCompany(item, function (result) {
          arrayResult.push(result);
          eachCallback();
        });
      }, function(err) {
        if (err) console.log('trimInfoCompany fail');
        else res.jsonp(arrayResult);
      });
    }
  });
}

function listReport(req, res, findCriteria) {
  var findCondition = findCriteria || {};
  var arrayResult = req.review.reports;

  arrayResult = _.filter(arrayResult, function (element) {
    if (findCondition) {
      if (findCondition.hasOwnProperty('isConsidered')) {
        if (element.isConsidered === findCondition.isConsidered) return true;
      }
    }
    return false;
  });

  res.jsonp(arrayResult.reverse());
}

/*
 *
 *
 *
 ************SERVER METHODS***************
 *
 *
 *
 */

exports.listPostedReviews = function (id, userId, callback) {
  var matchCondition = { $match: { 'reviews.userID': id, 'reviews.stayAnonymous': false, 'reviews.state': { $in: ['approved', 'trusted'] } } };
  if (userId.equals(id))
    matchCondition = { $match: { 'reviews.userID': id } };

  Company.aggregate([{ $unwind: '$reviews' }, matchCondition])
  .exec(function (err, companies) {
    return callback(err, companies);
  });
};

exports.countWaitingReviews = function (callback) {
  Company.aggregate([{ $unwind: '$reviews' }, { $match: { 'reviews.state': 'waiting' } }])
  .exec(function (err, company) {
    if (err) {
      return null;
    } else {
      return callback ? callback(company.length) : null;
    }
  });
};

exports.countReportedReviews = function(callback) {
  Company.aggregate([{ $unwind: '$reviews' }, { $match: { 'reviews.state': { $in: ['approved', 'trusted'] } } }])
  .exec(function (err, result) {
    var reportedReviews = [];
    async.forEachOf(result, function(company, index, callback) {
      if (company.reviews.reports && company.reviews.reports.length > 0) {
        async.detect(company.reviews.reports, function(report, callback) {
          return callback(!report.isConsidered);
        }, function(result) {
          if (result) reportedReviews.push(company);
        });
      }
      callback();
    }, function (err) {
      if (err) {
        return null;
      } else {
        return callback ? callback(reportedReviews.length) : null;
      }
    });
  });
};

/*
 *
 *
 *
 ************STATISTICS METHOD***************
 *
 *
 *
 */

exports.getCompanyStatistics = function(req, res) {
  Company.aggregate([
    { $match: { 'state': 'approved' } },
    { $project: {
      name: 1,
      followers: 1,
      // document: '$$ROOT'
      filteredReviews: { $filter: {
        input: '$reviews',
        as: 'rev',
        cond: {
          $setIsSubset: [{ $map: {
            input: ['A'],
            as: 'el',
            in: '$$rev.state' } },
            ['approved', 'trusted']]
        }
      } }
    } },
    { $project: { name: 1, numOfFilteredReviews: { $size: '$filteredReviews' }, numOfFollowers: { $size: '$followers' } } }
  ]).exec(function (err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var stat = {};
      stat.numOfCompanies = result.length;
      stat.companies = result;
      res.jsonp(stat);
    }
  });
};

exports.getReviewStatistics = function(req, res) {
  if (!req.company.reviews) return res.send('Công ty không có bài đánh giá nào');

  var stat = { reviews: [] };
  var arrayResult = req.company.reviews;

  arrayResult = _.filter(arrayResult, function (element) {
    return (['approved', 'trusted'].indexOf(element.state) >= 0);
  });

  // Đếm số bài đánh giá theo rating
  stat.rating = _.countBy(arrayResult, function(rev) {
    return rev.overallRev.rating;
  });

  var salBen = { };
  async.forEachOf(arrayResult, function(rev, index, callback) {
    // Lấy tổng điểm và số lượng điểm cho mỗi tiêu chí
    async.forEachOf(rev.salaryAndBenefit.toJSON(), function(value, key, callback_step) {
      if (!salBen[key]) salBen[key] = { value: 0, count: 0 };
      salBen[key].value += value;
      salBen[key].count += 1;
      callback_step();
    }, function(err) {
      if (err) return callback(err);
      async.forEachOf(salBen, function(value, key, callback_final) {
        salBen[key].avg = salBen[key].value * 1.0 / salBen[key].count;
        callback_final();
      });
    });

    // Lấy số báo cáo và bình luận
    stat.reviews.push({
      _id: rev._id,
      numOfReports: rev.reports.length,
      numOfComments: rev.comments.length
    });
    callback();
  }, function(err) {
    if (err) {
      return res.status(400).send({
        message: 'Lỗi khi lấy dữ liệu'
      });
    } else {
      stat.salaryAndBenefit = salBen;
      res.jsonp(stat);
    }
  });
};

/*
 *
 *
 *
 ************COMPANY METHODS***************
 *
 *
 *
 */

exports.create = function(req, res) {
  // Người dùng không phải admin hoặc mod
  if (!req.user ||
    (req.user && Array.isArray(req.user.roles) && req.user.roles.indexOf('mod') === -1 && req.user.roles.indexOf('admin') === -1)) {
    delete req.body.state;
  }
  // Bỏ các trường không cần thiết
  delete req.body.reviews;
  delete req.body.followers;
  delete req.body.overallRating;

  var company = new Company(req.body);
  company.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(company);
    }
  });
};

exports.read = function(req, res) {
  // Người dùng không phải admin hoặc mod
  if (!req.user ||
    (req.user && Array.isArray(req.user.roles) && req.user.roles.indexOf('mod') === -1 && req.user.roles.indexOf('admin') === -1)) {
    if (req.company.state !== 'approved' && req.company.state !== 'trusted') {
      return res.status(403).render({
        message: 'Bạn không có quyền hạn truy cập trang này'
      });
    }
  }

  sortAndFilterPassedReview(req.company, function (item) {
    var company = item instanceof Company ? item.toJSON() : item;

    var numOfReviews = 0;

    async.forEachOf(item.reviews, function(element, key, callback) {
      if (['approved', 'trusted'].indexOf(element.state) >= 0) {
        numOfReviews++;
      }
      callback();
    }, function (err) {
      if (!err) {
        company.numOfReviews = numOfReviews;
      }
      company.numOfFollowers = item.followers ? item.followers.length : 0;
      res.jsonp(company);
    });
  });
};

exports.update = function(req, res) {
  // Bỏ các trường không cần thiết
  delete req.body.reviews;

  var company = req.company;

  company = _.extend(company, req.body);
  company.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      sortAndFilterPassedReview(req.company, function (item) {
        res.jsonp(item);
      });
    }
  });
};

exports.delete = function(req, res) {
  var company = req.company;

  company.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.send('Đã xóa công ty ' + company.name);
    }
  });
};

exports.listNormal = function(req, res) {
  list(req, res);
};

exports.listFollowed = function (req, res) {
  var findCondition = { '_id': { $in: req.user.follow } };
  list(req, res, findCondition);
};

exports.changeFollow = function(req, res) {
  if (req.body.followed === 'undefined' || (typeof req.body.followed !== 'boolean')) {
    return res.status(400).json({
      message: 'request body không đúng định dạng {"followed": [giá trị boolean]}'
    });
  }

  var company = req.company;
  var followers = company.followers;
  var userID = req.user._id;
  var arrayFound = followers.filter(function(item) {
    return item.equals(userID);
  });

  if (!req.body.followed) {
    if (arrayFound.length === 0) {
      followers.push(userID);
    }
  } else {
    if (arrayFound.length > 0) {
      followers.pull(userID);
    }
  }

  async.series([
    function(callback) {
      company.save(function (err) {
        callback(err);
      });
    },
    function(callback) {
      callback(users.changeFollow(company._id, req.user, req.body.followed));
    }
  ], function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.send(followers);
    }
  });
};

/*
 *
 *
 *
 ************REVIEW METHODS***************
 *
 *
 *
 */

exports.createReview = function(req, res) {
  // Ngăn cản sửa đổi các trường không đủ quyền hạn
  if (!req.user ||
    (req.user && Array.isArray(req.user.roles) && req.user.roles.indexOf('mod') === -1 && req.user.roles.indexOf('admin') === -1)) {
    delete req.body.newReview.state;
    delete req.body.newReview.highlight;
  }

  // Bỏ các trường không cần thiết
  delete req.body.newReview._id;
  delete req.body.newReview.reports;
  delete req.body.newReview.comments;
  delete req.body.newReview.lastUpdated;
  delete req.body.newReview.upvoteCount;
  delete req.body.newReview.upvoteUsers;

  var company = req.company;
  var review = req.body.newReview;
  if (req.user) {
    review.userID = req.user._id;
  }
  review = company.reviews.create(review);
  company.reviews.push(review);
  company.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      jobs.createList(review.job);
      if (review.state === 'waiting') {
        users.notiEventEmitter.emit('review waiting');
      }
      // Nếu người gửi bài là admin hoặc mod
      if (req.user && Array.isArray(req.user.roles) &&
        (req.user.roles.indexOf('mod') >= 0 || req.user.roles.indexOf('admin') >= 0)) {
        if (_.contains(['approved', 'trusted'], review.state)) {
          // Bài vừa gửi lên đã set approved hoặc trusted luôn
          // Gửi thông báo tới người theo dõi
          broadcastMessage(company.followers, {
            message: (req.user ? req.user.name : 'Người dùng ẩn') + ' đăng bài đánh giá mới cho công ty ' + company.name,
            targetLink: '/companies/' + company._id + '/reviews/' + review._id
          });
        }
      }
      res.jsonp(company);
    }
  });
};

exports.readReview = function(req, res) {
  // Người dùng không phải admin, mod hoặc người viết bài
  if (!req.user ||
    (req.user && Array.isArray(req.user.roles) &&
      req.user.roles.indexOf('mod') === -1 &&
      req.user.roles.indexOf('admin') === -1 &&
      !(req.review.userID && req.user._id.equals(req.review.userID._id)))) {
    if (!_.contains(['approved', 'trusted'], req.review.state)) {
      return res.status(403).send({
        message: 'Bạn không có quyền hạn truy cập trang này'
      });
    }
  }

  var company = req.company;
  trimInfoCompany(company, function (item) {
    item.reviews = req.review;
    res.jsonp(item);
  });
};

exports.updateReview = function(req, res) {
  var company = req.company;
  var review = req.review;
  var oldState = review.state;
  var oldJob = review.job;
  // Ngăn cản sửa đổi các trường không đủ quyền hạn
  if (!review.userID || !req.user._id.equals(review.userID._id)) {
    // Là người dùng nhưng không phải người sở hữu bài
    if (req.user.roles && Array.isArray(req.user.roles) &&
      (req.user.roles.indexOf('mod') !== -1 || req.user.roles.indexOf('admin') !== -1)) {
      // Là mod hoặc admin, chỉ được thay đổi trạng thái bài
      review.state = req.body.reviews.state;
      review.highlight = req.body.reviews.highlight;
    } else {
      return res.status(403).json({
        message: 'Bạn không có quyền hạn truy cập trang này'
      });
    }
  } else {
    // Là người sở hữu bài
    if (!(req.user.roles && Array.isArray(req.user.roles) &&
      (req.user.roles.indexOf('mod') !== -1 || req.user.roles.indexOf('admin') !== -1))) {
      // Người sở hữu bài là người dùng bình thường
      req.body.reviews.state = 'waiting'; // Chờ duyệt lại
      delete req.body.reviews.highlight;
    }
    // Bỏ các trường không cần thiết
    delete req.body.reviews.upvoteCount;
    delete req.body.reviews.userID;
    delete req.body.reviews.upvoteUsers;
    delete req.body.reviews.lastUpdated;
    delete req.body.reviews.comments;
    _.extend(review, req.body.reviews);
    review.lastUpdated = Date.now();
  }

  company.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Bài đăng được chấp nhận: đổi trạng thái sang approved hoặc trusted
      if (!_.contains(['approved', 'trusted'], oldState) && _.contains(['approved', 'trusted'], review.state)) {
        // Cập nhật nghề mới
        jobs.createList(review.job);
        // Gửi thông báo tới người theo dõi
        broadcastMessage(company.followers, {
          message: (req.user ? req.user.name : 'Người dùng ẩn') + ' đăng bài đánh giá mới cho công ty ' + company.name,
          targetLink: '/companies/' + company._id + '/reviews/' + review._id
        });

        // Gửi thông báo tới người viết bài
        if (review.userID) {
          broadcastMessage([review.userID._id], {
            message: 'Bài đánh giá mang tên ' + review.title + ' của bạn đã được duyệt',
            targetLink: '/companies/' + company._id + '/reviews/' + review._id
          });
        }
      } else if (oldState !== 'denied' && review.state === 'denied') {
        // Bài đăng bị từ chối: đổi trạng thái từ sang denied
        // Gửi thông báo tới người viết bài
        if (review.userID) {
          broadcastMessage([review.userID._id], {
            message: req.body.deniedReason,
            targetLink: '/companies/' + company._id + '/editReview/' + review._id
          });
        }
      }

      // Gửi thông báo tới admin và mod khi một bài ra khỏi trạng thái chờ
      if ((oldState === 'waiting' && review.state !== 'waiting') || (oldState !== 'waiting' && review.state === 'waiting')) {
        users.notiEventEmitter.emit('review waiting');
      }

      res.jsonp(review);
    }
  });
};

exports.deleteReview = function(req, res) {
  var company = req.company;
  var review = req.review;
  var oldState = review.state;
  // Ngăn cản xóa bài nếu không đủ quyền hạn
  if (!req.user || !req.user._id.equals(review.userID._id)) {
    // Là người dùng nhưng không phải người sở hữu bài
    if (Array.isArray(req.user.roles) && (req.user.roles.indexOf('mod') !== -1 || req.user.roles.indexOf('admin') !== -1)) {
      // Là mod hoặc admin
    } else {
      return res.status(403).json({
        message: 'Bạn không có quyền hạn truy cập trang này'
      });
    }
  }
  review.remove();
  company.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Gửi thông báo tới admin và mod khi một bài ở trạng thái chờ bị xóa
      if (oldState === 'waiting') {
        users.notiEventEmitter.emit('review waiting');
      }
      res.send('Đã xóa bài đánh giá ' + review.title);
    }
  });
};

exports.listUserReviews = function (req, res) {
  var id;
  if (req.query.userId) {
    id = mongoose.Types.ObjectId(req.query.userId);
  } else if (req.user && req.user._id) {
    id = req.user._id;
  } else return res.send();
  exports.listPostedReviews(id, req.user._id, function (err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(result);
    }
  });
};

exports.listBookmarkedReviews = function (req, res) {
  Company.aggregate([{ $unwind: '$reviews' }, { $match: { 'reviews._id': { $in: req.user.bookmark } } }])
  .exec(function (err, company) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(company);
    }
  });
};

exports.listWaitingReviews = function (req, res) {
  Company.aggregate([{ $unwind: '$reviews' }, { $match: { 'reviews.state': 'waiting' } }])
  .exec(function (err, company) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(company);
    }
  });
};

exports.listReportedReviews = function(req, res) {
  Company.aggregate([{ $unwind: '$reviews' }, { $match: { 'reviews.state': { $in: ['approved', 'trusted'] } } }])
  .exec(function (err, result) {
    var reportedReviews = [];
    async.forEachOf(result, function (company, index, callback) {
      // Bài đánh giá này có báo cáo nào chưa xử lý không
      async.detect(company.reviews.reports, function(report, detectCallback) {
        return detectCallback(!report.isConsidered);
      }, function(result) {
        if (result) {
          // Có ít nhất một báo cáo chưa xử lý
          // Populate thông tin người viết báo cáo
          async.forEachOf(company.reviews.reports, function (elem, reportIndex, reportCallback) {
            User.findById(elem.user).exec(function (err, result) {
              var reporter = {
                '_id': result._id,
                'name': result.name,
                'profileImageURL': result.profileImageURL
              };
              company.reviews.reports[reportIndex].user = reporter;
              reportCallback();
            });
          }, function (err) {
            reportedReviews.push(company);
            callback();
          });
        } else callback();
      });
    }, function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(reportedReviews);
      }
    });
  });
};

// JSON đầu vào có dạng {"upvoted": true/false}
exports.changeVote = function(req, res) {
  if (req.body.upvoted === 'undefined' || (typeof req.body.upvoted !== 'boolean')) {
    return res.status(400).json({
      message: 'request body không đúng định dạng {"upvoted": [giá trị boolean]}'
    });
  }

  var company = req.company;
  var upvoteUsers = req.review.upvoteUsers;
  var userID = req.user._id;
  var arrayFound = upvoteUsers.filter(function(item) {
    return item.equals(userID);
  });

  if (!req.body.upvoted) {
    if (arrayFound.length === 0) {
      upvoteUsers.push(userID);
      req.review.upvoteCount += 1;
    }
  } else {
    if (arrayFound.length > 0) {
      upvoteUsers.pull(userID);
      req.review.upvoteCount -= 1;
    }
  }

  req.company.save(function (err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(upvoteUsers);
    }
  });
};

exports.listReportNormal = function(req, res) {
  var findCondition = { 'isConsidered': false };
  listReport(req, res, findCondition);
};

exports.createReport = function(req, res) {
  var company = req.company;
  var oldReports = req.review.reports.slice(0);
  var report = req.body;
  report.user = req.user._id;

  report = req.review.reports.create(report);
  req.review.reports.push(report);
  company.save(function(err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Chỉ phát sự kiện cập nhật báo cáo khi review chưa có báo cáo chưa xử lý từ trước đó
      async.detect(oldReports, function(item, callback) {
        return callback(!item.isConsidered);
      }, function(result) {
        if (!result) users.notiEventEmitter.emit('review reported');
      });

      res.jsonp(report);
    }
  });
};

exports.acceptReport = function(req, res) {
  var review = req.review;
  var newReports;

  review.state = 'denied';
  newReports = _.map(review.reports, function(item) {
    if (!item.isConsidered) item.isConsidered = true;
    return item;
  });
  req.company.save(function(err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Gửi thông báo tới người viết bài
      if (review.userID) {
        broadcastMessage([review.userID._id], {
          message: req.body.deniedReason,
          targetLink: '/companies/' + req.company._id + '/editReview/' + review._id
        });
      }

      // Cập nhật số bài bị báo cáo cho admin và mod
      users.notiEventEmitter.emit('review reported');

      res.send('Đã khóa bài đăng');
    }
  });
};

exports.rejectReport = function(req, res) {
  var review = req.review;
  var newReports;

  newReports = _.map(review.reports, function(item) {
    if (!item.isConsidered) item.isConsidered = true;
    return item;
  });
  req.company.save(function(err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Cập nhật số bài bị báo cáo cho admin và mod
      users.notiEventEmitter.emit('review reported');

      res.send('Đã đánh dấu duyệt các báo cáo');
    }
  });
};

/*
 *
 *
 *
 ************COMMENT METHODS***************
 *
 *
 *
 */

exports.createComment = function(req, res) {
  var company = req.company;
  var review = req.review;
  var comment = req.body;
  comment.userID = req.user._id;

  comment = req.review.comments.create(comment);
  req.review.comments.push(comment);
  company.save(function(err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Gửi thông báo tới người viết bài nếu có người khác bình luận
      if (review.userID && !review.userID._id.equals(comment.userID)) {
        broadcastMessage([review.userID._id], {
          message: req.user.name + ' đã thêm một bình luận vào bài đánh giá mang tên ' + review.title + ' của bạn',
          targetLink: '/companies/' + company._id + '/reviews/' + review._id
        });
      }
      res.jsonp(comment);
    }
  });
};

exports.deleteComment = function(req, res) {
  // Ngăn cản xóa bình luận nếu không đủ quyền hạn
  if (!req.user || !req.user._id.equals(req.comment.userID._id)) {
    // Là người dùng nhưng không phải người sở hữu bình luận
    if (Array.isArray(req.user.roles) && (req.user.roles.indexOf('mod') !== -1 || req.user.roles.indexOf('admin') !== -1)) {
      // Là mod hoặc admin
    } else {
      return res.status(403).json({
        message: 'Bạn không có quyền hạn truy cập trang này'
      });
    }
  }

  req.comment.remove();
  req.company.save(function(err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(req.review.comments.pull(req.comment));
    }
  });
};

/*
 *
 *
 *
 ************MIDDLEWARE***************
 *
 *
 *
 */

exports.companyByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'ID công ty không hợp lệ'
    });
  }
  Company.findById(id).populate('reviews.userID', 'name accState roles profileImageURL')
  .populate('reviews.comments.userID', 'name accState roles profileImageURL')
  .exec(function (err, company) {
    if (err) {
      return next(err);
    } else if (!company) {
      return res.status(404).send({
        message: 'Không tìm thấy công ty với ID tương ứng'
      });
    }
    req.company = company;
    next();
  });
};

exports.reviewById = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'ID bài đánh giá không hợp lệ'
    });
  }

  async.detect(req.company.reviews, function(item, callback) {
    return callback(item._id.toHexString() === id);
  }, function(result) {
    if (result) {
      req.review = result;
      next();
    } else {
      return res.status(404).send({
        message: 'Không tìm thấy bài đánh giá với ID tương ứng'
      });
    }
  });
};

exports.commentById = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'ID bình luận không hợp lệ'
    });
  }

  async.detect(req.review.comments, function(item, callback) {
    return callback(item._id.toHexString() === id);
  }, function(result) {
    if (result) {
      req.comment = result;
      next();
    } else {
      return res.status(404).send({
        message: 'Không tìm thấy bình luận với ID tương ứng'
      });
    }
  });
};

exports.uploadPicture = function (req, res) {
  
  var message = null;
  var upload = multer(config.uploads.companyPictureUpload).single('newCompanyPicture');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;
  upload(req, res, function (uploadError) {
    if (uploadError) {
      return res.status(400).send({
        message: 'Lỗi khi upload (Ảnh up lên phải có dung lượng < 1MB)'
      });
    } else {
      res.send({ url: config.uploads.companyPictureUpload.dest + req.file.filename });
    }
  });
};