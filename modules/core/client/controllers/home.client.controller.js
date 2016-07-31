'use strict';

angular.module('core').controller('HomeController', ['$state', '$scope', 'Authentication', 'CompaniesRecentService',
  function ($state, $scope, Authentication, CompaniesRecentService) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.companies = CompaniesRecentService.query();

    $scope.enterToSearch = function(keyEvent) {
      if (keyEvent.which === 13)
        $state.go('companies.search',{ keyword: $scope.keyword });
    };
  }
]);