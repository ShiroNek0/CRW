'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  companies = require(path.resolve('./modules/companies/server/controllers/companies.server.controller')),
  users = require(path.resolve('./modules/users/server/controllers/users/users.profile.server.controller'));

/**
 * Show the current user
 */
exports.read = function (req, res) {
  companies.listPostedReviews(req.model._id, req.user._id, function (err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var user = req.model.toJSON();
      user.postedReviews = result;
      users.trimInfoUser(user, function(result) {
        res.jsonp(result);
      });
    }
  });
};

/**
 * Update a User
 */
exports.update = function (req, res) {
  var user = req.model;

  //For security purposes only merge these parameters
  user.roles = req.body.roles;
  user.accState = req.body.accState;

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    users.trimInfoUser(user, function(result) {
      res.jsonp(result);
    });
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var user = req.model;

  user.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    users.trimInfoUser(user, function(result) {
      res.jsonp(result);
    });
  });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
  User.find({}, '-salt -password').sort('-created').populate('user', 'name').exec(function (err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    users.trimInfoUserList(result, function(userList) {
      res.jsonp(userList);
    });
  });
};

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'ID người dùng không hợp lệ'
    });
  }

  User.findById(id, '-salt -password').exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Không tìm thấy người dùng với ID tương ứng'));
    }

    req.model = user;
    next();
  });
};
