'use strict';

angular.module('users').controller('AuthenticationController', ['$rootScope', '$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'Socket',
  function ($rootScope, $scope, $state, $http, $location, $window, Authentication, PasswordValidator, Socket) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        $rootScope.unseenAnnouce = 0;
        $scope.authentication.user.notification.forEach(function(notif) {
          if (!notif.hasRead)
            $rootScope.unseenAnnouce ++;
        });
        if (!Socket.socket) {
          Socket.connect();
        }

        Socket.on('review waiting', function (res) {
          $rootScope.wtgrvNotif = res;
        });

        Socket.on('review reported', function (res) {
          $rootScope.rptrvNotif = res;
        });

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }
      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);
