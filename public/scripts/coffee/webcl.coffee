jQuery ($) ->
	$( '#clickme' ).click ->
		$dome = $ '#dome'
		try


			# get the image
			$img = $ '#img'
			w = $img[0].width
			h = $img[0].height

			# Copy the image into the canvas
			canvas = document.createElement 'canvas'
			canvas.width = w
			canvas.height = h
			canvasCtx = canvas.getContext "2d"
			canvasCtx.drawImage $img[0], 0, 0

			imageData = canvasCtx.getImageData 0, 0, w, h

			canvasOut = document.createElement 'canvas'
			canvasOut.width = w
			canvasOut.height = h
			canvasOutCtx = canvasOut.getContext "2d"
			outData = canvasOutCtx.createImageData w, h



			# Load the kernel
			VoloTest = new VoloCL

			fW = fH = 7
			filter = MM.gauss2d fW

			# Buffer sizes
			filterSize = filter.length*filter.BYTES_PER_ELEMENT
			imageSize = imageData.data.length*imageData.data.BYTES_PER_ELEMENT

			fOut = new Float32Array w*h

			VoloTest.addInput 'source', imageSize, imageData.data
			VoloTest.addInput 'filter', filterSize, filter
			VoloTest.addOutput 'destination', imageSize, outData.data
			VoloTest.addOutput 'out', fOut.length*fOut.BYTES_PER_ELEMENT, fOut
			VoloTest.addArgument w, 'UINT'
			VoloTest.addArgument h, 'UINT'
			VoloTest.addArgument fW, 'UINT'
			VoloTest.addArgument fH, 'UINT'

			VoloTest.setLocalWS [16+4,4+4]
			VoloTest.setGlobalWS [	w, h ]
			VoloTest.loadKernel '#clVolo', 'clVolo'

			canvasOutCtx.putImageData outData, 0, 0

			# grayscale image
			$dome.append canvasOut
			return
		catch error
			console.log error

