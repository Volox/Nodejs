(function() {

  jQuery(function($) {
    $('a.add-task').click(function() {
      var target;
      target = $(this).attr('href');
      $.ajax({
        url: target,
        type: 'put',
        success: function() {
          alert('Done');
        },
        error: function() {
          alert('Error while addng the task');
        }
      });
      return false;
    });
  });

}).call(this);
