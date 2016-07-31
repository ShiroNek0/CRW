'use strict';

angular.module('users').controller('BookmarkedReviewsController', ['$scope', '$http', '$location', 'BookmarkedReviews', 'Authentication',
  function ($scope, $http, $location, BookmarkedReviews, Authentication) {
    $scope.user = Authentication.user;

    BookmarkedReviews.query({}, function (data) {
      $scope.bookmarkedReviews = data;
    });
    
    
  }
]);
