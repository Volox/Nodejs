###
@class MMImage
###
class MMImage
	DEFAULT_VALUE: 0

	constructor: ( obj )->
		#Check input data
		@data = null
		@width = 0
		@height = 0
		@channels = 0

		# Array data
		ret = true
		if arguments.length==3
			ret = @setArray.apply @, arguments
		if arguments.length==2
			ret  = @setEmpty.apply @, arguments
		else if arguments.length==1
			if obj instanceof HTMLElement
				ret = @setCanvas obj
			else
				ret = @setImageObject obj

		if !ret
			throw new Error 'Unable to create the image'

	setEmpty: ( width, height )->
		if width? and width>0 and height? and height>0
			@width = width
			@height = height
			@channels = 1
			@data = new Float32Array @width*@height
			return true
		else
			return false
	setCanvas: ( canvas )->
		try
			ctx = canvas.getContext '2d'
			data = ctx.getImageData 0, 0, canvas.width, canvas.height
			@width = data.width
			@height = data.height
			@data = data.data
			@channels = data.data.length
			return true
		catch ex
			return false

	setArray: ( ArrayData, width, height, channels=1 )->
		# Check array size
		if ( channels==1 and width*height==ArrayData.length ) or ( channels==ArrayData.length and width*height==ArrayData[0].length )
			@channels = channels
			@data = ArrayData
			@width = width
			@height = height
			return true
		else
			return false

	setImageObject: ( image )->
		if image.data? and image.width? and image.height? and image.data.length==image.width*image.height
			return @setArray image.data, image.width, image.height
		else			
			return false

	at: ( x, y, channel=0 )->
		x = parseInt x
		y = parseInt y
		if x<0 or x>@width-1 then return @DEFAULT_VALUE
		if y<0 or y>@height-1 then return @DEFAULT_VALUE
		index =@_i x, y
		if @channels==1
			return @data[ index ]
		else
			return @data[ channel ][ index ]

	# Private methods
	_i: (x,y)->
		return y*@width+x




###
@class MM
###
class MM
	@toImage: ( imageData, fitRange=false ) ->
		w = imageData.width
		h = imageData.height
		canvas = document.createElement 'canvas'
		canvas.width = w
		canvas.height = h
		canvasCtx = canvas.getContext "2d"
		canvasImageData = canvasCtx.createImageData w, h
		
		# Float -> RGB
		MM.toRGB imageData, canvasImageData, fitRange

		canvasCtx.putImageData canvasImageData, 0, 0
		return canvas

	@createImage: ( wImage, h )->
		w = wImage
		if not h?
			h = wImage.height
			w = wImage.width

		canvas = document.createElement 'canvas'
		canvas.width = w
		canvas.height = h
		canvasCtx = canvas.getContext '2d'
		imageData = canvasCtx.createImageData w, h
		return canvas: canvas, context: canvasCtx, data: imageData





	@getImage: ( image, scale=1, gray=false, outType )->
		w = parseInt image.width*scale
		h = parseInt image.height*scale

		canvas = document.createElement 'canvas'
		canvas.width = w
		canvas.height = h

		canvasCtx = canvas.getContext "2d"
		canvasCtx.drawImage image, 0, 0, w, h
		imageData = canvasCtx.getImageData 0, 0, w, h
		
		output =
			canvas: canvas
			context: canvasCtx
			data: imageData

		# Convert in grayscale
		if gray || outType?
			output = MM.toFloat imageData

		# Convert to type
		if outType?
			output.data = new window[ outType ] output.data
		
		return output

	@scale: ( image, scale )->
		w = image.width*scale
		h = image.height*scale

		canvas = document.createElement 'canvas'
		canvas.width = w
		canvas.height = h

		canvasCtx = canvas.getContext "2d"
		imageData = canvasCtx.getImageData 0, 0, w, h
		MM.toRGB image, imageData
		output = MM.toFloat imageData
		return output




	@gauss2d: (size, sigma = size/2, center = true ) ->
		result = new Float32Array size*size

		cY = if center then parseInt size/2 else 0
		cX = if center then parseInt size/2 else 0

		# used for normalization
		sum = 0
		for x in [0..size]
			for y in [0..size]
				index = y*size+x

				rX = x-cX
				rY = y-cY

				front = 1/(2*Math.PI*sigma*sigma)
				exp = -1*(rX*rX+rY*rY)/(2*sigma*sigma)
				value = front*Math.exp exp

				result[ index ] = value
				sum += value

		# Normalize
		for value, i in result
			result[ i ] = value/sum
		
		return result

	@toRGB: ( image, output, fitRange=false )->
		# check dimension
		w = image.width
		h = image.height
		if w!=output.width or h!=output.height
			throw new Error 'Dimension mismatch'

		# Set initial wrong data for range fitting
		max = -1
		min = 1
		if fitRange
			max = min = image.data[0]
			for x in [0..w-1]
				for y in [0..h-1]
					idx = y*w+x
					min = image.data[ idx ] if image.data[ idx ]<min
					max = image.data[ idx ] if image.data[ idx ]>max

		kernelArgs = MM.VoloTest.createKernelArgs()
		kernelArgs.addInput 'source', image.data
		kernelArgs.addOutput 'destination', output.data
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h
		kernelArgs.addArgument 'min', min, 'FLOAT'
		kernelArgs.addArgument 'max', max, 'FLOAT'

		MM.VoloTest.runKernel 'clRGB', [ w, h ], kernelArgs
		return

	@toFloat: ( image )->
		w = image.width
		h = image.height
		output = new MMImage w, h

		kernelArgs = MM.VoloTest.createKernelArgs()
		kernelArgs.addInput 'source', image.data
		kernelArgs.addOutput 'destination', output.data
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h

		MM.VoloTest.runKernel 'clFloat', [ w, h ], kernelArgs

		return output
	

	@blur: ( image, sigma=1, gaussSize=7 ) ->
		# Copy the image into a canvas
		w = image.width
		h = image.height
		# Create the output image 
		output = new MMImage w, h
		
		# Gaussaian 2d kernel (Float32Array)
		filter = MM.gauss2d gaussSize, sigma
		 

		kernelArgs = MM.VoloTest.createKernelArgs()
		kernelArgs.addInput 'source', image.data
		kernelArgs.addInput 'filter', filter
		kernelArgs.addOutput 'destination', output.data
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h
		kernelArgs.addArgument 'filterWidth', gaussSize
		kernelArgs.addArgument 'filterHeight', gaussSize

		MM.VoloTest.runKernel 'clConvolution', [ w, h ], kernelArgs

		return output


	
	@diff: ( img1, img2 )->
		# check images size
		w = img1.width
		h = img1.height
		if w!=img2.width or h!=img2.height
			throw new Error 'Image size mismatch'

		output = new MMImage w, h
		
		# Create the parameter object
		kernelArgs = MM.VoloTest.createKernelArgs()
		kernelArgs.addInput 'source1', img1.data
		kernelArgs.addInput 'source2', img2.data
		kernelArgs.addOutput 'destination', output.data
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h

		MM.VoloTest.runKernel 'clDiff', [ w, h ], kernelArgs

		return output



	@maxmin: ( prev, current, next )->
		w = current.width
		h = current.height
		# Check dimension
		if w!=prev.width or w!=next.width or h!=prev.height or h!=next.height
			throw new Error 'Dimension mismatch'
		
		# Create the output image
		output = new MMImage w, h

		# Create the parameter object
		kernelArgs = MM.VoloTest.createKernelArgs()
		kernelArgs.addInput 'prev', prev.data
		kernelArgs.addInput 'current', current.data
		kernelArgs.addInput 'next', next.data
		kernelArgs.addOutput 'output', output.data
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h

		MM.VoloTest.runKernel 'clMaxMin', [ w, h ], kernelArgs
		
		return output

	@refine: ( image, keyPoints )->
		w = image.width
		h = image.height
		if w!=keyPoints.width or h!=keyPoints.height
			throw new Error 'Dimension mismatch'

		# Create the output image
		output = new MMImage w, h

		# Create the parameter object
		kernelArgs = MM.VoloTest.createKernelArgs()
		kernelArgs.addInput 'image', image.data
		kernelArgs.addInput 'keypoints', keyPoints.data
		kernelArgs.addOutput 'output', output.data
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h

		MM.VoloTest.runKernel 'clRefine', [ w, h ], kernelArgs

		return output

	@magor: ( image, keyPoints )->
		w = image.width
		h = image.height
		if w!=keyPoints.width or h!=keyPoints.height
			throw new Error 'Dimension mismatch'

		# Create the output image
		orientation = new MMImage w, h
		magnitude = new MMImage w, h

		# Create the parameter object
		kernelArgs = MM.VoloTest.createKernelArgs()
		kernelArgs.addInput 'image', image.data
		kernelArgs.addInput 'keypoints', keyPoints.data
		kernelArgs.addOutput 'magnitude', magnitude.data
		kernelArgs.addOutput 'orientation', orientation.data
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h

		MM.VoloTest.runKernel 'clMagOrient', [ w, h ], kernelArgs

		return magnitude: magnitude, orientation: orientation
	@generateFeatures: ()->

	@sift: ( imageObj, handlers )->
		# variables
		times = 
			SIFT: 'SIFT'
			ScaleSpace: 'Scale space'
			DoG: 'Difference of Gaussian'
			MaxMin: 'Detecting Max/Min points'
			KeyPointRef: 'Key points refinement'
			MagOr: 'Computing magnitude and orientation'

		octavesNum = 4
		blurSteps = 5

		# Calculate octaves
		octaves = []
		for octave in [1..octavesNum]
			octaves.push 1/octave
		
		blurBaseValue = 0.707

		# Gauss size for blurring
		gaussSize = 7

		try
			# Start SIFT timer
			console.log times.SIFT
			console.group()
			totalTime = 0

			# blur image and double dimension
			image = MM.getImage imageObj, 2
			#image = MM.blur image, 0.5, gaussSize

			# First Perform ScaleSpace + Blur
			ScaleSpace = []
			console.time times.ScaleSpace
			
			for scale,index in octaves
				ScaleSpaceRow = []
				for blurStep in [0..blurSteps-1]

					# get the image and scale it
					img = MM.getImage image.canvas, scale, true, 'Float32Array'

					# blur the image
					if index==0 and blurStep==0
						blurImage = MM.blur img, 1, gaussSize
					else
						blurImage = MM.blur img, blurBaseValue*Math.pow(Math.SQRT2,blurStep), gaussSize

					ScaleSpaceRow.push blurImage
				ScaleSpace.push ScaleSpaceRow
			
			time = console.timeEnd times.ScaleSpace
			totalTime += time
			# call handler if present
			if handlers.scale? then handlers.scale ScaleSpace, time

			
			
			# DoG
			DoG = []
			console.time times.DoG

			for octave in [0..octavesNum-1]
				# Create the row for the octave
				DoGRow = []
				# for each octave perform "blurSteps" blur
				for blurStep in [0..blurSteps-2]
					img1 = ScaleSpace[ octave ][ blurStep ]
					img2 = ScaleSpace[ octave ][ blurStep+1 ]

					DoGImage = MM.diff img1, img2
					DoGRow.push DoGImage
				DoG.push DoGRow

			time = console.timeEnd times.DoG
			totalTime += time
			# call handler if present
			if handlers.dog? then handlers.dog DoG, time



			# Find MaxMin
			console.time times.MaxMin
			MaxMin = []
			for octave in DoG
				MaxMinRow = []
				for index in [1..octave.length-2]
					prev = octave[index-1]
					current = octave[index]
					next = octave[index+1]

					output = MM.maxmin prev, current, next

					MaxMinRow.push output
				MaxMin.push MaxMinRow

			time = console.timeEnd times.MaxMin
			totalTime += time
			# call handler if present
			if handlers.maxmin? then handlers.maxmin MaxMin, time




			# Refine keypoints
			console.time times.KeyPointRef
			KeyPoints = []
			for octave,idx in DoG
				KeyPointsRow = []
				for index in [1..octave.length-2]
					image = octave[index]
					output = MM.refine image, MaxMin[idx][index-1]
					KeyPointsRow.push output
				KeyPoints.push KeyPointsRow
			time = console.timeEnd times.KeyPointRef
			totalTime += time
			# call handler if present
			if handlers.refine? then handlers.refine KeyPoints, time




			# Find magnitude and orientation
			console.time times.MagOr
			MagOr = []
			for octave,idx in DoG
				MagOrRow = []
				for index in [1..octave.length-2]
					image = octave[ index ]
					data = MM.magor image, KeyPoints[idx][index-1]
					MagOrRow.push data
				MagOr.push MagOrRow
			time = console.timeEnd times.MagOr
			totalTime += time
			# call handler if present
			if handlers.magor? then handlers.magor MagOr, time
		catch ex
			console.log ex
		finally
			console.groupEnd()
			console.log "#{times.SIFT} total time #{totalTime}ms"

		return

# Make globally available
window.MM = MM
window.MMImage = MMImage

# Create an instance
MM.VoloTest = new VoloCL '/opencl/volo.cl'