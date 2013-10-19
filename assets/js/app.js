(function (io) {

    var socket = io.connect();

    socket.on('connect', function socketConnected() {

    socket.get('/ticket', function (res) {
    console.log(res);
  });

  });


  // Expose connected `socket` instance globally so that it's easy
  // to experiment with from the browser console while prototyping.
  window.socket = socket;
  

})(

  // In case you're wrapping socket.io to prevent pollution of the global namespace,
  // you can replace `window.io` with your own `io` here:
  window.io

);
