'use strict';

angular.module('users').controller('PostedReviewsController', ['$scope', '$http', '$location', 'PostedReviews', 'Authentication',
  function ($scope, $http, $location, PostedReviews, Authentication) {
    var vm = this;
    vm.user = Authentication.user;
    // alert(JSON.stringify(Authentication.user));
    PostedReviews.query(function (data) {
      vm.postedReviews = data;
    });

    vm.sort = sort;
    vm.postedReviewsItemsPerPage = 5;

    function sort(keyname) {
      vm.sortKey = keyname;
      vm.reverse = !vm.reverse;
    }
  }
]);
