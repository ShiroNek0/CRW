'use strict';

angular.module('users').controller('FollowedCompaniesController', ['$http', '$location', 'Authentication',
  function ($http, $location, Authentication) {
    var vm = this;
    vm.user = Authentication.user;
    // alert(JSON.stringify(Authentication.user));
    $http.get('/api/companies/followedCompany').then(function(res) {
      vm.followedCompany = res.data;
    });

    vm.sort = sort;
    vm.itemsPerPage = 5;

    function sort(keyname) {
      vm.sortKey = keyname;
      vm.reverse = !vm.reverse;
    }

    vm.unfollow = function(companyId, index){

      var data = {};
      data.followed = true;

      $http.post('/api/companies/' + companyId + '/follow', data).then(successCallback, errorCallback);

      function successCallback(res) {
        vm.followedCompany.splice(index, 1);
        return true;
      }

      function errorCallback(res) {
        alert(JSON.stringify(res));
      }
    }
  }
]);
