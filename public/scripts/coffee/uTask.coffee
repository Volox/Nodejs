class uTask
	constructor: () ->
		pathFragments = location.pathname.split '/'
		taskID = pathFragments[ 2 ]

		@url = '/task/' + taskID
		@codeUrl = @url+'/code'
		@inputUrl = @url+'/input'
		@configUrl = @url+'/configuration'
		@resultUrl = @url+'/result'


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
	
	setData: ( name, data ) ->
		console.log "Setting #{name} to #{value}"
		# set an output value
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