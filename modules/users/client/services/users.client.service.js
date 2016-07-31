'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', { userId: '@_id' }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

angular.module('users').factory('PostedReviews', ['$resource',
  function ($resource) {
    return $resource('/api/companies/postedReviews/:userId');
  }
]);

angular.module('users').factory('BookmarkedReviews', ['$resource',
  function ($resource) {
    return $resource('/api/companies/bookmarkedReviews');
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
