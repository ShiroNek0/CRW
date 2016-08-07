'use strict';

angular.module('users').controller('BookmarkedReviewsController', ['$scope', '$http', '$location', 'BookmarkedReviews', 'Authentication',
  function ($scope, $http, $location, BookmarkedReviews, Authentication) {
    var vm = this;
    vm.user = Authentication.user;

    BookmarkedReviews.query({}, function (data) {
      vm.bookmarkedReviews = data;
    });

    vm.sort = sort;
    vm.bookmarkedReviewsItemsPerPage = 5;

    function sort(keyname) {
      vm.sortKey = keyname;
      vm.reverse = !vm.reverse;
    }


  }
]);
