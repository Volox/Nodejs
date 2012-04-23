class Task
	constructor: (@id) ->
		@url = "/tasks/#{@id}"
		@codeUrl = @url+'/code'
		@resourcesUrl = @url+'/resources'
		@detailsUrl = @url+'/details/json'
		@resultUrl = @url+'/result'

		#Task specific data
		@name = null
		@id = null
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
				@id = data._id

				@taskInstance = eval @code

				@ready()
				return
			error: (jqXHR, textStatus, errorThrown) =>
				console.log  'error', arguments
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

	###
	addScript: (placeholder) ->
		placeholder = placeholder || document

		el = $ placeholder

		# can't use jquery for debugging purposes
		script = document.createElement 'script'
		script.src = @codeUrl
		el.each ->
			this.appendChild script
			return
		
		return
	###

	run: ->
		@taskInstance.run()
		return

	sendResult: ->
		@taskInstance.send( @resultUrl );
		return



# Create global
window.Task = Task