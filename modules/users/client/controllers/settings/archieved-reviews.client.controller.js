'use strict';

angular.module('users').controller('ArchivedReviewsController', ['$http', '$location', 'PostedReviews', 'BookmarkedReviews', 'Authentication',
  function ($http, $location, PostedReviews, BookmarkedReviews, Authentication) {
    var vm = this;
    vm.user = Authentication.user;
    //alert(JSON.stringify(Authentication.user));
    PostedReviews.query({ userId: vm.user._id }, function (data) {
      vm.postedReviews = data;
    });

    BookmarkedReviews.query({}, function (data) {
      vm.bookmarkedReviews = data;
    });
    
  }
]);
