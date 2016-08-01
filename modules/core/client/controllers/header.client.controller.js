'use strict';

angular.module('core').controller('HeaderController', ['$http', '$rootScope', '$scope', '$state', 'Authentication', 'Menus', 'Socket',
  function ($http, $rootScope, $scope, $state, Authentication, Menus, Socket) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;
    // if (!Socket.socket) {
    //   Socket.connect();
    // }
    // $scope.test =0;
    // Socket.on('notification', function (notif) {
    //   $scope.test = 1;
    // });

    $scope.$on('$destroy', function () {
      Socket.removeListener('notification');
    });

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });

    $scope.enterToSearch = function(keyEvent) {
      if (keyEvent.which === 13)
        $state.go('companies.search',{ keyword: $scope.keyword });
    };
    $scope.userInit = userInit;

    function userInit(){

      if($scope.authentication.user){
        if($scope.authentication.user.roles.indexOf('mod')>=0){
          $http.get('/api/companies/waitingReviews').then(successCallback, errorCallback);

        }

        else{
          $rootScope.unseenAnnouce = 0;
          $scope.authentication.user.notification.forEach(function(notif) {
            if(!notif.hasRead)
              $rootScope.unseenAnnouce ++;
          });
        }
      }

      function successCallback(res) {
        $rootScope.waitingReviews = res.data.length;
        
        return true;
      }

      function errorCallback(res) {
        alert(res.data.message);
      }
    }
  }
]);
