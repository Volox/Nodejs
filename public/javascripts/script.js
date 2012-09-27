
  jQuery.event.props.push('dataTransfer');

  $(function() {
    var $dropzone, $hiddenInput;
    $dropzone = $('.dropzone');
    $hiddenInput = $dropzone.find('input[type="file"]');
    if ($hiddenInput.length !== 1) $hiddenInput = $('<input type="file">');
    $hiddenInput.prop('multiple', true);
    $hiddenInput.on('change', function(evt) {
      $dropzone.trigger('fileReady', [this.files, null]);
      evt.stopPropagation();
      return false;
    });
    $dropzone.append($hiddenInput);
    $dropzone.on('click', function(evt) {
      $hiddenInput.triggerHandler('change');
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
