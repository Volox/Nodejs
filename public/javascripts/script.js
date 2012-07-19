
  jQuery.event.props.push('dataTransfer');

  $(function() {
    var $dropzone, $hiddenInput;
    $dropzone = $('.dropzone');
    $hiddenInput = $('<input type="file">');
    $hiddenInput.prop('multiple', true);
    $hiddenInput.on('change', function(evt) {
      $dropzone.trigger('fileReady', [this.files, null]);
      return false;
    });
    $dropzone.append($hiddenInput);
    $dropzone.on('click', function(evt) {
      $hiddenInput.trigger(evt);
      return false;
    });
    $dropzone.on('drop', function(evt) {
      $(this).removeClass('active');
      evt.preventDefault();
      $dropzone.trigger('fileReady', [evt.dataTransfer.files, evt.dataTransfer]);
      return false;
    });
    $dropzone.on('dragover dragenter', function(evt) {
      evt.dataTransfer.dropEffect = 'copy';
      $(this).addClass('active');
      return false;
    });
    $dropzone.on('dragexit', function() {
      $(this).removeClass('active');
      return false;
    });
  });
