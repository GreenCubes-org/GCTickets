//TODO: Переписать на socket.io
var ticketApp = angular.module('ticketApp', []);

ticketApp.controller('TicketController', function($scope, $http) {

  $scope.tickets = [];

  // Get all tickets
  $http.get('/ticket')
    .success(function(tickets) {
      $scope.loaded = true;
      $scope.tickets = tickets;
    }).error(function(err) {
      // Alert if there's an error
      alert(err);
    });

  $scope.addTickets = function(title) {

    if($.trim(title).length === 0){
      ctrl.$setValidity('newTicketTitle', false);
      return;
    }

    $http.post('/ticket', {
      title: title
    }).success(function(ticket) {
        $scope.newTicketTitle = '';
        $scope.tickets.push(ticket);
      }).error(function(err) {
        // Alert if there's an error
        return alert(err.message || "an error occurred");
      });
  };

  $scope.changeCompleted = function(ticket) {
    // Update the ticket
    $http.put('/ticket/' + ticket.id, {
      completed: ticket.completed
    }).error(function(err) {
        return alert(err.message || (err.errors && err.errors.completed) || "an error occurred");
      });
  };

  $scope.removeCompletedItems = function() {
    $http.get('/ticket', {
      params: {
        completed: true
      }
    }).success(function(tickets) {
        tickets.forEach(function(t) { deleteTicket(t); });
      });
  };

  function deleteTicket(ticket) {
    $http.delete('/ticket/' + ticket.id, {
      params: {
        completed: true
      }
    }).success(function() {
        // Find the index of an object with a matching id
        var index = $scope.tickets.indexOf(
          $scope.tickets.filter(function(t) {
            return t.id === ticket.id;
          })[0]);

        if (index !== -1) {
          $scope.tickets.splice(index, 1);
        }
      }).error(function(err) {
        alert(err.message || "an error occurred");
      });
  }

});
