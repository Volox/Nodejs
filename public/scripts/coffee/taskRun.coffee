

$( window ).load () ->
	$images = $ '#images'
	$origImg = $ '#img'

	#$images.append $canvas
	#red = numeric.fromImage 'img', 0.5

	d = 9
	sigma = 1
	#test = numeric.gauss d, d, sigma
	#test = numeric.mul test, 200000000
	#console.log numeric.prettyPrint test
	
	#conv = numeric.conv red, test
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
	blurSteps = 5;

	ScaleSpace = []
	sigmas = numeric.linspace(1,d/2,blurSteps);
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
	$images.append numeric.toImage numeric.conv red, edgeV
	$images.append numeric.toImage numeric.conv red, edgeH
	$images.append numeric.toImage numeric.conv red, laplace
	###
	return
