'use strict';

angular.module('users').controller('ArchivedReviewsController', ['$http', '$location', 'PostedReviews', 'BookmarkedReviews', 'Authentication',
  function ($http, $location, PostedReviews, BookmarkedReviews, Authentication) {
    var vm = this;
    vm.user = Authentication.user;
    //alert(JSON.stringify(Authentication.user));
    PostedReviews.query(function (data) {
      vm.postedReviews = data;
    });

    BookmarkedReviews.query({}, function (data) {
      vm.bookmarkedReviews = data;
    });

    vm.sort = sort;
    vm.postedReviewsItemsPerPage = 5;
    vm.bookmarkedReviewsItemsPerPage = 5;
    
    function sort(keyname){
      vm.sortKey = keyname;
      vm.reverse = !vm.reverse;
    }
    
  }
]);
