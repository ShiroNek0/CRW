'use strict';

/**
 * Module dependencies
 */
var companiesPolicy = require('../policies/companies.server.policy'),
  companies = require('../controllers/companies.server.controller');

module.exports = function(app) {
  app.route('/api/companies').all(companiesPolicy.isAllowed)
    .get(companies.listNormal)
    .post(companies.create);

  app.route('/api/companies/waitingReviews').all(companiesPolicy.isAllowed)
    .get(companies.listWaitingReviews);

  app.route('/api/companies/reportedReviews').all(companiesPolicy.isAllowed)
    .get(companies.listReportedReviews);

  app.route('/api/companies/bookmarkedReviews').all(companiesPolicy.isAllowed)
    .get(companies.listBookmarkedReviews);

  app.route('/api/companies/postedReviews').all(companiesPolicy.isAllowed)
    .get(companies.listUserReviews);

  app.route('/api/companies/:companyId').all(companiesPolicy.isAllowed)
    .get(companies.read)
    .put(companies.update)
    .delete(companies.delete);

  app.route('/api/companies/:companyId/follow').all(companiesPolicy.isAllowed)
    .post(companies.changeFollow);

  app.route('/api/companies/:companyId/reviews').all(companiesPolicy.isAllowed)
    .get(companies.read)
    .post(companies.createReview);

  app.route('/api/companies/:companyId/reviews/:reviewId').all(companiesPolicy.isAllowed)
    .get(companies.readReview)
    .put(companies.updateReview)
    .delete(companies.deleteReview);

  app.route('/api/companies/:companyId/reviews/:reviewId/reports').all(companiesPolicy.isAllowed)
    .get(companies.listReportNormal)
    .post(companies.createReport);

  app.route('/api/companies/:companyId/reviews/:reviewId/reports/accept').all(companiesPolicy.isAllowed)
    .post(companies.acceptReport);

  app.route('/api/companies/:companyId/reviews/:reviewId/reports/reject').all(companiesPolicy.isAllowed)
    .post(companies.rejectReport);

  app.route('/api/companies/:companyId/reviews/:reviewId/upvote').all(companiesPolicy.isAllowed)
    .post(companies.changeVote);

  app.route('/api/companies/:companyId/reviews/:reviewId/comments').all(companiesPolicy.isAllowed)
    .post(companies.createComment);

  app.route('/api/companies/:companyId/reviews/:reviewId/comments/:commentId').all(companiesPolicy.isAllowed)
    .delete(companies.deleteComment);

  // Finish by binding the Company middleware
  app.param('companyId', companies.companyByID);
  app.param('reviewId', companies.reviewById);
  app.param('commentId', companies.commentById);
};
