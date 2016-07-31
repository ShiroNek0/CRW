'use strict';

angular.module('users').controller('HandleReviewsController', ['$modal', '$rootScope', '$http', '$scope', '$state', 'Authentication',
  function ($modal, $rootScope, $http, $scope, $state, Authentication) {
    var vm = this;

    vm.approveModal = approveModal;
    vm.reportModal = reportModal;
    vm.init = init;

    function init(){
      $http.get('api/companies/getWaitingReviews')
      .then(function (res) {
        $rootScope.waitingReviews = res.data.length;
        $scope.reviews = res.data;
        return true;
      }, function errorCallback(res) {
        alert(res.data.message);
      });

      $http.get('api/companies/getReportedReviews')
      .then(function (res) {
        $scope.reportedReviews = res.data;
        //alert(JSON.stringify($scope.reportedReviews));
        return true;
      }, function errorCallback(res) {
        alert(res.data.message);
      });
    }

    function reportModal(data) {
      var modalInstance = $modal.open({
        templateUrl: 'modules/users/client/views/admin/modal-handle-report.client.view.html',
        scope: $scope,
        controller: ReportModalController,
        resolve: {
          data: function(){
            return data;
          }
        }
      });

      modalInstance.result.then(function (result) {
        if(result){
          $scope.reportedReviews = result;
        }
      });
    }

    var ReportModalController = function ($scope, $modalInstance, data) {
      $scope.data = data;
      $scope.accept = function(){

        $http.put('/api/companies/review/'+data.reviews._id+'/acceptReport').then(successCallback, errorCallback);

        function successCallback(res) {
          $http.get('api/companies/getReportedReviews')
          .then(function (res) {
            $modalInstance.close(res.data);
            return true;
          }, function errorCallback(res) {
            alert(res.data.message);
          });
        }

        function errorCallback(res) {
          alert(res.data.message);
        }
      };
      
      $scope.reject = function(){
        $http.put('/api/companies/review/'+data.reviews._id+'/rejectReport').then(successCallback, errorCallback);

        function successCallback(res) {
          $http.get('api/companies/getReportedReviews')
          .then(function (res) {
            $modalInstance.close(res.data);
            return true;
          }, function errorCallback(res) {
            alert(res.data.message);
          });
        }

        function errorCallback(res) {
          alert(res.data.message);
        }

      };

      $scope.close = function(){$modalInstance.close();};


    };



    function approveModal(data) {
      var modalInstance = $modal.open({
        templateUrl: 'modules/users/client/views/admin/modal-approve-review.client.view.html',
        scope: $scope,
        controller: ApproveModalController,
        resolve: {
          data: function(){
            return data;
          }
        }
      });

      modalInstance.result.then(function (result) {
        if(result){
          $rootScope.waitingReviews = result.waitingReviews;
          $scope.reviews = result.reviews;
        }
      });
    }

    var ApproveModalController = function ($scope, $modalInstance, data) {
      $scope.data = data;
      $scope.approve = function(){

        $http.put('/api/companies/review/'+data.reviews._id+'/approve').then(successCallback, errorCallback);

        function successCallback(res) {

          $http.get('api/companies/getWaitingReviews').then(function (res) {
            var result = {
              waitingReviews: res.data.length,
              reviews: res.data
            };
            
            $modalInstance.close(result);
            return true;
          });
        }

        function errorCallback(res) {
          alert(res.data.message);
        }
      };
      $scope.close = function(){$modalInstance.close();};
      $scope.denie = function(){$modalInstance.close();};


    };


  }
]);
