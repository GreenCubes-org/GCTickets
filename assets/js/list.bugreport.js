$(document).ready(function(socket){
  $.ajax({
    type: "GET",
    url: '/bugreports/read',
    async: false,
    data: $(this).serialize(),
    complete: function(data) {
      console.log(data);
      $('#content').html('<table class="ui basic table">' +
        '<thead>' +
        '<tr>' +
          '<th>Тип</th>' +
          '<th>Пользователь</th>' +
          '<th>Тема</th>' +
          '<th>Время</th>' +
          '<th>Статус</th>' +
        '</tr></thead>' +
        '<tbody id="gc-list">' +
        '</tbody>' +
        '</table>');
      $.parseJSON(data.responseJSON).map(function(element) {
        $('#gc-list').append('<tr>' +
        '  <td class="t-type" title="Баг-репорт"><i class="wrench icon"></i></td>' +
        '  <td class="t-nick"><a href="/@'+ element.owner +'" class="gc-link">'+ element.owner +'</a></td>' +
        '  <td class="t-decr"><a href="/id/'+ element.id +'" class="gc-link">'+ element.title +'</a></td>' +
        '  <td class="t-time">Только что</td>' +
        '  <td class="t-status">'+ element.status +'</td>' +
        '</tr>');
      });
    },
    error: function(err) {
      $('.container').html('<div class="ui error message"><div class="header">Внезапная ошибка! Пожалуйста, сообщите о ней разработчику.</div></div>');
    }
  });
})
/*

*/
