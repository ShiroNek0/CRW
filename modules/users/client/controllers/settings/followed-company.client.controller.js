'use strict';

angular.module('users').controller('FollowedCompaniesController', ['$http', '$location', 'Authentication',
  function ($http, $location, Authentication) {
    var vm = this;
    vm.user = Authentication.user;
    //alert(JSON.stringify(Authentication.user));
    $http.get('/api/companies/followedCompany').then(function(res){
      vm.followedCompany = res.data;
    });

    vm.sort = sort;
    vm.itemsPerPage = 5;
    
    function sort(keyname){
      vm.sortKey = keyname;
      vm.reverse = !vm.reverse;
    }
    
  }
]);
