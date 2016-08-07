// Companies service used to communicate Companies REST endpoints
(function () {
  'use strict';

  angular
    .module('companies')
    .factory('CompaniesService', CompaniesService)
    .factory('CompaniesRecentService', CompaniesRecentService)
    .factory('DetailReviewService', DetailReviewService)
    .factory('SearchService', SearchService)
    .factory('ReviewService', ReviewService);


  CompaniesService.$inject = ['$resource'];
  CompaniesRecentService.$inject = ['$resource'];
  DetailReviewService.$inject = ['$resource'];
  SearchService.$inject = ['$resource'];
  ReviewService.$inject = ['$resource'];

  function CompaniesService($resource) {
    return $resource('api/companies/:companyId', {
      companyId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }

  function DetailReviewService($resource) {
    return $resource('api/companies/review/:reviewId', {
      reviewId: '@_id'
    });
  }

  function CompaniesRecentService($resource) {

    return $resource('/api/companies?newestReview=desc&&limit=4', {});
  }

  function SearchService($resource) {

    return $resource('/api/companies?name=:keyword', {
      // keyword: '@keyword'
    });
  }

  function ReviewService($resource) {
    return $resource('/api/companies/:companyId/reviews/:reviewId', {
      companyId: '@_id',
      reviewId: '@reviews._id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }

}());
