'use strict';

angular.module('users').controller('PostedReviewsController', ['$scope', '$http', '$location', 'PostedReviews', 'Authentication',
  function ($scope, $http, $location, PostedReviews, Authentication) {
    $scope.user = Authentication.user;
    //alert(JSON.stringify(Authentication.user));
    PostedReviews.query({ userId: $scope.user._id }, function (data) {
      $scope.postedReviews = data;
    });
    
  }
]);
