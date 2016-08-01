'use strict';

angular.module('users').controller('HandleReviewsController', ['$modal', '$rootScope', '$http', '$scope', '$state', 'Authentication',
  function ($modal, $rootScope, $http, $scope, $state, Authentication) {
    var vm = this;

    vm.denieModal = denieModal;
    vm.approveModal = approveModal;

    vm.rejectModal = rejectModal;
    vm.acceptModal = acceptModal;    

    vm.init = init;

    function init(){
      $http.get('/api/companies/waitingReviews')
      .then(function (res) {
        $rootScope.waitingReviews = res.data.length;
        $scope.reviews = res.data;
        return true;
      }, function errorCallback(res) {
        alert(res.data.message);
      });

      $http.get('/api/companies/reportedReviews')
      .then(function (res) {
        $scope.reportedReviews = res.data;
        //alert(JSON.stringify($scope.reportedReviews));
        return true;
      }, function errorCallback(res) {
        alert(res.data.message);
      });
    }

    function acceptModal(data) {
      var modalInstance = $modal.open({
        templateUrl: 'modules/users/client/views/admin/modal-accept-report.html',
        scope: $scope,
        controller: AcceptModalController,
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

    var AcceptModalController = function ($scope, $modalInstance, data) {
      $scope.data = data;
      $scope.message ='Bài đánh giá của bạn đã bị khóa vì lý do: ';
      $scope.data.reviews.reports.forEach(function(report){
        $scope.message += report.content + ', ';
      });
      $scope.message += 'bấm vào đường dẫn đính kèm để sửa bài.';

      $scope.accept = function(){
        var req={
          deniedReason:  $scope.message
        };

        $http.post('/api/companies/'+data._id+'/reviews/'+data.reviews._id+'/reports/accept', req).then(successCallback, errorCallback);

        function successCallback(res) {
          $http.get('api/companies/reportedReviews')
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

    function rejectModal(data) {
      var modalInstance = $modal.open({
        templateUrl: 'modules/users/client/views/admin/modal-reject-report.html',
        scope: $scope,
        controller: RejectModalController,
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

    var RejectModalController = function ($scope, $modalInstance, data) {
      $scope.data = data;
      $scope.message ='Bài đánh giá của bạn đã bị khóa vì lý do: ';
      $scope.data.reviews.reports.forEach(function(report){
        $scope.message += report.content + ', ';
      });
      $scope.message += 'bấm vào đường dẫn đính kèm để sửa bài.';
      $scope.close = function(){$modalInstance.close();};

      $scope.reject = function(){
        $http.post('/api/companies/'+data._id+'/reviews/'+data.reviews._id+'/reports/reject').then(successCallback, errorCallback);

        function successCallback(res) {
          $http.get('api/companies/reportedReviews')
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
    };

    function denieModal(data) {
      var modalInstance = $modal.open({
        templateUrl: 'modules/users/client/views/admin/modal-denie-review.html',
        scope: $scope,
        controller: DenieModalController,
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

    var DenieModalController = function ($scope, $modalInstance, data) {
      $scope.data = data;

      $scope.message ='Bài đánh giá mang tên ' + data.reviews.title + ' của bạn đã bị từ chối. Bấm vào đường dẫn đính kèm để sửa bài. Lý do: ';
      $scope.denie = function(){
        data.reviews.state="denied";
        data.deniedReason = $scope.message;
        updateReview();
      };
      $scope.close = function(){$modalInstance.close();};

      var updateReview = function(){
        $http.put('/api/companies/'+data._id+'/reviews/'+data.reviews._id, data).then(successCallback, errorCallback);

        function successCallback(res) {

          $http.get('/api/companies/waitingReviews').then(function (res) {
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
    };

    function approveModal(data) {
      var modalInstance = $modal.open({
        templateUrl: 'modules/users/client/views/admin/modal-approve-review.html',
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
        data.reviews.state="approved";
        updateReview();
      };
      $scope.close = function(){$modalInstance.close();};

      var updateReview = function(){
        $http.put('/api/companies/'+data._id+'/reviews/'+data.reviews._id, data).then(successCallback, errorCallback);

        function successCallback(res) {

          $http.get('/api/companies/waitingReviews').then(function (res) {
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
    };

  }
]);
