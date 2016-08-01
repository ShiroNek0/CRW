'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    var vm = this;
    Admin.query(function (data) {
      vm.users = data;
    });

    vm.sort = sort;
    vm.ItemsPerPage = 10;
    
    function sort(keyname){
      vm.sortKey = keyname;
      vm.reverse = !vm.reverse;
    }

   
  }
]);
