'use strict';

angular.module('users').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve', 'PostedReviews',
  function ($scope, $state, Authentication, user, PostedReviews) {
    var vm = this;
    vm.user = user;
     
    PostedReviews.query({ userId: vm.user._id }, function (data) {
      vm.postedReviews = data;
    });


    // $scope.authentication = Authentication;
    // $scope.user = userResolve;

    // $scope.remove = function (user) {
    //   if (confirm('Are you sure you want to delete this user?')) {
    //     if (user) {
    //       user.$remove();

    //       $scope.users.splice($scope.users.indexOf(user), 1);
    //     } else {
    //       $scope.user.$remove(function () {
    //         $state.go('admin.users');
    //       });
    //     }
    //   }
    // };

    // $scope.update = function (isValid) {
    //   if (!isValid) {
    //     $scope.$broadcast('show-errors-check-validity', 'userForm');

    //     return false;
    //   }

    //   var user = $scope.user;

    //   user.$update(function () {
    //     $state.go('admin.user', {
    //       userId: user._id
    //     });
    //   }, function (errorResponse) {
    //     $scope.error = errorResponse.data.message;
    //   });
    // };
  }
]);
