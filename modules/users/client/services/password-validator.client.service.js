'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Mật khẩu phải chứa tối thiểu 10 ký tự bao gồm cả chữ thường, chữ hoa, số và ký tự đặc biệt';
        return popoverMsg;
      }
    };
  }
]);
