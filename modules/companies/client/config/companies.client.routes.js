(function() {
  'use strict';

  angular
    .module('companies')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('companies', {
        abstract: true,
        url: '/companies',
        template: '<ui-view/>'
      })
      .state('companies.create', {
        url: '/create',
        templateUrl: 'modules/companies/client/views/form-company.client.view.html',
        controller: 'CompaniesController',
        controllerAs: 'vm',
        resolve: {
          companyResolve: newCompany
        },
        data: {
          title: 'Tạo mới Công ty'
        }
      })
      .state('companies.createReview', {
        url: '/:companyId/createReview',
        templateUrl: 'modules/companies/client/views/form-review.client.view.html',
        controller: 'ReviewController',
        controllerAs: 'vm',
        resolve: {
          reviewResolve: newReview
        },
        data: {
          title: 'Đăng bài đánh giá'
        }
      })
      .state('companies.editReview', {
        url: '/:companyId/editReview/:reviewId/:message',
        templateUrl: 'modules/companies/client/views/edit-review.client.view.html',
        controller: 'ReviewController',
        controllerAs: 'vm',
        resolve: {
          reviewResolve: getReview
        },
        data: {
          title: 'Sửa bài đánh giá'
        }
      })
      .state('companies.view', {
        url: '/:companyId',
        data:{
          title: 'Chi tiết công ty'
        },
        views: {
          '': {
            templateUrl: 'modules/companies/client/views/view-company.client.view.html',
            controller: 'CompaniesController',
            controllerAs: 'vm',
            resolve: {
              companyResolve: getCompany
            }
          }
        }
      }).state('companies.recent', {
        url: '/getRecent',
        templateUrl: 'modules/companies/client/views/panel-company.client.view.html',
        controller: 'CompaniesRecentController',
        controllerAs: 'vm'
      })
      .state('companies.review', {
        url: '/:companyId/reviews/:reviewId',
        templateUrl: 'modules/companies/client/views/view-review.client.view.html',
        controller: 'ReviewController',
        controllerAs: 'vm',
        resolve: {
          reviewResolve: getReview
        },
        data:{
          title: 'Chi tiết đánh giá'
        }
      })
      .state('companies.search', {
        url: '/search/:keyword',
        templateUrl: 'modules/companies/client/views/list-companies.client.view.html',
        controller: 'SearchCompaniesController',
        controllerAs: 'vm',
        resolve: {
          companyResolve: getSearchResult
        },
        data:{
          title: 'Danh sách công ty'
        }
      });
  }

  getCompany.$inject = ['$stateParams', 'CompaniesService'];

  function getCompany($stateParams, CompaniesService) {
    return CompaniesService.get({
      companyId: $stateParams.companyId
    }).$promise;
  }

  getReview.$inject = ['$stateParams', 'ReviewService'];

  function getReview($stateParams, ReviewService) {
    return ReviewService.get({
      companyId: $stateParams.companyId,
      reviewId: $stateParams.reviewId
    }).$promise;
  }

  newReview.$inject = ['$stateParams', 'ReviewService'];

  function newReview($stateParams, ReviewService) {
    return ReviewService.get({
      companyId: $stateParams.companyId
    }).$promise;
  }

  newCompany.$inject = ['CompaniesService'];

  function newCompany(CompaniesService) {
    return new CompaniesService();
  }

  getDetailReview.$inject = ['$stateParams', 'DetailReviewService'];

  function getDetailReview($stateParams, DetailReviewService) {
    return DetailReviewService.get({
      reviewId: $stateParams.reviewId
    });
  }

  getSearchResult.$inject = ['$stateParams', 'SearchService'];

  function getSearchResult($stateParams, SearchService) {
    return SearchService.query({
      keyword: $stateParams.keyword
    });
  }


})();
