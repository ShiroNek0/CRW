'use strict';

angular.module('users').controller('SettingsController', ['$http', '$rootScope', '$scope', 'Authentication',
  function ($http, $rootScope, $scope, Authentication) {
    $scope.user = Authentication.user;

    if ($scope.user.roles.indexOf('mod') > 0) {
      $scope.isMod = true;
      // $http.get('api/companies/getWaitingReviews').then(successCallback, errorCallback);

    } else {
      $scope.isUser = true;
      // $scope.unseenAnnouce = 0;
      // $scope.user.announcement.forEach(function(annou) {
      //   if(!annou.seen)
      //     $scope.unseenAnnouce ++;
      // });
    }

    // function successCallback(res) {
    //   $rootScope.waitingReviews = res.data.length;
    //   $scope.reviews = res.data;

    //   return true;
    // }

    // function errorCallback(res) {
    //   alert(res.data.message);
    // }
  }
]);
