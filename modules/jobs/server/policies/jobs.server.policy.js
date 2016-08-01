'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Jobs Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin', 'mod'],
    allows: [{
      resources: '/api/jobs',
      permissions: '*'
    }, {
      resources: '/api/jobs/:jobId',
      permissions: '*'
    }]
  }, {
    roles: ['user', 'guest'],
    allows: [{
      resources: '/api/jobs',
      permissions: ['get']
    }, {
      resources: '/api/jobs/:jobId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Jobs Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Job is being processed and the current user created it then allow any manipulation
  if (req.job && req.user && req.job.user && req.job.user.id === req.user.id) {
    return next();
  }

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
