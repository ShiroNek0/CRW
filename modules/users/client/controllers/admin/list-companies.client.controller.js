'use strict';

angular.module('users.admin').controller('CompaniesListController', ['$scope', '$filter', '$http',
  function ($scope, $filter, $http) {
    var vm = this;
    $http.get('api/companies').then(function(res){
      vm.companies = res.data;
      vm.totalreview = 0;
      vm.companies.forEach(function(comapny){
        vm.totalreview +=comapny.numOfReviews;
      });
    });
    vm.sort = sort;
    vm.ItemsPerPage = 10;
    
    function sort(keyname){
      vm.sortKey = keyname;
      vm.reverse = !vm.reverse;
    }

   
  }
]);
