class VoloCL
	constructor: ( kernelSrc ) ->
		@cl = window.WebCL
		@platform = null
		@device = null
		@ctx = null

		# Program Related
		@kernelSrc = null
		@program = null
		@kernel = null

		# WorkSpace
		@localWS = null
		@globalWS = null

		# init
		@init( kernelSrc )

	init: ( kernelSrc ) ->
		@initCL kernelSrc
		return

	initCL: ( kernelSrc )->
		if not window.WebCL
			alert "WebCL not supported"
		else
			#console.log "WebCL supported"


		#console.log 'Initializing WebCL using kernel'+kernelSrc

		@platform = @getPlatforms()[ 0 ]
		#console.log 'Got platform'
		#console.log @platform

		@device = @getDevices( @platform )[ 0 ]
		#console.log 'Got device'
		#console.log @device

		@ctx = @cl.createContextFromType [ @cl.CL_CONTEXT_PLATFORM, 
                                           @platform ],
                                           @cl.CL_DEVICE_TYPE_DEFAULT
		\
		#console.log 'Context created'

		@loadKernel kernelSrc
		
		return

	getPlatforms: ->
		return @cl.getPlatformIDs()

	getDevices: (platform = @getPlatforms()[0]) ->
		return platform.getDeviceIDs @cl.CL_DEVICE_TYPE_DEFAULT


	# Kernel related
	getKernel: (val) ->
		if val
			ajaxResult = $.ajax val,
				async: false
			kernelSource = ajaxResult.responseText

		return kernelSource

	loadKernel: ( url ) ->
		#console.log 'Loading and building kernel @: '+url
		try
			@kernelSrc = @getKernel url

			@program = @ctx.createProgramWithSource @kernelSrc

			# Try to build the program
			try
				@program.buildProgram [ @device ], ""
				#console.log 'Kernel loaded'
			catch error
				log = @program.getProgramBuildInfo @device, @cl.CL_PROGRAM_BUILD_LOG
				console.log 'Kernel NOT loaded'
				console.log log
				throw error
		catch error
			console.error error

		return

	# Run the kernel
	runKernel: ( name, size, kernelArgs ) ->
		#console.log "Running kernel '#{name}'"
		# Program built, now take care of the kernel
		kernel = @program.createKernel name
		#console.log 'Kernel created'

		# Add arguments
		#console.log 'Setting kernel arguments'
		for name, index in kernelArgs.arguments
			argument = kernelArgs.argumentsMap[ name ]
			kernel.setKernelArg index, argument.buffer, argument.type

		# Create command Queue
		#console.log 'Creating command queue for device'
		cmdQueue = @ctx.createCommandQueue @device, 0

		# Enqueue inputs
		#console.log 'Queuing input arguments'
		for name in kernelArgs.inputs
			input = kernelArgs.argumentsMap[ name ]
			cmdQueue.enqueueWriteBuffer input.buffer, false, 0, input.size, input.value, []

		#console.log 'Setting dimensions for WorkSpaces'
		@setLocalWS [ 16, 4 ]
		@setGlobalWS [ Math.ceil(size[0]/@localWS[0])*@localWS[0], Math.ceil(size[1]/@localWS[1])*@localWS[1] ]

		#console.log 'Queuing kernel (Run)'
		cmdQueue.enqueueNDRangeKernel kernel, @globalWS.length, [], @globalWS, @localWS, []

		# Gather outputs
		#console.log 'Kernel executed, gathering outputs'
		for name in kernelArgs.outputs
			output = kernelArgs.argumentsMap[ name ]
			cmdQueue.enqueueReadBuffer output.buffer, false, 0, output.size, output.value, []

		#console.log 'Closing the command queue'
		cmdQueue.finish()

		# flush data
		cmdQueue.releaseCLResources()
		return

	#throw new Error "Not implemented"
	# WorkSpace
	setLocalWS: (value) ->
		#console.log "Setting the Local WorkSpace to #{value}"
		@localWS = value
		return
	setGlobalWS: (value) ->
		#console.log "Setting the Global WorkSpace to #{value}"
		@globalWS = value
		return

	createKernelArgs: ->
		return new KernelArguments @
class KernelArguments
	constructor: (  VoloCL ) ->
		@cl = VoloCL.cl
		@ctx = VoloCL.ctx
		@arguments = []
		@inputs = []
		@outputs = []
		@argumentsMap = {}

		#console.log 'Created KernelArguments object'
		return

	addInput: (name, variable ) ->
		#console.log "Adding #{name} @ #{@arguments.length} to the input parameters"
		value = variable
		# image
		if variable?.data?.data?.length
			value = variable.data.data
		else if variable?.data?.length
			value = variable.data

		size = value.length*value.BYTES_PER_ELEMENT

		buffer = @ctx.createBuffer @cl.CL_MEM_READ_ONLY, size
		varObj = 
			name: name
			size: size
			value: value
			buffer: buffer
		
		@arguments.push name
		@inputs.push name

		@argumentsMap[ name ] = varObj
		return

	addOutput: (name, variable ) ->
		#console.log "Adding #{name} @ #{@arguments.length} to the output parameters"
		value = variable
		# image
		if variable?.data?.data?.length
			value = variable.data.data
		else if variable?.data?.length
			value = variable.data

		size = value.length*value.BYTES_PER_ELEMENT

		buffer = @ctx.createBuffer @cl.CL_MEM_WRITE_ONLY, size
		varObj = 
			name: name
			size: size
			value: value
			buffer: buffer
		
		@outputs.push name
		@arguments.push name

		@argumentsMap[ name ] = varObj
		return

	addArgument: ( name, variable, type = "UINT" ) ->
		#console.log "Adding #{name} @ #{@arguments.length} of type #{type} with value '#{variable}' to the argument list"

		varObj =
			buffer: variable
			name: name
			type: @cl.types[type]
			value: variable

		@arguments.push name
		@argumentsMap[ name ] = varObj
		return

window.KernelArguments = KernelArguments
window.VoloCL = VoloCL