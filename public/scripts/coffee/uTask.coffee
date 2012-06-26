class uTask
	constructor: () ->
		@url = '/task/'
		@codeUrl = @url+'/code'
		@resourcesUrl = @url+'/resources'
		@detailsUrl = @url+'/details/json'
		@resultUrl = @url+'/result'


		@init()

	# Helper functions
	getData: ( name=null, id=null ) ->
		# retrieve the resource defined by name (the column of the schema)
		# filtered by the id
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

	# To implement function
	init: ->
		throw new Error "Not implemented"

	run: ->
		throw new Error "Not implemented"


# Create global
window.uTask = uTask