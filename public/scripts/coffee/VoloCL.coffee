class VoloCL
	@kernels: {}
	constructor: () ->
		@cl = window.WebCL
		@platform = null
		@device = null
		@ctx = null

		# Program Related
		@kernelSrc = null
		@program = null
		@kernel = null

		# WorkSpace
		@localWS = 0
		@globalWS = 0

		# I/O related
		@inputs = []
		@outputs = []
		@arguments = []
		@argumentsMap = {}

		# init
		@init()

	init: ->
		@initCL()
		return

	initCL: ->
		if not window.WebCL
			alert "WebCL not supported"
		else
			#console.log "WebCL supported"

		@platform = @getPlatforms()[ 0 ]
		@device = @getDevices( @platform )[ 0 ]
		@ctx = @cl.createContextFromType [ @cl.CL_CONTEXT_PLATFORM, 
                                           @platform ],
                                           @cl.CL_DEVICE_TYPE_DEFAULT
		return

	getPlatforms: ->
		return @cl.getPlatformIDs()

	getDevices: (platform = @getPlatforms()[0]) ->
		return platform.getDeviceIDs @cl.CL_DEVICE_TYPE_DEFAULT


	# Kernel related
	getKernel: (val) ->
		kernelSource = VoloCL.kernels[ val ]
		if not kernelSource?
			url = $( val ).prop 'src'
			ajaxResult = $.ajax url,
				async: false
			kernelSource = ajaxResult.responseText
			VoloCL.kernels[ val ] = kernelSource

		return kernelSource

	loadKernel: (url,name) ->
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

			# Program built, now take care of the kernel
			@kernel = @program.createKernel name
			# Add arguments
			for name, index in @arguments
				argument = @argumentsMap[ name ]
				@kernel.setKernelArg index, argument.buffer, argument.type
 
			# Create command Queue
			@cmdQueue = @ctx.createCommandQueue @device, 0

			return true
			console.log error
			return false

	# Run the kernel
	runKernel:  () ->
		try
			# Enqueue inputs
			for name in @inputs
				input = @argumentsMap[ name ]
				@cmdQueue.enqueueWriteBuffer input.buffer, false, 0, input.size, input.value, []

			# Execute the kernel
			#workGroupSize = @kernel.getKernelWorkGroupInfo(@device, @cl.CL_KERNEL_WORK_GROUP_SIZE);
			
			@cmdQueue.enqueueNDRangeKernel @kernel, @globalWS.length, [], @globalWS, @localWS, []

			# Gather outputs
			for name in @outputs
				output = @argumentsMap[ name ]
				@cmdQueue.enqueueReadBuffer output.buffer, false, 0, output.size, output.value, []

			@cmdQueue.finish()
		catch error
			console.error error

		return

	#throw new Error "Not implemented"
	# WorkSpace
	setLocalWS: (value) ->
		@localWS = value
		return
	setGlobalWS: (value) ->
		@globalWS = value
		return


	# I/O related
	addInput: (name,size,value) ->
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

	addOutput: (name,size,value) ->
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

	addArgument: (name,variable,type) ->
		varObj =
			buffer: variable
			name: name
			type: @cl.types[type]
			value: variable

		@arguments.push name
		@argumentsMap[ name ] = varObj
		return variable

	setValues: (map)->
		for name,value in map
			@setValue name, value
		return
	setValue: (name, value)->
		@argumentsMap[ name ] = value extends @argumentsMap[ name ]
		return
window.VoloCL = VoloCL