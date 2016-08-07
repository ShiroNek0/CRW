(function () {
  'use strict';

  angular
    .module('companies')
    .controller('ReviewController2', ReviewController2);

  ReviewController2.$inject = ['$http', '$scope', '$state', 'Authentication', 'reviewResolve'];

  function ReviewController2($http, $scope, $state, Authentication, rsdata) {
    var vm = this;
    vm.authentication = Authentication;
    vm.rsdata = rsdata;
    vm.postComment = postComment;
    vm.upvote = upvote;
    vm.bookmark = bookmark;
    vm.checkIfUpvoted = checkIfUpvoted;
    vm.checkIfBookmarked = checkIfBookmarked;
    vm.sendReport = sendReport;
    vm.highlight = highlight;

    function highlight() {

      var rs = $http.put('/api/companies/review/' + vm.rsdata.reviews._id + '/highlight').then(successCallback, errorCallback);

      function successCallback(res) {
        vm.rsdata.reviews.highlight = !vm.rsdata.reviews.highlight;
        return true;
      }

      function errorCallback(res) {
        alert(res.data.message);
      }
    }

    function sendReport() {
      vm.report.user = vm.authentication.user._id;
      // alert(JSON.stringify(vm.report));

      $http.put('/api/companies/review/' + vm.rsdata.reviews._id + '/report', vm.report)
      .then(function (res) { alert('Gửi báo cáo thành công'); }, function (res) { alert(res.data.message); });
    }

    function checkIfBookmarked() {
      if (vm.authentication.user.bookmark.indexOf(vm.rsdata.reviews._id) < 0)
        return false;
      else
        return true;
    }

    function checkIfUpvoted() {
      if (vm.rsdata.reviews.upvoteUsers.indexOf(vm.authentication.user._id) < 0)
        return false;
      else
        return true;
    }

    function bookmark() {
      // alert(vm.rsdata.reviews.upvoteUsers);
      var data = {
        reviewId: vm.rsdata.reviews._id
      };
      data.bookmark = !vm.checkIfBookmarked();
      // alert(JSON.stringify(data));

      var rs = $http.put('/api/users/bookmark', data).then(successCallback, errorCallback);

      function successCallback(res) {
      // alert(JSON.stringify(res));
        vm.authentication.user.bookmark = res.data.bookmark;

        return true;
      }

      function errorCallback(res) {
        alert(res.data.message);
      }

    }


    function upvote() {
      // alert(vm.rsdata.reviews.upvoteUsers);
      var data = {
        userId: vm.authentication.user._id
      };

      // alert(vm.company.followers.indexOf(vm.authentication.user._id));
      data.upvote = !vm.checkIfUpvoted();

      var rs = $http.put('/api/companies/review/upvote/' + vm.rsdata.reviews._id, data).then(successCallback, errorCallback);

      function successCallback(res) {
        vm.rsdata.reviews.upvoteUsers = res.data[0].reviews.upvoteUsers;

        return true;
      }

      function errorCallback(res) {
        alert(res.data.message);
      }

    }

    function postComment(content) {
      if (!content)
        return false;
      var newComment = {
        content: content,
        user: vm.authentication.user
      };

      vm.rsdata.reviews.newComment = newComment;

      var rs = $http.put('/api/companies/review/' + vm.rsdata.reviews._id + '/postComment', vm.rsdata.reviews).then(successCallback, errorCallback);

      function successCallback(res) {
        vm.rsdata.reviews.comments = res.data[0].reviews.comments;
        vm.newComment = '';
      }

      function errorCallback(res) {
        alert(res.data.message);
      }

     // alert(newComment);
    }
  }
}());
