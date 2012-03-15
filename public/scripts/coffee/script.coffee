jQuery ($) ->
	$( 'a.add-task' ).click ->
		target = $( this ).attr 'href'
		$.ajax
			url: target
			type: 'put'
			success: ->
				alert 'Done'
				return
			error: ->
				alert 'Error while addng the task'
				return
		return false
	return