'use strict';

/**
 * Module dependencies
 */
var companiesPolicy = require('../policies/companies.server.policy'),
  companies = require('../controllers/companies.server.controller');

module.exports = function(app) {
  // Companies Routes
  app.route('/api/companies').all(companiesPolicy.isAllowed)
    .get(companies.list)
    .post(companies.create);

  app.route('/api/companies/getRecent').all(companiesPolicy.isAllowed)
    .get(companies.getRecent);

  app.route('/api/companies/getWaitingReviews').all(companiesPolicy.isAllowed)
    .get(companies.getWaitingReviews);
  app.route('/api/companies/getReportedReviews').get(companies.getReportedReviews);

  app.route('/api/companies/follow/:companyId').put(companies.followHandler);
  app.route('/api/companies/review/upvote/:reviewId').put(companies.upvoteHandler);

  app.route('/api/companies/search/:keyword').get(companies.search);
  app.route('/api/companies/search').get(companies.list);

  app.route('/api/companies/postedReviews/:userId').get(companies.postedReviews);
  app.route('/api/companies/bookmarkedReviews').get(companies.bookmarkedReviews);

//  app.route('/api/companies/reviews/:companyId').get(companies.getReviews);
  app.route('/api/companies/:companyId/reviews/:reviewId')
    .get(companies.readReview)
    .put(companies.updateReview);
    

  app.route('/api/companies/review/:reviewId').get(companies.getDetailReviews);
  app.route('/api/companies/review/:reviewId/approve').put(companies.approveReview);
  app.route('/api/companies/review/:reviewId/highlight').put(companies.highlightReview);

  app.route('/api/companies/review/:reviewId/postComment').put(companies.postComment);

  app.route('/api/companies/review/:reviewId/report').put(companies.report);

  app.route('/api/companies/review/:reviewId/acceptReport').put(companies.acceptReport);
  app.route('/api/companies/review/:reviewId/rejectReport').put(companies.rejectReport);

  app.route('/api/companies/:companyId').all(companiesPolicy.isAllowed)
    .get(companies.read)
    .put(companies.update)
    .delete(companies.delete);

  app.route('/api/companies/:companyId/addreview').put(companies.addreview);

  // Finish by binding the Company middleware
  app.param('companyId', companies.companyByID);
  app.param('reviewId', companies.reviewById);
};
