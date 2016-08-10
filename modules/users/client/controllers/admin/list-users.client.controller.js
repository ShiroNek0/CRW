'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    var vm = this;
    Admin.query(function (data) {
      vm.users = data;
      vm.users.forEach(function(user){
        if(user.roles.indexOf('admin')>=0)
          vm.adminTotal++;
        if(user.roles.indexOf('mod')>=0)
          vm.modTotal++;
      });
    });

    vm.sort = sort;
    vm.ItemsPerPage = 10;

    function sort(keyname) {
      vm.sortKey = keyname;
      vm.reverse = !vm.reverse;
    }

    vm.adminTotal=0;
    vm.modTotal=0;
  }
]);
