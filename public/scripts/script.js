(function() {

  jQuery(function($) {
    $('a.add-task').click(function() {
      var target;
      target = $(this).attr('href');
      $.ajax({
        url: target,
        type: 'post',
        success: function() {
          alert('Done');
        },
        error: function() {
          alert('Error while addng the task');
        }
      });
      return false;
    });
    $('span.delete').click(function() {
      var $li;
      $li = $(this).closest('li');
      $.ajax({
        url: $li.data('url') + '/' + $li.data('taskId'),
        type: 'delete',
        success: function() {
          alert('Done');
        },
        error: function() {
          alert('Error while deleting the task');
        }
      });
      return false;
    });
  });

}).call(this);
