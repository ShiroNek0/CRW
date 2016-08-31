'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  async = require('async'),
  EventEmitter = require('events'),
  serverEmitter = new EventEmitter(),
  User = mongoose.model('User');

exports.notiEventEmitter = serverEmitter;

/*
 *
 *
 *
 ************SERVER METHODS***************
 *
 *
 *
 */

exports.trimInfoUser = function(item, parentCallback) {
  item = item instanceof User ? item.toJSON() : item;
  var newUser = {};
  newUser._id = item._id;
  newUser.name = item.name;
  newUser.email = item.email;
  newUser.provider = item.provider;
  newUser.providerData = item.providerData;
  if (newUser.providerData && newUser.providerData.accessToken) {
    delete newUser.providerData.accessToken;
  }
  newUser.profileImageURL = item.profileImageURL;
  newUser.description = item.description;
  newUser.roles = item.roles;
  newUser.accState = item.accState;
  newUser.postedReviews = item.postedReviews;
  if (parentCallback) parentCallback(newUser);
};

exports.trimInfoUserList = function(list, parentCallback) {
  var newList = [];
  async.forEachOf(list, function(element, key, callback) {
    exports.trimInfoUser(element, function(result) {
      newList.push(result);
      callback();
    });
  }, function (err) {
    if (err) return null;
    if (parentCallback) parentCallback(newList);
  });
};

 /*
 *
 *
 *
 ************PROFILE METHODS***************
 *
 *
 *
 */

exports.update = function (req, res) {
  // Init Variables

  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);

    user.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            exports.trimInfoUser(user, function(result) {
              res.jsonp(result);
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'Người dùng chưa đăng nhập'
    });
  }
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  var user = req.user;
  var message = null;
  var upload = multer(config.uploads.profileUpload).single('newProfilePicture');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;

  if (user) {
    upload(req, res, function (uploadError) {
      if (uploadError) {
        return res.status(400).send({
          message: 'Lỗi khi upload ảnh đại diện'
        });
      } else {
        user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

        user.save(function (saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                res.status(400).send(err);
              } else {
                exports.trimInfoUser(user, function(result) {
                  res.jsonp(result);
                });
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'Người dùng chưa đăng nhập'
    });
  }
};

/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};

exports.updateNotification = function(req, res) {
  var user = req.user;
  var notification = user.notification.id(req.notiId);
  notification.hasRead = true;
  user.save(function (err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.json(notification.targetLink);
    }
  });
};

exports.markAllNoti = function(req, res) {
  var noti = req.user.notification;

  async.each(noti, function(item, callback) {
    item.hasRead = true;
    callback();
  }, function(err) {
    req.user.save(function(err) {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.jsonp(noti);
      }
    });
  });
};

exports.changeBookmark = function(req, res) {
  if (req.body.bookmarked === 'undefined' || (typeof req.body.bookmarked !== 'boolean')) {
    return res.status(400).json({
      message: 'request body không đúng định dạng {"bookmarked": [giá trị boolean], "reviewId": "[ID bài đánh giá]"}'
    });
  }

  var user = req.user;
  var bookmark = user.bookmark;
  var reviewId = req.body.reviewId;
  var arrayFound = bookmark.filter(function(item) {
    return item.toHexString() === reviewId;
  });

  if (!req.body.bookmarked) {
    if (arrayFound.length === 0) {
      bookmark.push(reviewId);
    }
  } else {
    if (arrayFound.length > 0) {
      bookmark.pull(reviewId);
    }
  }

  user.save(function (err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(bookmark);
    }
  });
};

/*
 *
 *
 *
 ************SERVER METHODS***************
 *
 *
 *
 */

exports.createNotification = function (userId, notification, parentCallback) {
  User.findOne({ _id: userId }).exec(function (err, user) {
    if (!err && user) {
      var newNoti = user.notification.create(notification);
      user.notification.push(newNoti);
      user.save(function (err) {
        if (err) {
          console.log(errorHandler.getErrorMessage(err));
        }

        newNoti.userId = user._id; // ID để nhận dạng người cần nhận thông báo
        // Gửi thông báo cho client
        serverEmitter.emit('notification', newNoti);
      });
    }
    if (parentCallback) parentCallback();
  });
};

exports.changeFollow = function(companyId, userId, isFollowed) {
  User.findOne({ _id: userId }).exec(function (err, user) {
    if (err) {
      return err;
    } else if (!user) {
      return new Error('Không tìm thấy người dùng với ID tương ứng');
    }
    var follow = user.follow;
    var arrayFound = follow.filter(function(item) {
      return item.equals(companyId);
    });

    if (!isFollowed) {
      if (arrayFound.length === 0) {
        follow.push(companyId);
      }
    } else {
      if (arrayFound.length > 0) {
        follow.pull(companyId);
      }
    }

    user.save(function (err, result) {
      if (err) return err;
      else return;
    });
  });
};

/**
 * User middleware
 */
exports.notiByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'ID thông báo không hợp lệ'
    });
  }

  User.findOne({ _id: req.user._id, 'notification._id': id }).exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Không tìm thấy thông báo với ID tương ứng'));
    }

    req.notiId = id;
    next();
  });
};
