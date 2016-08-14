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

    vm.unBookmark = function(reviewId, index){
      var data = {
        reviewId: reviewId
      };
      data.bookmarked = true;

      $http.post('/api/users/bookmark', data).then(successCallback, errorCallback);

      function successCallback(res) {
        vm.user.bookmark.splice(index, 1);
        vm.bookmarkedReviews.splice(index, 1);
        return true;
      }

      function errorCallback(res) {
        alert(JSON.stringify(res));
      }
    };


  }
]);