(function () {
  'use strict';

  angular
    .module('companies')
    .controller('ReviewController', ReviewController);
    
  ReviewController.$inject = ['$http', '$scope', '$state', 'Authentication', 'reviewResolve'];

  function ReviewController($http, $scope, $state, Authentication, rsdata) {
    var vm = this;
    vm.authentication = Authentication;
    vm.company = rsdata;

    vm.edit = function(isValid) {

        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.reviewForm');
          vm.error = 'Có cái gì đó sai sai';
          return false;
        }
      
        vm.company.$update(successCallback, errorCallback);

        function successCallback(res) {
          alert('Sua thanh cong, chung toi se thong bao cho ban ke qua duyet');
          $state.go('home');
        }

        function errorCallback(res) {
          alert(res.data.message);
          vm.error = res.data.message;
        }
      };
  }
})();
