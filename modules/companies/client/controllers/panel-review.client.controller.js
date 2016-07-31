(function () {
  'use strict';

  angular
    .module('companies')
    .controller('ReviewPanelController', ReviewPanelController);
    
  ReviewPanelController.$inject = ['$scope', '$state', 'Authentication', 'reviewResolve', 'Admin'];

  function ReviewPanelController($scope, $state, Authentication, reviews ,Admin) {
    var vm = this;
    vm.authentication = Authentication;
    vm.reviews = reviews;
  }
})();
