(function () {
  'use strict';

  // Companies controller
  angular
    .module('companies')
    .controller('CompaniesController', CompaniesController);

  CompaniesController.$inject = ['$modal', '$http', '$window', '$scope', '$state', 'Authentication', 'companyResolve'];

  function CompaniesController ($modal, $http, $window, $scope, $state, Authentication, company) {
    var vm = this;

    vm.authentication = Authentication;
    vm.company = company;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.addReview = addReview;
    vm.displayAlias = displayAlias;
    vm.init = init;
    vm.Reviewinit = Reviewinit;
    vm.follow = follow;
    vm.checkIfFollowed = checkIfFollowed;
    vm.editCompany = editCompany;
    vm.viewInit = viewInit;

    function viewInit(){
      var totalPoint = 0;
      vm.count = [0, 0, 0, 0, 0];
      vm.company.reviews.forEach(function(review){
        if(review.overallRev.rating && review.state==="approved"){
        vm.count[review.overallRev.rating-1]++;
        totalPoint += review.overallRev.rating;
        }
      });
      vm.company.point = totalPoint/(vm.count[0] + vm.count[1]+vm.count[2]+vm.count[3]+vm.count[4]);
    }

    function editCompany(company){
      var modalInstance = $modal.open({
        templateUrl: 'modules/companies/client/views/edit-company.client.view.html',
        scope: $scope,
        controller: EditModalController,
        windowClass: 'editCompany-modal-window',
        resolve: {
          company: function(){
            return company;
          }
        }
      });

      modalInstance.result.then(function (company) {
        if(company){
          vm.company = company;
        }
      });
    }

    var EditModalController = function ($scope, $modalInstance, company) {
      
      $scope.edit = function(isValid) {

        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.companyForm');
          vm.error = 'Có cái gì đó sai sai';
          return false;
        }
      
        vm.company.$update(successCallback, errorCallback);

        function successCallback(res) {
          $modalInstance.close(res.data);
        }

        function errorCallback(res) {
          alert(res.data.message);
          $scope.error = res.data.message;
        }
      };
      
      $scope.close = function(){$modalInstance.close();};
    };

    function checkIfFollowed(){
      if(vm.company.followers.indexOf(vm.authentication.user._id) < 0)
        return false;
      else
        return true;
    }

    function follow(){
      
      var data={
        userId: vm.authentication.user._id
      };

      //alert(vm.company.followers.indexOf(vm.authentication.user._id));
      if(vm.company.followers.indexOf(vm.authentication.user._id) < 0)
        data.follow = true;
      else
        data.follow = false;
      
      var rs = $http.put('/api/companies/follow/'+vm.company._id, data).then(successCallback, errorCallback);

      function successCallback(res) {
        vm.company.followers = res.data.followers;
        //alert(vm.company.followers);
        return true;
      }

      function errorCallback(res) {
        alert(res.data.message);
      }

    }

    vm.openYearPicker = function($event) {
      vm.pickerOpened = true;
    };
    
    vm.dateOptions = {
      datepickerMode:"'year'",
      minMode:'year',
      maxDate: Date.now()
    };

    function init(){
      vm.company.personnelSize = 'Chưa rõ'; 
      vm.company.companyType = 'Công ty TNHH';
    }

    function Reviewinit(){
      vm.company.newReview.isJobCurrent = true; 
      vm.company.newReview.jobLength = 'Dưới 6 tháng';
      vm.company.newReview.contract = 'Nhân viên chính thức';
    }

    function displayAlias() {
      vm.alias = vm.company.alias;      
    }
    // Remove existing Company
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.company.$remove($state.go('companies.list'));
      }
    }

    // Save Company
    function save(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.companyForm');
        vm.error = 'Có cái gì đó sai sai';
        return false;
      }
    
      vm.company.$save(successCallback, errorCallback);

      function successCallback(res) {
        $window.location.href = 'companies/'+ res._id +'/createReview';
        // $state.go('companies.createReview', {
        //   companyId: res._id
        // });
      }

      function errorCallback(res) {

        vm.error = res.data.message;
      }
    }

    function addReview(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.reviewForm');
        vm.error = 'Có cái gì đó sai sai';
        return false;
      }
      // TODO: move create/update logic to service
      
      $http.put('/api/companies/'+vm.company._id+'/addreview', vm.company).then(successCallback, errorCallback);
      function successCallback(res) {
        
        $state.go('companies.view', {
          companyId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }


    }
  }
})();
