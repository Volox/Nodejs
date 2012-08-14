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
		canvasCtx = canvas.getContext "2d"
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

	@toRGB: ( image, imageData, fitRange=false )->
		# check dimension
		w = image.width
		h = image.height
		if w!=imageData.width or h!=imageData.height
			throw new Error 'Dimension mismatch'

		# Wrong data
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
		kernelArgs.addOutput 'destination', imageData.data
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h
		kernelArgs.addArgument 'min', min, 'FLOAT'
		kernelArgs.addArgument 'max', max, 'FLOAT'

		MM.VoloTest.runKernel 'clRGB', [ w, h ], kernelArgs
		return

	@toFloat: ( image )->
		w = image.width
		h = image.height
		FloatImage = 
			width: w
			height: h
			data: new Float32Array w*h

		kernelArgs = MM.VoloTest.createKernelArgs()
		kernelArgs.addInput 'source', image.data
		kernelArgs.addOutput 'destination', FloatImage.data
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h

		MM.VoloTest.runKernel 'clFloat', [ w, h ], kernelArgs

		return FloatImage


	@blur: ( image, sigma=1, gaussSize=7 ) ->
		# Copy the image into a canvas
		w = image.width
		h = image.height
		# Create the output image 
		output =
			width: w
			height: h
			data: new Float32Array w*h
		
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

		output =
			width : w
			height: h
			data: new Float32Array w*h
		
		# Create the parameter object
		kernelArgs = MM.VoloTest.createKernelArgs()
		kernelArgs.addInput 'source1', img1.data
		kernelArgs.addInput 'source2', img2.data
		kernelArgs.addOutput 'destination', output.data
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h

		MM.VoloTest.runKernel 'clDiff', [ w, h ], kernelArgs

		return output



	@maxmin: ( prev, current, next, threshold=0 )->
		w = current.width
		h = current.height
		# Check dimension
		if w!=prev.width or w!=next.width or h!=prev.height or h!=next.height
			throw new Error 'Dimension mismatch'
		
		# Create the output image
		output =
			width: w
			height: h
			data: new Float32Array w*h

		# Create the parameter object
		kernelArgs = MM.VoloTest.createKernelArgs()
		kernelArgs.addInput 'prev', prev.data
		kernelArgs.addInput 'current', current.data
		kernelArgs.addInput 'next', next.data
		kernelArgs.addOutput 'output', output.data
		kernelArgs.addArgument 'threshold', threshold, 'FLOAT'
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h

		MM.VoloTest.runKernel 'clMaxMin', [ w, h ], kernelArgs
		
		return output

	@sift: ( imageObj, handlers )->
		###
		image = MM.getImage imageObj, true, 'Float32Array'
		h = image.data.height
		w = image.data.weight
		####

		# variables
		times = 
			SIFT: 'SIFT'
			ScaleSpace: 'ScaleSpace'
			DoG: 'DoG'
			MaxMin: 'MaxMin'
			KeyPointRef: 'KeyPointRef'

		octavesNum = 4
		blurSteps = 5

		# Calculate octaves
		octaves = []
		for octave in [1..octavesNum]
			octaves.push 2 if octave==1
			octaves.push 1/(octave-1) if octave!=1
		
		# Compose blurMatix
		blurBaseValue = 0.707

		# Gauss size for blurring
		gaussSize = 7

		# threshold for min max
		threshold = 0.03

		try
			# Start SIFT timer
			console.time times.SIFT

			# First Perform ScaleSpace + Blur
			ScaleSpace = []
			console.time times.ScaleSpace
			
			for scale in octaves
				ScaleSpaceRow = []
				for blurStep in [0..blurSteps-1]
					# get the image in BW and convert to float array
					img = MM.getImage imageObj, scale, true, 'Float32Array'
					if blurStep!=0
						blurImage = MM.blur img, blurBaseValue*blurStep, gaussSize
					else
						blurImage = img

					ScaleSpaceRow.push blurImage
				ScaleSpace.push ScaleSpaceRow
			
			time = console.timeEnd times.ScaleSpace
			
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
			# call handler if present
			if handlers.dog? then handlers.dog DoG, time



			# Find MaxMin
			console.time times.MaxMin
			MaxMin = []
			for octave,idx in DoG
				MaxMinRow = []
				for index in [1..octave.length-2]
					prev = octave[index-1]
					current = octave[index]
					next = octave[index+1]

					output = MM.maxmin prev, current, next, threshold

					MaxMinRow.push output
				MaxMin.push MaxMinRow

			time = console.timeEnd times.MaxMin
			# call handler if present
			if handlers.maxmin? then handlers.maxmin MaxMin, time




			# Refine keypoints
			console.time times.KeyPointRef
			for DoGRow,octave in DoG
				for image,blurStep in DoGRow
					# do asdad
			time = console.timeEnd times.KeyPointRef
			# call handler if present
			if handlers.refine? then handlers.refine Refine, time


		catch ex
			console.log ex
		finally
			console.timeEnd times.SIFT

		return

# Make globally available
window.MM = MM

# Create an instance
MM.VoloTest = new VoloCL '/opencl/volo.cl'