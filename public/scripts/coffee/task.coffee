class Task
	constructor: (@id) ->
		@url = "/tasks/#{@id}"
		@codeUrl = @url+'/code'
		@resourcesUrl = @url+'/resources'
		@detailsUrl = @url+'/details/json'
		@resultUrl = @url+'/result'

		#Task specific data
		@name = null
		@description = null
		@code = null

		@result = null

		@taskInstance = null

		@readyCallbacks = []

	init: ->
		$.ajax
			url: @detailsUrl
			type: 'get'
			dataType: 'json'
			success: (data, textStatus, jqXHR) =>
				#console.log  'success', arguments
				@name = data.name
				@code = data.code
				@description = data.description

				@taskInstance = eval @code

				@ready()
				return
			error: (jqXHR, textStatus, errorThrown) =>
				#console.log  'error', arguments
				return
		return

	ready: ->
		for callback in @readyCallbacks
			callback()
		return
	onReady: (callback) ->
		@readyCallbacks.push callback
		return

	getCode: (callback, errorCallback ) ->
		errorCallback = errorCallback || callback
		$.ajax
			url: @codeUrl
			type: 'get'
			success: (data, textStatus, jqXHR) =>
				#console.log  'code success', arguments

				@taskInstance = eval data

				callback.apply null, arguments
				return
			error: (jqXHR, textStatus, errorThrown) =>
				#console.log  'code error', arguments
				errorCallback.apply null, arguments
				return
		return

	addScript: (placeholder) ->
		placeholder = placeholder || document

		el = $ placeholder

		script = document.createElement 'script'
		script.src = @codeUrl
		el.each ->
			this.appendChild script
			return
		
		###
		@getCode ( data ) ->
			#console.log 'AddScript', data
			el = $ placeholder
			script = $ '<script>',
				text: 'alert("Wow!")'
			el.append script
			return
		###
		return

	run: ->
		@taskInstance.run()
		return

	sendResult: ->
		url = @resultUrl
		method = 'put'

		console.log "sending PUT #{url}"

		return



# Create global
window.Task = Task