class MM
	@VoloTest: null
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

	@getImage: ( image, scale=1 )->
		w = parseInt image.width*scale
		h = parseInt image.height*scale

		canvas = document.createElement 'canvas'
		canvas.width = w
		canvas.height = h

		canvasCtx = canvas.getContext "2d"
		canvasCtx.drawImage image, 0, 0, w, h
		imageData = canvasCtx.getImageData 0, 0, w, h
		return canvas: canvas, context: canvasCtx, data: imageData

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

	@blur: (image, scale=1,sigma=1) ->
		# Copy the image into a canvas
		imageData = MM.getImage image, scale
		w = imageData.data.width
		h = imageData.data.height
		# Create the output image 
		outData = MM.createImage w, h
		
		# Gaussaian 2d kernel
		gaussSize = 7
		filter = MM.gauss2d gaussSize, sigma

		kernelArgs = new KernelArguments MM.VoloTest
		kernelArgs.addInput 'source', imageData
		kernelArgs.addInput 'filter', filter
		kernelArgs.addOutput 'destination', outData
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h
		kernelArgs.addArgument 'filterWidth', gaussSize
		kernelArgs.addArgument 'filterHeight', gaussSize

		MM.VoloTest.runKernel 'clConvolution', [ w, h ], kernelArgs

		outData.context.putImageData outData.data, 0, 0

		return outData.canvas
		
	@diff: (src1,src2)->
		imageData1 = MM.getImage src1
		imageData2 = MM.getImage src2
		w = imageData1.data.width
		h = imageData1.data.height

		# Create the output image
		outData = MM.createImage w, h
		
		# Create the parameter object
		kernelArgs = new KernelArguments MM.VoloTest
		kernelArgs.addInput 'source1', imageData1
		kernelArgs.addInput 'source2', imageData2
		kernelArgs.addOutput 'destination', outData
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h

		MM.VoloTest.runKernel 'clDiff', [ w, h ], kernelArgs

		outData.context.putImageData outData.data, 0, 0

		return outData.canvas

	@maxmin: (prev, current, next, threshold)->
		prevImage = MM.getImage prev
		image = MM.getImage current
		nextImage = MM.getImage next
		w = image.data.width
		h = image.data.height

		# Create the output image
		keyPoints = MM.createImage w, h

		# Create the parameter object
		kernelArgs = new KernelArguments MM.VoloTest
		kernelArgs.addInput 'prev', prevImage
		kernelArgs.addInput 'current', image
		kernelArgs.addInput 'next', nextImage
		kernelArgs.addOutput 'keyPoints', keyPoints
		kernelArgs.addArgument 'threshold', threshold, 'UCHAR'
		kernelArgs.addArgument 'width', w
		kernelArgs.addArgument 'height', h

		MM.VoloTest.runKernel 'clMaxMin', [ w, h ], kernelArgs

		keyPoints.context.putImageData keyPoints.data, 0, 0
		return keyPoints.canvas
	@sift: ( imageObj )->
		image = MM.getImage imageObj

		return image
MM.VoloTest = new VoloCL '/scripts/opencl/volo.cl'
# Make global available
window.MM = MM