'use strict';

angular.module('users').controller('AccountInfoController', ['$http', '$scope', '$state', 'Authentication',
  function ($http, $scope, $state, Authentication) {
    var vm = this;
    vm.user = Authentication.user;
  }
]);
