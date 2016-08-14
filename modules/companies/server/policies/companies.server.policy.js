'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Companies Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin', 'mod'],
    allows: [{
      resources: '/api/companies',
      permissions: '*'
    }, {
      resources: '/api/companies/waitingReviews',
      permissions: ['get']
    }, {
      resources: '/api/companies/reportedReviews',
      permissions: ['get']
    }, {
      resources: '/api/companies/bookmarkedReviews',
      permissions: ['get']
    }, {
      resources: '/api/companies/postedReviews',
      permissions: ['get']
    }, {
      resources: '/api/companies/:companyId',
      permissions: '*'
    }, {
      resources: '/api/companies/:companyId/follow',
      permissions: '*'
    }, {
      resources: '/api/companies/:companyId/reviews',
      permissions: '*'
    }, {
      resources: '/api/companies/:companyId/reviews/:reviewId',
      permissions: '*'
    }, {
      resources: '/api/companies/:companyId/reviews/:reviewId/reports',
      permissions: '*'
    }, {
      resources: '/api/companies/:companyId/reviews/:reviewId/reports/accept',
      permissions: '*'
    }, {
      resources: '/api/companies/:companyId/reviews/:reviewId/reports/reject',
      permissions: '*'
    }, {
      resources: '/api/companies/:companyId/reviews/:reviewId/upvote',
      permissions: '*'
    }, {
      resources: '/api/companies/:companyId/reviews/:reviewId/comments',
      permissions: ['post']
    }, {
      resources: '/api/companies/:companyId/reviews/:reviewId/comments/:commentId',
      permissions: ['delete']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/companies',
      permissions: '*'
    }, {
      resources: '/api/companies/bookmarkedReviews',
      permissions: ['get']
    }, {
      resources: '/api/companies/postedReviews',
      permissions: ['get']
    }, {
      resources: '/api/companies/:companyId',
      permissions: ['get']
    }, {
      resources: '/api/companies/:companyId/follow',
      permissions: '*'
    }, {
      resources: '/api/companies/:companyId/reviews',
      permissions: '*'
    }, {
      resources: '/api/companies/:companyId/reviews/:reviewId',
      permissions: '*'
    }, {
      resources: '/api/companies/:companyId/reviews/:reviewId/reports',
      permissions: ['post']
    }, {
      resources: '/api/companies/:companyId/reviews/:reviewId/upvote',
      permissions: '*'
    }, {
      resources: '/api/companies/:companyId/reviews/:reviewId/comments',
      permissions: ['post']
    }, {
      resources: '/api/companies/:companyId/reviews/:reviewId/comments/:commentId',
      permissions: ['delete']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/companies',
      permissions: '*'
    }, {
      resources: '/api/companies/postedReviews',
      permissions: ['get']
    }, {
      resources: '/api/companies/:companyId',
      permissions: ['get']
    }, {
      resources: '/api/companies/:companyId/reviews',
      permissions: '*'
    }, {
      resources: '/api/companies/:companyId/reviews/:reviewId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Companies Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Lỗi cấp phép');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'Bạn không có quyền hạn truy cập trang này'
        });
      }
    }
  });
};
