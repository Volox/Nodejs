class Task
	constructor: (@id) ->
		@url = "/tasks/#{@id}"
		@codeUrl = @url+'/code'
		@resourcesUrl = @url+'/resources'
		@detailsUrl = @url+'/details/json'
		@resultUrl = @url+'/result'

		@result = null

		@init()

	init: ->
		$.ajax
			url: @detailsUrl
			type: 'get'
			dataType: 'json'
			success: =>
				console.log  'success', arguments
				return
			error: =>
				console.log  'error', arguments
				return
		return

	getCode: ->
		$.ajax
			url: @codeUrl
			type: 'get'
			dataType: 'script'
			success: =>
				console.log  'code success', arguments
				return
			error: =>
				console.log  'code error', arguments
				return
		return

	addScript: ->
		
		return

	sendResult: ->
		url = @resultUrl
		method = 'put'

		console.log "sending PUT #{url}"

		return



# Create global
window.Task = Task