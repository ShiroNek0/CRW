'use strict';

angular.module('users.admin').controller('CompaniesListController', ['$scope', '$filter', '$http',
  function ($scope, $filter, $http) {
    var vm = this;
    vm.totalCompanies=0;
    vm.totalReviews=0;
    vm.totalComments=0;
    vm.totalReports=0;

    $http.get('api/companies/getCompanyStatistics').then(function(res) {
      vm.totalCompanies=res.data.numOfCompanies;

      res.data.companies.forEach(function(company) {
        vm.totalReviews += company.numOfFilteredReviews;
        $http.get('api/companies/'+company._id+'/getReviewStatistics').then(function(res) {
          res.data.reviews.forEach(function(review){
            vm.totalComments += review.numOfComments;
            vm.totalReports += review.numOfReports ;
          });
        });
      });
    });

    $http.get('api/companies').then(function(res){
      vm.companies = res.data;
    });

    vm.sort = sort;
    vm.ItemsPerPage = 10;

    function sort(keyname) {
      vm.sortKey = keyname;
      vm.reverse = !vm.reverse;
    }


  }
]);
