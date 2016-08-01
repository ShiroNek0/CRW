'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Job = mongoose.model('Job'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  async = require('async');

exports.createList = function (list) {
  async.each(list, function(element, callback) {
    var job = new Job({ name: element });
    job.save();
    callback();
  });
};

exports.create = function(req, res) {
  var job = new Job(req.body);

  job.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(job);
    }
  });
};

exports.read = function(req, res) {
  var job = req.job ? req.job.toJSON() : {};

  res.jsonp(job);
};

exports.update = function(req, res) {
  var job = req.job;

  job = _.extend(job , req.body);

  job.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(job);
    }
  });
};

exports.delete = function(req, res) {
  var job = req.job;

  job.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(job);
    }
  });
};

exports.list = function(req, res) { 
  Job.find().exec(function(err, jobs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(jobs);
    }
  });
};

/**
 * Job middleware
 */
exports.jobByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'ID nghề nghiệp không hợp lệ'
    });
  }

  Job.findById(id).exec(function (err, job) {
    if (err) {
      return next(err);
    } else if (!job) {
      return res.status(404).send({
        message: 'Không tìm thấy nghề nghiệp với ID tương ứng'
      });
    }
    req.job = job;
    next();
  });
};