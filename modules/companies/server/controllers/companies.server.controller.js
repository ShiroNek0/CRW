'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Company = mongoose.model('Company'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Company
 */
exports.create = function(req, res) {
  var company = new Company(req.body);
  if(req.user)
    company.user = req.user;

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

/**
 * Show the current Company
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var company = req.company ? req.company.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  company.isCurrentUserOwner = req.user && company.user && company.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(company);
};

exports.readReview = function(req, res) {
  
  res.jsonp(req.review); 
};

/**
 * Update a Company
 */
exports.update = function(req, res) {
  var company = req.company ;
  
  company = _.extend(company , req.body);
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

exports.updateReview = function(req, res) {
  req.body.reviews.state="waiting";
  Company.findOneAndUpdate({ 'reviews._id': req.body.reviews._id }, { $set: { 'reviews.$': req.body.reviews } }, { new: true }, function(err, result){
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(result);
    }    
  });
};

exports.addreview = function(req, res) {
  
  
  if(req.body.newReview){
    var company = req.company;
    company.newReview = req.body.newReview;
    
    if(req.user)
      company.newReview.userID = req.user;

    Company.findOneAndUpdate({ name: company.name }, { $push: { reviews: company.newReview } }, { upsert:true }, function(err, result){
      res.jsonp(company);
    });
  }
  
};

/**
 * Delete an Company
 */
exports.delete = function(req, res) {
  var company = req.company ;

  company.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(company);
    }
  });
};

/**
 * List of Companies
 */
exports.list = function(req, res) { 
  Company.find().sort('-created').populate('user', 'displayName').exec(function(err, companies) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(companies);
    }
  });
};

exports.getRecent = function(req, res) { 
  Company.find().sort({ 'reviews.lastUpdated': -1 }).limit(4).exec(function (err, companies){
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(companies);
    }
  });
};

exports.followHandler = function(req, res) { 
  if(req.body.follow)
    Company.findOneAndUpdate({ _id: req.params.companyId }, { $push: { followers: req.body.userId } }, { upsert:true, new: true }, function(err, result){
      res.jsonp(result);      
    });
  else{
    Company.findOneAndUpdate({ _id: req.params.companyId }, { $pull: { followers : req.body.userId } }, { new: true }, function(err, result){
      res.jsonp(result);      
    });
  }
};

exports.upvoteHandler= function(req, res) {
  if(req.body.upvote)
    Company.findOneAndUpdate({ 'reviews._id': req.params.reviewId }, { $push: { 'reviews.$.upvoteUsers': req.body.userId } }, { upsert:true, new: true }, function(err, result){
      Company.aggregate([{ $unwind : '$reviews' }, { $match : { 'reviews._id': mongoose.Types.ObjectId(req.params.reviewId) } }])
          .exec(function (err, company) {
            
            //console.log(JSON.stringify(company));
            res.jsonp(company);
          });
    });
  else{
    Company.findOneAndUpdate({ 'reviews._id': req.params.reviewId }, { $pull: { 'reviews.$.upvoteUsers': req.body.userId } }, { new: true }, function(err, result){
      Company.aggregate([{ $unwind : '$reviews' }, { $match : { 'reviews._id': mongoose.Types.ObjectId(req.params.reviewId) } }])
          .exec(function (err, company) {
            
            res.jsonp(company);
          });
    });
  }
};

exports.highlightReview= function(req, res) {
    Company.findOneAndUpdate({ 'reviews._id': req.params.reviewId },
       { $set: { 'reviews.$.highlight': !req.review.reviews.highlight} },
        { upsert:true, new: true }, function(err, result){
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.jsonp(result);
            }
    
    });
  
};

exports.getWaitingReviews = function(req, res) { 
  Company.aggregate([{ $unwind : '$reviews' }, { $match : { 'reviews.state': 'waiting' } }])
          .exec(function (err, company) {
            res.jsonp(company);
          });
};

exports.getReportedReviews = function(req, res) { 
  Company.aggregate([{ $unwind : '$reviews' }, { $match : { 'reviews.state': 'approved' } }])
          .exec(function (err, results) {
            var reportedReviews = [];
            results.forEach(function(company, index){
              if(company.reviews.reports.length>0){
                var count = 0;
                company.reviews.reports.forEach(function(report){
                  if(!report.isConsidered)
                    count++;
                });
                if(count>0)
                  reportedReviews.push(company);
              }
            });

            res.jsonp(reportedReviews);

          });
};

exports.getDetailReviews= function(req, res) {
  
  //var review = req.review ? req.review.toJSON() : {};
  res.jsonp(req.review);  
};

exports.search= function(req, res) {
  // var rs = [{ params: req.params.keyword }];
  // res.jsonp(rs);  
  Company.find(
        { $text : { $search : req.params.keyword } }, 
        { score : { $meta: 'textScore' } },
        { sort: { score: { $meta: 'textScore' } } },
        function(err, results) {
         
          res.jsonp(results);
        });
};

exports.postComment= function(req, res) {
  // var rs = [{ params: req.params.keyword }];
  // res.jsonp(rs);  
  var newCmt = {
    'user': req.body.newComment.user._id,
    'postTime': Date.now(),
    'content': req.body.newComment.content
  };

  Company.findOneAndUpdate({ 'reviews._id': req.body._id }, { $push: { 'reviews.$.comments': newCmt } }, { new: true }, function(err, result){
    Company.aggregate([{ $unwind : '$reviews' }, { $match : { 'reviews._id': mongoose.Types.ObjectId(req.body._id) } }])
          .exec(function (err, company) {
            Company.populate(company, [{ path:'reviews.userID' }, { path:'reviews.comments.user' }], function(err, populatedReview) {
              
              res.jsonp(populatedReview);       
            });
          });
            
  });
};

exports.report= function(req, res) {
  Company.findOneAndUpdate({ 'reviews._id': req.review.reviews._id }, { $push: { 'reviews.$.reports': req.body } }, { new: true }, function(err, result){
    if(!err)
      res.send('ok');
  });
};

exports.acceptReport= function(req, res) {
  Company.findOneAndUpdate({ 'reviews._id': req.review.reviews._id }, { $set: { 'reviews.$.state': 'denied' } }, { new: true }, function(err, result){
    if(!err){
      var reason =[];
      var newReportArr = [];
      req.review.reviews.reports.forEach(function (report){
        if(!report.isConsidered){
          reason.push(report.content);
          report.isConsidered = true;
        }
        newReportArr.push(report);
      });

      Company.findOneAndUpdate({ 'reviews._id': req.review.reviews._id }, { $set: { 'reviews.$.reports': newReportArr } }, { new: true }, function(err, result){
        if(!err){
          if(req.review.reviews.userID){
            var annouce={
              link: 'companies/'+req.review._id+'/editReview/' + req.review.reviews._id,
              content: 'Bài đăng của bạn bị khóa vì lý do: '
            };
            reason.forEach(function(reason){
              annouce.content += reason;
              annouce.content += ', ';
            });

            annouce.content += 'bấm vào link để sửa bài.';
            User.findOneAndUpdate({ _id: req.review.reviews.userID }, { $push: { announcement: annouce } }, { upsert:true }).exec();
          }
        }
      });
      
      res.send('ok');
    }
  });
};

exports.rejectReport= function(req, res) {
  var newReportArr = [];
  req.review.reviews.reports.forEach(function (report){
    if(!report.isConsidered){
      report.isConsidered = true;
    }
    newReportArr.push(report);
  });

  Company.findOneAndUpdate({ 'reviews._id': req.review.reviews._id }, { $set: { 'reviews.$.reports': newReportArr } }, { new: true }, function(err, result){
    if(!err){
      res.send('ok');
    }
  });

};

exports.approveReview= function(req, res) {
  Company.findOneAndUpdate({ 'reviews._id': req.params.reviewId }, { $set: { 'reviews.$.state': 'approved' } }, { new: true }, function(err, company){
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      company.followers.forEach(function(userId) {
        var annouce={
          link: 'companies/' + company._id,
          content: company.name + ' co bai dang moi'
        };
        User.findOneAndUpdate({ _id: userId }, { $push: { announcement: annouce } }, { upsert:true }).exec();

      });

      if(req.review.reviews.userID){
        var annouce={
          link: 'companies/review/' + req.review.reviews._id,
          content: 'Bài đăng của bạn đã được duyệt'
        };
        User.findOneAndUpdate({ _id: req.review.reviews.userID }, { $push: { announcement: annouce } }, { upsert:true }).exec();
      }
      //if(result)
      res.send('ok');
    }

  });
};


/**
 * Company middleware
 */
exports.companyByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Company is invalid'
    });
  }

  Company.findById(id).populate('reviews.userID').exec(function (err, company) {
    if (err) {
      return next(err);
    } else if (!company) {
      return res.status(404).send({
        message: 'No Company with that identifier has been found'
      });
    }
    req.company = company;
    next();
  });
};

exports.reviewById = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Review is invalid'
    });
  }

  Company.aggregate([{ $unwind : '$reviews' }, { $match : { 'reviews._id': mongoose.Types.ObjectId(id) } }])
          .exec(function (err, company) {
            if (err) {
              return next(err);
            } else if (!company) {
              return res.status(404).send({
                message: 'No Review with that identifier has been found'
              });
            }
            // req.review = company;              
            // next();
            Company.populate(company[0], [{ path:'reviews.userID' }, { path:'reviews.comments.user' }], function(err, populatedReview) {
              req.review = populatedReview;              
              next();
            });
          });
};


exports.postedReviews = function (req, res) {
  Company.aggregate([{ $unwind : '$reviews' }, { $match : { 'reviews.userID': mongoose.Types.ObjectId(req.params.userId) } }])
        .exec(function (err, reviews){
          res.jsonp(reviews);  
        });
  
};

exports.bookmarkedReviews = function (req, res) {
  var reviewIds = [];
  for(var i =0; i< req.user.bookmark.length; i++){
    reviewIds.push(mongoose.Types.ObjectId(req.user.bookmark[i]));
  }
  Company.aggregate([{ $unwind : '$reviews' }, { $match :{ 'reviews._id': { $in: reviewIds } } }]).exec(function(err, data) {
    
    res.jsonp(data);
  });
  
};


