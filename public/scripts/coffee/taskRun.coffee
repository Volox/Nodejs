# instead of document ready to ensure image loading
$( window ).load () ->
	$images = $ '#images'
	$origImg = $ '#img'
	
	#$images.append $canvas
	red = numeric.fromImage 'img'

	d = 9
	sigma = 1
	test = numeric.gauss d, d, sigma


	#test = numeric.mul test, 200000000
	#console.log numeric.prettyPrint test
	
	conv = numeric.conv red, test

	$images.append numeric.toImage conv

	edgeV = [	[	1,	0,	-1],
				[	1,	0,	-1],
				[	1,	0,	-1]]

	edgeH = [	[	1,	1,	1],
				[	0,	0,	0],
				[	-1,	-1,	-1]]

	laplace = [	[	0.5,	1,	0.5],
				[	1,	-6,	1],
				[	0.5,	1,	0.5]]

	# Compute DoG
	octaves = 4
	blurSteps = 5

	###
	arr = [1,2,3,4,6,2,23,6]
	console.log arr
	numeric.fft arr
	console.log arr
	###


	###
	ScaleSpace = []
	sigmas = numeric.linspace 1, d/2, blurSteps
	for octave in [1..octaves]
		octaveArray = []
		image = numeric.fromImage 'img', 1/octave
		for blurStep in [1..blurSteps]
			blurFilter = numeric.gauss d, d, sigmas[blurStep-1]
			filteredImage = numeric.conv image, blurFilter
			octaveArray.push filteredImage
			#$images.append numeric.toImage filteredImage
		ScaleSpace.push octaveArray

	DoG = []
	for octave in ScaleSpace
		octaveArray = []
		for blurStep in [0..blurSteps-2]	
			image = numeric.sub octave[blurStep], octave[blurStep+1]
			octaveArray.push image
			$images.append numeric.toImage image
		DoG.push octaveArray
	###
	return
