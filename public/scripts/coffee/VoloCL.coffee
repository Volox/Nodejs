class VoloCL
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

		# init
		@init()

	init: ->
		@initCL()
		return

	initCL: ->
		if not window.WebCL
			alert "WebCL not supported"
		else
			console.log "WebCL supported"

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
		url = val
		if $( val ).length
			url = $( val ).prop 'src'

		ajaxResult = $.ajax url,
			async: false
		return ajaxResult.responseText

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
			for argument, index in @arguments
				@kernel.setKernelArg index, argument.buffer, argument.type
			console.log 'Kernel loaded'

			# Create command Queue
			@cmdQueue = @ctx.createCommandQueue @device, 0

			# Enqueue inputs
			for input in @inputs
				@cmdQueue.enqueueWriteBuffer input.buffer, false, 0, input.size, input.value, []

			# Reserve local/global WorkSpace
			###
			localWS = [16,4]
			globalWS = [Math.ceil(width/localWS[0])*localWS[0], 
						Math.ceil(height/localWS[1])*localWS[1] ];
			###

			# Execute the kernel
			@cmdQueue.enqueueNDRangeKernel @kernel, @globalWS.length, [], @globalWS, @localWS, []

			# Gather outputs
			for output in @outputs
				@cmdQueue.enqueueReadBuffer output.buffer, false, 0, output.size, output.value, []

			@cmdQueue.finish()
			return true
		catch error
			console.log error
			return false


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
			buffer: buffer
			size: size
			value: value
		
		@inputs.push varObj
		@arguments.push varObj
		return buffer

	addOutput: (name,size,value) ->
		buffer = @ctx.createBuffer @cl.CL_MEM_WRITE_ONLY, size
		varObj = 
			name: name
			size: size
			buffer: buffer
			value: value
		
		@outputs.push varObj
		@arguments.push varObj
		return buffer

	addArgument: (variable,type) ->
		@arguments.push
			buffer: variable
			type: @cl.types[type]
		return variable


window.VoloCL = VoloCL