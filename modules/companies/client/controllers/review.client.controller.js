(function () {
  'use strict';

  angular
    .module('companies')
    .controller('ReviewController', ReviewController);
    
  ReviewController.$inject = ['$http', '$stateParams', '$scope', '$state', 'Authentication', 'reviewResolve'];

  function ReviewController($http, $stateParams, $scope, $state, Authentication, rsdata) {
    var vm = this;
    vm.authentication = Authentication;
    vm.company = rsdata;

    vm.company.pointDisplay = Math.round(vm.company.averageRating*2)/2;

    vm.postComment = postComment;
    vm.upvote= upvote;
    vm.bookmark= bookmark;
    vm.checkIfUpvoted= checkIfUpvoted;
    vm.checkIfBookmarked= checkIfBookmarked;
    vm.sendReport = sendReport;
    vm.highlight= highlight;
    vm.Reviewinit = Reviewinit;
    vm.initCmt = initCmt;
    vm.addJob = addJob;
    vm.jobEnter = jobEnter;
    vm.deleteJob = deleteJob;
    vm.deleteCmt = deleteCmt;

    vm.message = $stateParams.message;

    function deleteJob(index){
      vm.company.newReview.job.splice(index, 1);
    }

    function jobEnter(keyEvent){
      if (keyEvent.which === 13)
        vm.addJob();
    }

    function addJob(){
      if(vm.job && (vm.company.newReview.job.indexOf(vm.job)<0)){
        vm.company.newReview.job.push(vm.job);
        vm.job="";
      }
    }

    function initCmt(){
      vm.company.reviews.comments.forEach(function(comment){
        comment.postTime= parseInt(String(comment._id).substr(0,8), 16)*1000;
      });
    }

    function Reviewinit(){
      $http.get('/api/jobs').then(function(res){
        vm.jobList = res.data;
      });
      vm.company.newReview ={};
      vm.company.newReview.job =[];
      vm.company.newReview.isJobCurrent = true; 
      vm.company.newReview.jobLength = 'Dưới 6 tháng';
      vm.company.newReview.contract = 'Nhân viên chính thức';
    }

    function highlight(){
      vm.company.reviews.highlight = !vm.company.reviews.highlight;
      var rs = $http.put('/api/companies/'+vm.company._id+'/reviews/'+vm.company.reviews._id, vm.company).then(successCallback, errorCallback);

      function successCallback(res) {
        alert('Ghim bài viết thành công');
        return true;
      }

      function errorCallback(res) {
        vm.company.reviews.highlight = !vm.company.reviews.highlight;
        alert(res.data.message);
      }
    }

    function sendReport(){
      vm.report.user = vm.authentication.user._id;
      $http.post('/api/companies/'+vm.company._id+'/reviews/'+vm.company.reviews._id+'/reports', vm.report)
      .then(function (res){ alert('Gửi báo cáo thành công'); }, function (res) { alert(res.data.message); });
    }   
 
    function checkIfBookmarked(){
      if(vm.authentication.user.bookmark.indexOf(vm.company.reviews._id) < 0)
        return false;
      else
        return true;
    }

    function checkIfUpvoted(){
      if(vm.company.reviews.upvoteUsers.indexOf(vm.authentication.user._id) < 0)
        return false;
      else
        return true;
    }

    function bookmark(){
      //alert(vm.company.reviews.upvoteUsers);
      var data={
        reviewId: vm.company.reviews._id
      };
      data.bookmark = !vm.checkIfBookmarked();
      //alert(JSON.stringify(data));
            
      var rs = $http.put('/api/users/bookmark', data).then(successCallback, errorCallback);

      function successCallback(res) {
      //alert(JSON.stringify(res));
        vm.authentication.user.bookmark = res.data.bookmark;
        
        return true;
      }

      function errorCallback(res) {
        alert(res.data.message);
      }

    }


    function upvote(){
      var req ={};
      req.upvoted = vm.checkIfUpvoted();
            
      $http.post('/api/companies/'+vm.company._id+'/reviews/'+vm.company.reviews._id+'/upvote', req).then(successCallback, errorCallback);

      function successCallback(res) {
        vm.company.reviews.upvoteUsers = res.data;
        return true;
      }

      function errorCallback(res) {
        alert(res.data.message);
      }

    }

    function postComment(content){
      if(!content)
        return false;
      var reqBody = {
        content: content
      };
      
      $http.post('/api/companies/'+vm.company._id+'/reviews/'+vm.company.reviews._id+'/comments', reqBody).then(successCallback, errorCallback);

      function successCallback(res) {
        res.data.userID= vm.authentication.user;
        res.data.postTime= parseInt(String(res.data._id).substr(0,8), 16)*1000;
        vm.company.reviews.comments.push(res.data);
        vm.newComment = "";
      }

      function errorCallback(res) {
        alert(res.data.message);
      }
    }

    function deleteCmt(cmtId, index){
      
      $http.delete('/api/companies/'+vm.company._id+'/reviews/'+vm.company.reviews._id+'/comments/'+cmtId).then(successCallback, errorCallback);

      function successCallback(res) {
        vm.company.reviews.comments = res.data;
        vm.company.reviews.comments.forEach(function(comment){
          comment.postTime= parseInt(String(comment._id).substr(0,8), 16)*1000;
        });
      }

      function errorCallback(res) {
        alert(res.data.message);
      }
    }

    vm.save = function(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.reviewForm');
        vm.error = 'Có cái gì đó sai sai';
        return false;
      }
      if(vm.authentication.user && vm.authentication.user.roles.indexOf('mod')>=0)
        vm.company.newReview.state = 'approved';
      vm.company.$save(successCallback, errorCallback);

      function successCallback(res) {
        alert('bai cua ban da duoc dang thanh cong, chung toi se thong bao khi co thong tin');
        $state.go('companies.view', {
          companyId: res._id
        });
      }

      function errorCallback(res) {

        vm.error = res.data.message;
      }
    };

    vm.edit = function(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.reviewForm');
        vm.error = 'Có cái gì đó sai sai';
        return false;
      }
      if(vm.authentication.user.roles.indexOf('mod')>=0)
        vm.company.reviews.state = 'approved';
      vm.company.$update(successCallback, errorCallback);

      function successCallback(res) {
        alert('Sua thanh cong, chung toi se thong bao cho ban ke qua duyet');
        $state.go('companies.view', {
          companyId: vm.company._id
        });
      }

      function errorCallback(res) {
        alert(res.data.message);
        vm.error = res.data.message;
      }
    };
  }
})();
