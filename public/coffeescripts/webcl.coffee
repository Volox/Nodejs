benchmark = true
benchmarkDebug = false


createInfo = (info) ->
	$info = $ '<div>',
		'class': 'alert alert-info'
		text: info
	return $info
createTitle = (title, subtitle) ->
	$divCont = $ '<div>',
		'class': 'page-header'
	
	$title = $ '<h1>',
		text: title+' '

	if subtitle?
		$subtitle = $ '<small>',
			text: subtitle
		$title.append $subtitle

	$divCont.append $title
	return $divCont

createThumbnail = (image, label, caption, ratio=1)->
	$thumbLi = $ '<li>',
		'class': "span#{parseInt 12/ratio}"
	$divCont = $ '<div>',
		'class': 'thumbnail'
	
	$captionCont = $ '<div>',
		'class': 'caption'
	$label = $ '<h5>',
		text: label
	if caption?
		$caption = $ '<p>',
			text: caption
	
	$captionCont.append $label
	if caption? then $captionCont.append $caption

	$divCont.append image
	$divCont.append $captionCont

	$thumbLi.append $divCont
	return $thumbLi

jQuery ($) ->
	$( '#dome' ).on 'click', '.page-header', ->
		$( @ ).next( 'ul.thumbnails' ).toggle()
		return
	$( '#clickme' ).click ->
		$dome = $ '#dome'
		$dome.empty()


		# get the image
		$img = $ '#img'

		sift = true
		if sift
			MM.sift $img[0],
				scale: ( ScaleSpace, time )->
					# Create dom elements
					$title = createTitle 'Scale space', "took #{time}ms"
					$contents = $ '<ul>',
						'class': 'thumbnails'

					# insert the images into the dome elements
					for row,octave in ScaleSpace
						for image,blurStep in row
							label = "octave #{octave+1}, blurStep #{blurStep+1}"
							canvas = MM.toImage image
							$thumbLi = createThumbnail canvas, label, null, index+1
							$contents.append $thumbLi

					# add the elements to the visible DOM
					$dome.append $title
					$dome.append $contents
					return
				dog: ( DoG, time )->
					# Create dom elements
					$title = createTitle 'DoG', "took #{time}ms"
					$contents = $ '<ul>',
						'class': 'thumbnails'

					# insert the images into the dome elements
					for DoGRow,octave in DoG
						for image,blurStep in DoGRow
							label = "DoG octave #{octave+1}, blurStep #{blurStep+1}-#{blurStep}"
							canvas = MM.toImage image
							$thumbLi = createThumbnail canvas, label, null, octave+1
							$contents.append $thumbLi

					# add the elements to the visible DOM
					$dome.append $title
					$dome.append $contents
					return
				maxmin: ( MaxMin, time )->
					$title = createTitle 'MaxMin', "took #{time}ms"
					$contents = $ '<ul>',
						'class': 'thumbnails'

					# insert the images into the dome elements
					for MaxMinRow,octave in MaxMin
						for image,blurStep in MaxMinRow
							label = "MaxMin of octave #{octave+1} using DoG #{blurStep},#{blurStep+1} and #{blurStep+2}"
							canvas = MM.toImage image
							$thumbLi = createThumbnail canvas, label, null, octave+1
							$contents.append $thumbLi

					# add the elements to the visible DOM
					$dome.append $title
					$dome.append $contents
					return
				refine: ( Refine, time )->
					$title = createTitle 'KeyPoints refinement', "took #{time}ms"
					$contents = $ '<ul>',
						'class': 'thumbnails'

					# insert the images into the dome elements
					for RefineRow,octave in Refine
						for image,blurStep in RefineRow
							label = "Refinement"
							canvas = MM.toImage image
							$thumbLi = createThumbnail canvas, label, null, octave+1
							$contents.append $thumbLi

					# add the elements to the visible DOM
					$dome.append $title
					$dome.append $contents
					return
			return





























		# OLD method

		try
			if benchmark then console.time "SIFT"
			# Build scale space
			octaves = [2,1,1/2,1/3]
			blurSteps = 5
			blurMatrix = [
				[ 0.707, 1, 1.414, 2 , 2.828 ],
				[ 1.414, 2, 2.828, 4 , 5.656 ],
				[ 2.828, 4, 5.656, 8 , 11.313 ],
				[ 5.656, 8, 11.313, 16 , 22.627 ]
			]


			# Scale Space
			tScaleSpace = "Scale space"
			if benchmark then console.time tScaleSpace

			$scaleSpace = $ '<ul>',
				'class': 'thumbnails'
			$scaleSpaceTitle = createTitle 'Scale space', '4 octaves and 5 blur blur steps'

			scaleSpace = []
			for octave, index in octaves
				octaveRow = []
				for blurStep in [0..blurSteps-1]
					blurFactor = blurMatrix[ index ][ blurStep ]

					timeID = "Octave #{index+1} Blur #{blurStep+1}"
					if benchmark and benchmarkDebug then console.time timeID
					
					# Blur the image
					blurCanvas = MM.blur $img[0], octave, blurFactor


					if benchmark and benchmarkDebug then console.timeEnd timeID
					blurCanvas.id = "scale_#{octave}_#{blurStep}"
					
					octaveRow.push blurCanvas

					# DOM operations
					label = "Octave #{index+1}, blur step #{blurStep+1}"
					caption = "Scale factor: #{octave}, blurFactor: #{blurFactor}"
					$thumbLi = createThumbnail blurCanvas, label, caption, index+1

					$scaleSpace.append $thumbLi

				scaleSpace.push octaveRow
			if benchmark then timeTook = console.timeEnd tScaleSpace

			info = "Scale Space took #{timeTook}ms"
			$scaleSpaceInfo = createInfo info
			$dome.append $scaleSpaceTitle
			$dome.append $scaleSpace
			$dome.append $scaleSpaceInfo



			# Compute DoG
			tDoG = "DoG"
			if benchmark then console.time tDoG

			$DoG = $ '<ul>',
				'class': 'thumbnails'
			$DoGTitle = createTitle 'DoG', 'Difference of Gaussian'

			DoG = []
			for octave,idx in scaleSpace
				DoGRow = []
				for index in [1..octave.length-1]

					timeID = "Difference from #{index-1} to #{index}"
					if benchmark and benchmarkDebug then console.time timeID
					DoGcanvas = MM.diff octave[ index-1 ], octave[ index ]
					if benchmark and benchmarkDebug then console.timeEnd timeID

					DoGRow.push DoGcanvas

					# DOM operations
					label = timeID
					$thumbLi = createThumbnail DoGcanvas, label, null, idx+1

					$DoG.append $thumbLi

				DoG.push DoGRow
			if benchmark then timeTook = console.timeEnd tDoG
			
			info = "DoG took #{timeTook}ms"
			$DoGInfo = createInfo info
			$dome.append $DoGTitle
			$dome.append $DoG
			$dome.append $DoGInfo




			# Find maxmin
			tMaxMin = 'MaxMin'
			if benchmark then console.time tMaxMin

			$MaxMin = $ '<ul>',
				'class': 'thumbnails'
			$MaxMinTitle = createTitle 'Find MaxMin'

			for octave,idx in DoG
				for index in [1..octave.length-2]
					prev = octave[index-1]
					current = octave[index]
					next = octave[index+1]

					keyPoints = MM.maxmin prev, current, next, 0
					
					$MaxMin.append keyPoints
					# DOM operations
					label = "Current index: #{index}"
					$thumbLi = createThumbnail keyPoints, label, null, idx+1

					$MaxMin.append $thumbLi

			if benchmark then timeTook = console.timeEnd tMaxMin

			info = "MaxMin took #{timeTook}ms"
			$MaxMinInfo = createInfo info
			$dome.append $MaxMinTitle
			$dome.append $MaxMin
			$dome.append $MaxMinInfo

		catch error
			console.log error
		finally
			if benchmark then timeTook = console.timeEnd "SIFT"

			info = "SIFT total time #{timeTook}ms"
			$info = createInfo info
			$dome.append $info


		return
	return