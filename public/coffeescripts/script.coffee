jQuery.event.props.push 'dataTransfer'

$ ->
	$dropzone = $ '.dropzone'

	# create the hidden input filed
	$hiddenInput = $ '<input type="file">'
	$hiddenInput.prop 'multiple', true
	$hiddenInput.on 'change', ( evt )->
		$dropzone.trigger 'fileReady', [ @files, null ]
		return false

	$dropzone.append $hiddenInput


	$dropzone.on 'click', ( evt ) ->
		$hiddenInput.trigger evt
		return false
	$dropzone.on 'drop', ( evt ) ->
		$( @ ).removeClass 'active'
		evt.preventDefault()
		$dropzone.trigger 'fileReady', [ evt.dataTransfer.files, evt.dataTransfer ]
		return false
	$dropzone.on 'dragover dragenter', (evt) ->
		evt.dataTransfer.dropEffect = 'copy'
		$( @ ).addClass 'active'
		return false

	$dropzone.on 'dragexit', ->
		$( @ ).removeClass 'active'
		return false
	return

	