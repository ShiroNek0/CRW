'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  users = require(path.resolve('./modules/users/server/controllers/users/users.profile.server.controller')),
  companies = require(path.resolve('./modules/companies/server/controllers/companies.server.controller'));

// Create the chat configuration
module.exports = function (io, socket) {
  var user = socket.request.user;

  // Gửi số lượng bài đánh giá chưa duyệt cho admin và mod
  if(user.roles.indexOf('mod') !== -1 || user.roles.indexOf('admin') !== -1) {
    companies.countWaitingReviews(function (result) {
      console.log('Waiting review: ' + result);
      socket.emit(result);
    });

    companies.countReportedReviews(function (result) {
      console.log('Reported review: ' + result);
      socket.emit(result);
    });

    users.notiEventEmitter.on('review waiting', function() {
      // Cập nhật số lượng bài đánh giá đang chờ duyệt
      companies.countWaitingReviews(function (result) {
        console.log('Waiting review triggered: ' + result);
        socket.emit(result);
      });
    });

    users.notiEventEmitter.on('review reported', function(data) {
      // Cập nhật số lượng bài đánh giá có báo cáo chưa xử lý
      companies.countReportedReviews(function (result) {
        console.log('Reported review triggered: ' + result);
        socket.emit(result);
      });
    });
  }

  // Gửi thông báo cho client khi có noti
  users.notiEventEmitter.on('notification', function (data) {
    // Gửi thông báo nếu client là đối tượng của noti
    if(user._id.equals(data.userId)) {
      socket.emit(data);
    }
  });
};
