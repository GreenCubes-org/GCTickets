$(function() {
  var html
  $.ajax({
    type: "GET",
    url: '/csrfToken',
    data: $(this).serialize(),
    success: function(data) {
      html = formhtml = '<div id="hd-loginform">' +
        '<form id="loginform">' + 
          '<input type="hidden" name="_csrf" value="' + data._csrf + '" />' +
          '<div class="ui form" style="display: inline-block !important">' +
            '<div class="gc-loginfield field">' +
              '<div class="ui left labeled icon mini input">' +
                '<input placeholder="Логин" type="text" name="username">' +
                '<i class="user icon"></i>' +
              '</div>' +
            '</div>' +
            '<div class="gc-loginfield field">' +
              '<div class="ui left labeled icon mini input">' +
                '<input placeholder="Пароль" type="password" name="password">' +
                '<i class="lock icon"></i>' +
              '</div>' +
            '</div>' +
            '<button type="submit" class="ui blue submit mini button">Войти</button>' +
            '</div>' +
        '</form>' +
        '<div id="hd-loginerr"></div>' +
      '</div>';
      $('#hd-login')
        .popup({
          on: 'click',
          html: formhtml,
          variation: "large",
          position: "bottom left",
          offset: 60,
          closable: false
      });
    },
    error: function(err) {
      html = formhtml = '<div id="hd-loginform">' +
                        '<div class="ui gc-loginmessage">У сервера появились проблемы :(</div>' +
                        '</div>';
      $('#hd-login')
        .popup({
          on: 'click',
          html: formhtml,
          variation: "large",
          position: "bottom left",
          offset: 60,
          closable: false
      });
    }
  });
  $(document).on('submit', "#loginform", function(e) {
    $.ajax({
      type: "POST",
      url: '/login',
      data: $('form#loginform').serialize(),
      success: function(data) {
        if (!data.error) {
          window.location ='/';
        } else {
          $('#hd-loginerr').html('<div class="ui gc-loginmessage">' + data.error.message + '</div>');
        }
      }
    });
    return false;
  });
})
