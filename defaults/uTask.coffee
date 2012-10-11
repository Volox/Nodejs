class uTask
	constructor: () ->
		pathFragments = location.pathname.split '/'
		taskID = pathFragments[ 2 ]

		# Parse the querystring to extract accessToken and execution
		query = location.search.substring 1
		params = query.split '&'
		$.each params, (idx, val)=>
			res = val.match( /accessToken=(.*)/i )
			if res and res[1] then @token=res[1]
			res = val.match( /execution=(.*)/i )
			if res and res[1] then @execution=res[1]


		console.log "Execution = #{@execution}"
		console.log "Token = #{@token}"
		@task = parseInt taskID, 10
		@url = '/task/' + taskID
		@codeUrl = @url+'/code'
		@inputUrl = @url+'/input'
		@configUrl = @url+'/configuration'
		@resultUrl = @url+'/result'

		@outputData = {}

		@init()

	# Helper functions
	getConfiguration: ( name, callback ) ->
		if !callback
			callback = name
			name = '*'
		# retrieve the configuration defined by name
		$.ajax 
			url: "#{@configUrl}/#{name}",
			dataType: 'json',
			error: ( xhr, status, response )->
				callback response, {}

			success: ( json )->
				callback null, json
		return
	getDetails: (callback)->
		if !callback
			throw new Error 'No callback provided'

		$.ajax 
			url: @url,
			dataType: 'json',
			error: ( xhr, status, response )->
				callback response, {}

			success: ( json )->
				callback null, json

		return
	getData: ( config={}, callback ) ->
		if !callback
			callback = config
			config = {}
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
			beforeSend: ( xhr )=>
				xhr.setRequestHeader "X-Requested-With", "XMLHttpRequest"
				return
			error: ( xhr, status, response )->
				callback response, {}

			success: ( json )->
				callback null, json
		return
	toggleData: ( name ) ->
		if @outputData[ name ]
			@removeData name
			return false
		else
			@storeData name, true
			return true
	removeData: ( name ) ->
		delete @outputData[ name ]
		return
	storeData: ( name, data ) ->
		@outputData[ name ] = data
		return
	postData: ( formData, callback ) ->
		if !callback
			callback = formData
			formData = undefined

		# append the execution and the Access token
		@outputData['execution'] = @execution
		@outputData['token'] = @token

		# Post the stored data to the server
		console.log 'Posting data', @outputData, formData
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