class MM
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
		
		# Load the kernel
		VoloTest = new VoloCL

		# Gaussaian 2d kernel
		gaussSize = 7
		filter = MM.gauss2d gaussSize, sigma

		# Buffer sizes
		filterSize = filter.length*filter.BYTES_PER_ELEMENT
		imageSize = imageData.data.data.length*imageData.data.data.BYTES_PER_ELEMENT

		VoloTest.addInput 'source', imageSize, imageData.data.data
		VoloTest.addInput 'filter', filterSize, filter
		VoloTest.addOutput 'destination', imageSize, outData.data.data
		VoloTest.addArgument 'width', w, 'UINT'
		VoloTest.addArgument 'height', h, 'UINT'
		VoloTest.addArgument 'filterWidth', gaussSize, 'UINT'
		VoloTest.addArgument 'filterHeight', gaussSize, 'UINT'

		VoloTest.loadKernel '#clVolo', 'clConvolution'

		VoloTest.setLocalWS [16,4]

		VoloTest.setGlobalWS [ Math.ceil(w/16)*16, Math.ceil(h/4)*4 ]

		VoloTest.runKernel()

		outData.context.putImageData outData.data, 0, 0
		return outData.canvas
		
	@diff: (src1,src2)->
		imageData1 = MM.getImage src1
		imageData2 = MM.getImage src2
		w = imageData1.data.width
		h = imageData1.data.height

		# Create the output image
		outData = MM.createImage w, h
		
		# Load the kernel
		VoloTest = new VoloCL

		# Buffer sizes
		imageSize = imageData1.data.data.length*imageData1.data.data.BYTES_PER_ELEMENT

		VoloTest.addInput 'source1', imageSize, imageData1.data.data
		VoloTest.addInput 'source2', imageSize, imageData2.data.data
		VoloTest.addOutput 'destination', imageSize, outData.data.data
		VoloTest.addArgument 'width', w, 'UINT'
		VoloTest.addArgument 'height', h, 'UINT'

		VoloTest.loadKernel '#clVolo', 'clDiff'

		VoloTest.setLocalWS [16,4]

		VoloTest.setGlobalWS [ w, h ]

		VoloTest.runKernel()

		outData.context.putImageData outData.data, 0, 0
		return outData.canvas

	@maxmin: (images)->
		imageData = MM.getImage images[0]
		w = imageData.data.width
		h = imageData.data.height

		# Create the output image
		outData = MM.createImage w, h
		
		# Load the kernel
		VoloTest = new VoloCL

		# Buffer sizes
		imageSize = imageData.data.data.length*imageData.data.data.BYTES_PER_ELEMENT*images*3

		VoloTest.addInput 'images', imageSize, imageData1.data.data
		VoloTest.addOutput 'destination', imageSize, outData.data.data
		VoloTest.addArgument 'width', w, 'UINT'
		VoloTest.addArgument 'height', h, 'UINT'

		VoloTest.loadKernel '#clVolo', 'clMaxMin'

		VoloTest.setLocalWS [16,4]

		VoloTest.setGlobalWS [ w, h ]

		VoloTest.runKernel()

		outData.context.putImageData outData.data, 0, 0
		return outData.canvas
		return
# Make global available
window.MM = MM