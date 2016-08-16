(function () {
  'use strict';

  // Companies controller
  angular
    .module('companies')
    .controller('CompaniesController', CompaniesController);

  CompaniesController.$inject = ['$modal', '$http', '$scope', '$state', 'Authentication', 'companyResolve', '$timeout', '$window', 'FileUploader'];

  function CompaniesController ($modal, $http, $scope, $state, Authentication, company, $timeout, $window, FileUploader) {
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
    vm.uploadPicture = uploadPicture;

    function deletePhoto(index) {
      vm.company.photo.splice(index, 1);
    }

    function addPhoto() {
      if (vm.introducePhoto && (vm.company.photo.indexOf(vm.introducePhoto) < 0)) {
        vm.company.photo.push(vm.introducePhoto);
        vm.introducePhoto = '';
      }
    }

    function viewInit() {
      vm.sort = sort;
      vm.itemsPerPage = 5;

      function sort(keyname) {
        vm.sortKey = keyname;
        vm.reverse = !vm.reverse;
      }

      var totalPoint = 0;
      vm.company.pointDisplay = 0;
      vm.count = [0, 0, 0, 0, 0];
      vm.company.reviews.forEach(function(review) {
        if (review.overallRev.rating && (review.state === 'approved' || review.state === 'trusted')) {
          vm.count[review.overallRev.rating - 1]++;
          totalPoint += review.overallRev.rating;
        }
      });
      vm.company.pointDisplay = Math.round(vm.company.averageRating * 2) / 2;

    }

    function editCompany(company) {
      var modalInstance = $modal.open({
        templateUrl: 'modules/companies/client/views/edit-company.client.view.html',
        scope: $scope,
        controller: EditModalController,
        windowClass: 'editCompany-modal-window',
        resolve: {
          company: function() {
            return company;
          }
        }
      });

      modalInstance.result.then(function (company) {
        if (company) {
          vm.company = company;
          vm.company.pointDisplay = Math.round(vm.company.averageRating * 2) / 2;
        }
      });
    }

    var EditModalController = function ($scope, $modalInstance, company) {
      //$scope.oldInfo = JSON.parse(JSON.stringify(company));

      if(vm.company.founded && vm.company.founded !== 'Chưa có năm thành lập') 
        vm.company.founded = new Date(vm.company.founded);
      else vm.company.founded = null;

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
          vm.error = res.data.message;
        }
      };

      $scope.close = function() {$modalInstance.close();};
    };

    function checkIfFollowed() {
      if (vm.company.followers.indexOf(vm.authentication.user._id) < 0)
        return false;
      else
        return true;
    }

    function follow() {

      var data = {};

      // alert(vm.company.followers.indexOf(vm.authentication.user._id));
      data.followed = vm.checkIfFollowed();

      $http.post('/api/companies/' + vm.company._id + '/follow', data).then(successCallback, errorCallback);

      function successCallback(res) {
        vm.company.followers = res.data;
        // alert(vm.company.followers);
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
      datepickerMode: '\'year\'',
      minMode: 'year',
      maxDate: Date.now()
    };

    function init() {
      vm.company.photo = [];
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

      if (!vm.company.avatar) {
        vm.error = 'Hãy thêm ảnh đại diện cho công ty';
        return false;
      }

      vm.company.$save(successCallback, errorCallback);

      function successCallback(res) {
        $window.location.href = 'companies/' + res._id + '/createReview';
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

      $http.put('/api/companies/' + vm.company._id + '/addreview', vm.company).then(successCallback, errorCallback);
      function successCallback(res) {

        $state.go('companies.view', {
          companyId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }


    // Create file uploader instance
    vm.uploader = new FileUploader({
      url: 'api/companies/uploadPicture',
      alias: 'newCompanyPicture'
    });

    // Set file uploader image filter
    vm.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    vm.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            vm.avatarTemp = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    vm.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      vm.progress = 'Upload ảnh thành công';

      // Populate user object
      vm.company.avatar = response.url;

      // Clear upload buttons
      vm.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    vm.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      vm.cancelUpload();

      // Show error message
      vm.error = response.message;
    };


    function uploadPicture() {
      vm.progress = vm.error = null;
      vm.uploader.uploadAll();
    }

    vm.cancelUpload = function() {
      vm.uploader.clearQueue();
      vm.avatarTemp = null;
    };

    // Photo Upload
    vm.photoUploader = new FileUploader({
      url: 'api/companies/uploadPicture',
      alias: 'newCompanyPicture'
    });

    // Set file uploader image filter
    vm.photoUploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    vm.photoUploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            vm.photoTemp = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    vm.photoUploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      vm.progress = 'Upload ảnh thành công';

      // Populate user object
      //vm.company.avatar = response.url;
      vm.company.photo.push(response.url);

      // Clear upload buttons
      vm.cancelPhotoUploader();
    };

    // Called after the user has failed to uploaded a new picture
    vm.photoUploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      vm.cancelPhotoUploader();

      // Show error message
      vm.error = response.message;
    };


    vm.uploadPhoto = function() {
      vm.progress = vm.error = null;
      vm.photoUploader.uploadAll();
    };

    vm.cancelPhotoUploader = function() {
      vm.photoUploader.clearQueue();
      vm.photoTemp = null;
    };

     vm.back = function() {
      $state.go($state.previous.state, $state.previous.params);
    };
  }
}());