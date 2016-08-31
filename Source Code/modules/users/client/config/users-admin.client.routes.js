'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('settings.reviews', {
        url: '/reviews',
        templateUrl: 'modules/users/client/views/admin/handle-reviews.client.view.html',
        controller: 'HandleReviewsController',
        controllerAs: 'vm',
        data: {
          title: 'Xử lý bài đánh giá'
        }
      })
      .state('settings.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        data: {
          title: 'Danh dách người dùng'
        }
      })
      .state('settings.companies', {
        url: '/companies',
        templateUrl: 'modules/users/client/views/admin/list-companies.client.view.html',
        controller: 'CompaniesListController',
        controllerAs: 'vm',
        data: {
          title: 'Danh dách công ty'
        }
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);
