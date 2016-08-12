'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('user', {
        url: '/user/profile/:userId',
        templateUrl: 'modules/users/client/views/view-user.client.view.html',
        controller: 'UserProfileController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          title: 'Thông tin người dùng'
        }
      })
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin'],
          title: 'Bảng điều khiển'
        }
      })
      .state('settings.postedReviews', {
        url: '/postedReviews',
        templateUrl: 'modules/users/client/views/settings/posted-reviews.client.view.html',
        controller: 'PostedReviewsController',
        controllerAs: 'vm',
        data: {
          title: 'Bài đánh giá đã đăng'
        }
      })
      .state('settings.bookmarkedReviews', {
        url: '/bookmarkedReviews',
        templateUrl: 'modules/users/client/views/settings/bookmarked-reviews.client.view.html',
        controller: 'BookmarkedReviewsController',
        controllerAs: 'vm',
        data: {
          title: 'Bài đánh giá đã đánh dấu'
        }
      })
      .state('settings.followedCompany', {
        url: '/followedCompany',
        templateUrl: 'modules/users/client/views/settings/followed-company.client.view.html',
        controller: 'FollowedCompaniesController',
        controllerAs: 'vm',
        data: {
          title: 'Công ty đang theo dõi'
        }
      })
      .state('settings.announcement', {
        url: '/announcement',
        templateUrl: 'modules/users/client/views/settings/announcement.client.view.html',
        data: {
          title: 'Thông báo'
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html',
        data: {
          title: 'Thông tin cá nhân'
        }
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html',
        data: {
          title: 'Đổi mật khẩu'
        }
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html',
        data: {
          title: 'Tài khoản mạng xã hội'
        }
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html',
        data: {
          title: 'Đổi ảnh đại diện'
        }
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html',
        data: {
          title: 'Đăng ký'
        }
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html',
        data: {
          title: 'Đăng nhập'
        }
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html',
        data: {
          title: 'Quên mật khẩu'
        }
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }

]);

getUser.$inject = ['$stateParams', 'Users'];

function getUser($stateParams, Users) {
  return Users.get({
    userId: $stateParams.userId
  }).$promise;
}
