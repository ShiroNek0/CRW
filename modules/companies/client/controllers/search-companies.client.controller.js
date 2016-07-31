(function () {  
  'use strict';

  angular
    .module('companies')
    .controller('SearchCompaniesController', SearchCompaniesController);

  SearchCompaniesController.$inject = ['SearchService', 'companyResolve', '$stateParams'];

  function SearchCompaniesController(SearchService, companies, $stateParams) {
    var vm = this;
    vm.onChange = onChange;
    vm.companies = companies;
    vm.keyword = $stateParams.keyword;
    vm.sort = sort;
    vm.itemsPerPage = 5;
    
    function sort(keyname){
      vm.sortKey = keyname;
      vm.reverse = !vm.reverse;
    }

    function onChange(){
      vm.companies = SearchService.query({ keyword: vm.keyword });
      
    }

  }
})();
