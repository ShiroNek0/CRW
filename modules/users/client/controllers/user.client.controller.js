'use strict';

angular.module('users').controller('UserProfileController', ['$http', '$scope', '$state', 'Authentication', 'userResolve', 'PostedReviews',
  function ($http, $scope, $state, Authentication, user, PostedReviews) {
    var vm = this;
    vm.user = user;
    vm.postedReviews = user.postedReviews;

    vm.authentication = Authentication;

    vm.active = function(){
      vm.user.accState = 'active';
      vm.update();
    };

    vm.deactive = function(){
      vm.user.accState = 'deactive';
      vm.update();
    };


    vm.promoteMod = function(){
      vm.user.roles.push('mod');
      vm.update();
    };

    vm.demoteMod = function(){
      vm.user.roles=['user'];
      vm.update();      
    };

    vm.update = function(){
      vm.user.$update(successCallback, errorCallback);

      function successCallback(res){

      }

      function errorCallback(res){
        alert(res.data.message);
      }
    };
  }
]);
