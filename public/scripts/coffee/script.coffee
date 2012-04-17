jQuery ($) ->
	$.event.props.push 'dataTransfer'
	
	$( 'input[type="file"]' ).change (e) ->
	  file = this.files[ 0 ]
	  console.log 'File change'
	  if( file )
  		console.log 'File name: '+file.name
  		console.log 'File size: '+file.size
  		console.log 'File type: '+file.type
	  return

	$( '.dropzone' ).on 'dragover dragenter', false

	$( '.dropzone' ).on 'drop', (e) ->
	  if e.preventDefault
	  	e.preventDefault()
	  $ul = $( this ).parent().children( '.fileList' )
	  $ul.empty()
	  $.each e.dataTransfer.files, ->
	  	$ul.append $ '<li>'
	  		text: this.name + ' ' +this.size + ' ' + this.type
	  	return

	  formData = new FormData();
	  $.each e.dataTransfer.files, () ->
	  	formData.append 'file', this
	  	return
	  
	  xhr = new XMLHttpRequest();
	  xhr.open('POST', '/uploadAjax', true);
	  xhr.onload = (e) ->
	  	console.log 'Send', arguments
	  xhr.send(formData);
	  
	  return false


	$( 'span.delete' ).click (e) ->
		$li = $( this ).closest 'li'
		$.ajax
			url: $li.data('url')+'/'+$li.data('taskId')
			type: 'delete'
			success: ->
				$li.slideUp 500
				return
			error: ->
				alert 'Error while deleting the task'
				return
		return false

	return

	