'use strict';

angular.module('users').controller('AnnouncementController', ['$rootScope', '$window', '$scope', '$http', '$location', 'Users', 'Authentication',
  function ($rootScope, $window, $scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    $scope.markAllRead = function(){
      $http.post('/api/users/markAllNoti').then(function(res){
        Authentication.user.notification = res.data;
        $rootScope.unseenAnnouce = 0;
      });
    };
    
    $scope.toTargetLink = function(notifId, message, index){
      $http.put('/api/users/noti/'+notifId).then(function(res){
        $rootScope.unseenAnnouce -= 1;
        if(res.data.indexOf('editReview') !== -1)
          $window.location.href = res.data + '/' +message;
        else
          $window.location.href = res.data;
      });
    };
  }
]);
