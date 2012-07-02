class uTask
	constructor: () ->
		pathFragments = location.pathname.split '/'
		taskID = pathFragments[ 2 ]

		@task = taskID
		@url = '/task/' + taskID
		@codeUrl = @url+'/code'
		@inputUrl = @url+'/input'
		@configUrl = @url+'/configuration'
		@resultUrl = @url+'/result'

		@outputData = {}

		@init()

	# Helper functions
	getConfiguration: ( name='*', callback ) ->
		# retrieve the configuration defined by name
		$.ajax 
			url: "#{@configUrl}/#{name}",
			dataType: 'json',
			error: ( xhr, status, response )->
				callback response, {}

			success: ( json )->
				callback null, json
		return
		return
	getData: ( config={}, callback ) ->
		# retrieve the resource defined by name (the column of the schema)
		# filtered by the id
		if typeof config == 'string'
			config = 
				name: config
		name = config.name || '*'
		id = config.id

		$.ajax 
			url: "#{@inputUrl}/#{name}",
			dataType: 'json',
			error: ( xhr, status, response )->
				callback response, {}

			success: ( json )->
				callback null, json
		return
	
	storeData: ( name, data ) ->
		@outputData[ name ] = data
		return
	postData: ( formData, callback ) ->
		if !callback
			callback = formData
			formData = undefined
		# Post the stored data to the server
		$.ajax
			url: @resultUrl,
			data: formData || JSON.stringify( @outputData ),
			processData: if formData then false else true,
			contentType: if formData then false else 'application/json; charset=UTF-8',
			dataType: if formData then undefined else 'json',
			cache: false,
			type: 'POST',
			beforeSend: ( xhr )=>
				xhr.setRequestHeader "X-Requested-With", "XMLHttpRequest"
				return
			error: (jXHR, status, error )=>
				callback error, {}
				return
			success: ( data, status, jXHR )=>
				callback null, data
				return
		return

	sendStatus: ( status ) ->
		console.log "Sending status: #{status}"
		# send a status report to the server
		# need a server implementation to manage the requests
		return

	# Task specific function (MUST be implemented)
	init: ->
		throw new Error "Not implemented"

	run: ->
		throw new Error "Not implemented"


# Create global
window.uTask = uTask