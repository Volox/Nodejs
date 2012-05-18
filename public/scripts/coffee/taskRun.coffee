$( document ).ready () ->
	$img = $ '#img'

	octaves = 5
	blursteps = 4
	
	for octave in [1..octaves]
		for blur in [1..blursteps]
			img = $ '<img>',
				id: "img_#{octave}_#{blur}"
				src: $img.prop 'src'
				width: $img.prop( 'width' )/octave
				height: $img.prop( 'height' )/octave

			$( '.images' ).append img
			
			img.pixastic 'blurfast',
				amount: 0.25*blur

	###
	cx = $canvas.loadCanvas()

	width = $canvas.width()
	height = $canvas.height()
	$canvas.drawImage
		source: 'img/test.jpg'
		fromCenter: false
		width: width
		height: height
		load: ->
			$canvas.setPixels
				each: (px) ->
					px.r = px.b
					px.g = px.g
					px.b = px.r
	###
	return
