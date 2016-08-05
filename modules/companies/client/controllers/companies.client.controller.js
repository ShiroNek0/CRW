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
    vm.follow = follow;
    vm.checkIfFollowed = checkIfFollowed;
    vm.editCompany = editCompany;
    vm.viewInit = viewInit;
    vm.addPhoto = addPhoto;
    vm.deletePhoto = deletePhoto;

    function deletePhoto(index){
      vm.company.photo.splice(index, 1);
    }

    function addPhoto(){
      if(vm.introducePhoto && (vm.company.photo.indexOf(vm.introducePhoto)<0)){
        vm.company.photo.push(vm.introducePhoto);
        vm.introducePhoto="";
      }
    }

    function viewInit(){
      vm.sort = sort;
      vm.itemsPerPage = 5;
      
      function sort(keyname){
        vm.sortKey = keyname;
        vm.reverse = !vm.reverse;
      }

      var totalPoint = 0;
      vm.company.pointDisplay = 0;
      vm.count = [0, 0, 0, 0, 0];
      vm.company.reviews.forEach(function(review){
        if(review.overallRev.rating && (review.state==="approved" || review.state==="trusted")){
          vm.count[review.overallRev.rating-1]++;
          totalPoint += review.overallRev.rating;
        }
      });
      vm.company.pointDisplay = Math.round(vm.company.averageRating*2)/2;

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
          vm.company.pointDisplay = Math.round(vm.company.averageRating*2)/2;
        }
      });
    }

    var EditModalController = function ($scope, $modalInstance, company) {

      vm.company.founded = new Date(vm.company.founded);
      
      $scope.edit = function(isValid) {

        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.companyForm');
          vm.error = 'Hãy kiểm tra lại các trường có dấu (*)';
          return false;
        }
      
        vm.company.$update(successCallback, errorCallback);

        function successCallback(res) {
          $modalInstance.close(res);
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
      
      var data={};

      //alert(vm.company.followers.indexOf(vm.authentication.user._id));
      data.followed = vm.checkIfFollowed();
      
      $http.post('/api/companies/'+vm.company._id+'/follow', data).then(successCallback, errorCallback);

      function successCallback(res) {
        vm.company.followers = res.data;
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
      vm.company.photo=[];
      vm.company.personnelSize = 'Chưa rõ'; 
      vm.company.companyType = 'Công ty TNHH';
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
        vm.error = 'Hãy kiểm tra lại các trường có dấu (*)';
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
        vm.error = 'Hãy kiểm tra lại các trường có dấu (*)';
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
