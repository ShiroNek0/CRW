'use strict';

angular.module('users').controller('AnnouncementController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;
    
  }
]);
