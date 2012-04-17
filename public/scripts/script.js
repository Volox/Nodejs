(function() {

  jQuery(function($) {
    $.event.props.push('dataTransfer');
    $('input[type="file"]').change(function(e) {
      var file;
      file = this.files[0];
      console.log('File change');
      if (file) {
        console.log('File name: ' + file.name);
        console.log('File size: ' + file.size);
        console.log('File type: ' + file.type);
      }
    });
    $('.dropzone').on('dragover dragenter', false);
    $('.dropzone').on('drop', function(e) {
      var $ul, formData, xhr;
      if (e.preventDefault) e.preventDefault();
      $ul = $(this).parent().children('.fileList');
      $ul.empty();
      $.each(e.dataTransfer.files, function() {
        $ul.append($('<li>', {
          text: this.name + ' ' + this.size + ' ' + this.type
        }));
      });
      formData = new FormData();
      $.each(e.dataTransfer.files, function() {
        formData.append('file', this);
      });
      xhr = new XMLHttpRequest();
      xhr.open('POST', '/uploadAjax', true);
      xhr.onload = function(e) {
        return console.log('Send', arguments);
      };
      xhr.send(formData);
      return false;
    });
    $('span.delete').click(function(e) {
      var $li;
      $li = $(this).closest('li');
      $.ajax({
        url: $li.data('url') + '/' + $li.data('taskId'),
        type: 'delete',
        success: function() {
          $li.slideUp(500);
        },
        error: function() {
          alert('Error while deleting the task');
        }
      });
      return false;
    });
  });

}).call(this);
