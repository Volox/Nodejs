jQuery ($) ->
	$( 'a.add-task' ).click ->
		target = $( this ).attr 'href'
		$.ajax
			url: target
			type: 'post'
			success: ->
				alert 'Done'
				return
			error: ->
				alert 'Error while addng the task'
				return
		return false

	$( 'span.delete' ).click ->
		$li = $( this ).closest 'li'
		$.ajax
			url: $li.data('url')+'/'+$li.data('taskId')
			type: 'delete'
			success: ->
				alert 'Done'
				return
			error: ->
				alert 'Error while deleting the task'
				return
		return false

	return

	