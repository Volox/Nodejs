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
		@initCL( kernelSrc )
		return

	initCL: ( kernelSrc )->
		if not window.WebCL
			alert "WebCL not supported"
		else
			#console.log "WebCL supported"

		@platform = @getPlatforms()[ 0 ]
		@device = @getDevices( @platform )[ 0 ]
		@ctx = @cl.createContextFromType [ @cl.CL_CONTEXT_PLATFORM, 
                                           @platform ],
                                           @cl.CL_DEVICE_TYPE_DEFAULT
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
		try
			@kernelSrc = @getKernel url

			@program = @ctx.createProgramWithSource @kernelSrc

			# Try to build the program
			try
				@program.buildProgram [ @device ], ""
			catch error
				log = @program.getProgramBuildInfo @device, @cl.CL_PROGRAM_BUILD_LOG
				console.log 'Kernel NOT loaded'
				console.log log
				throw error
		catch error
			console.log error

		return

	# Run the kernel
	runKernel: ( name, size, kernelArgs ) ->
		# Program built, now take care of the kernel
		kernel = @program.createKernel name
		# Add arguments
		for name, index in kernelArgs.arguments
			argument = kernelArgs.argumentsMap[ name ]
			kernel.setKernelArg index, argument.buffer, argument.type

		# Create command Queue
		cmdQueue = @ctx.createCommandQueue @device, 0

		# Enqueue inputs
		for name in kernelArgs.inputs
			input = kernelArgs.argumentsMap[ name ]
			cmdQueue.enqueueWriteBuffer input.buffer, false, 0, input.size, input.value, []

		@localWS = [ 16, 4 ]
		@globalWS = [ Math.ceil(size[0]/@localWS[0])*@localWS[0], Math.ceil(size[1]/@localWS[1])*@localWS[1] ]

		cmdQueue.enqueueNDRangeKernel kernel, @globalWS.length, [], @globalWS, @localWS, []

		# Gather outputs
		for name in kernelArgs.outputs
			output = kernelArgs.argumentsMap[ name ]
			cmdQueue.enqueueReadBuffer output.buffer, false, 0, output.size, output.value, []

		cmdQueue.flush()
		cmdQueue.finish()
		return

	#throw new Error "Not implemented"
	# WorkSpace
	setLocalWS: (value) ->
		@localWS = value
		return
	setGlobalWS: (value) ->
		@globalWS = value
		return

class KernelArguments
	constructor: (  VoloCL ) ->
		@cl = VoloCL.cl
		@ctx = VoloCL.ctx
		@arguments = []
		@inputs = []
		@outputs = []
		@argumentsMap = {}
		return

	addInput: (name, variable ) ->
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
		valuee = variable
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