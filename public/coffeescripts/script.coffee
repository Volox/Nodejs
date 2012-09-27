jQuery.event.props.push 'dataTransfer'

$ ->
	$dropzone = $ '.dropzone'

	# create the hidden input filed
	$hiddenInput = $dropzone.find 'input[type="file"]'
	if $hiddenInput.length!=1
		$hiddenInput = $ '<input type="file">'
	$hiddenInput.prop 'multiple', true
	$hiddenInput.on 'change', ( evt )->
		$dropzone.trigger 'fileReady', [ @files, null ]
		evt.stopPropagation()
		return false

	$dropzone.append $hiddenInput


	$dropzone.on 'click', ( evt ) ->
		$hiddenInput.triggerHandler 'change'
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

	