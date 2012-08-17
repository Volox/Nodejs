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
	myImage = new Image()
	myImage.onload = () ->
		$canvas = $ '#img'
		canvas = $canvas[ 0 ]
		ctx = canvas.getContext '2d'
		ctx.drawImage @, 0, 0

		return
	myImage.src = '/img/scene.jpg'

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
			myScaleSpace = null
			MM.sift $img[0],
				scale: ( ScaleSpace, time )->
					myScaleSpace = ScaleSpace
					# Create dom elements
					$title = createTitle 'Scale space', "took #{time}ms"
					$contents = $ '<ul>',
						'class': 'thumbnails'

					# insert the images into the dome elements
					###
					for row,octave in ScaleSpace
						for image,blurStep in row
							label = "octave #{octave+1}, blurStep #{blurStep+1}"
							canvas = MM.toImage image
							$thumbLi = createThumbnail canvas, label, null, octave+1
							$contents.append $thumbLi
					###

					# add the elements to the visible DOM
					$dome.append $title
					$dome.append $contents
					return
				dog: ( DoG, time )->
					# Create dom elements
					$title = createTitle 'DoG', "took #{time}ms"
					$contents = $ '<ul>',
						'class': 'thumbnails'

					###
					# insert the images into the dome elements
					for DoGRow,octave in DoG
						for image,blurStep in DoGRow
							label = "DoG octave #{octave+1}, blurStep #{blurStep+1}-#{blurStep}"
							canvas = MM.toImage image
							$thumbLi = createThumbnail canvas, label, null, octave+1
							$contents.append $thumbLi
					###

					# add the elements to the visible DOM
					$dome.append $title
					$dome.append $contents
					return
				maxmin: ( MaxMin, time )->
					$title = createTitle 'MaxMin', "took #{time}ms"
					$contents = $ '<ul>',
						'class': 'thumbnails'

					###
					# insert the images into the dome elements
					for MaxMinRow,octave in MaxMin
						for image,blurStep in MaxMinRow
							label = "MaxMin of octave #{octave+1} using DoG #{blurStep},#{blurStep+1} and #{blurStep+2}"
							canvas = MM.toImage image
							$thumbLi = createThumbnail canvas, label, null, octave+1
							$contents.append $thumbLi
					###

					# add the elements to the visible DOM
					$dome.append $title
					$dome.append $contents
					return
				refine: ( Refine, time )->
					$title = createTitle 'KeyPoints refinement', "took #{time}ms"
					$contents = $ '<ul>',
						'class': 'thumbnails'


					###
					# insert the images into the dome elements
					for RefineRow,octave in Refine
						for image,blurStep in RefineRow
							label = "Refinement"
							canvas = MM.toImage image
							$thumbLi = createThumbnail canvas, label, null, octave+1
							$contents.append $thumbLi
					###

					# add the elements to the visible DOM
					$dome.append $title
					$dome.append $contents
					return
				magor: ( MagOr, time )->
					$title = createTitle 'Magnitude and Orientation', "took #{time}ms"
					$contents = $ '<ul>',
						'class': 'thumbnails'

					canvas_arrow = (context, fromx, fromy, orient, mag) ->
						headlen = 5
						angle = orient
						tox = fromx+mag*Math.cos orient
						toy = fromy+mag*Math.sin orient

						context.beginPath()
						# Line
						context.moveTo fromx, fromy
						context.lineTo tox, toy

						# Arrow
						context.lineTo tox-headlen*Math.cos(angle-Math.PI/6), toy-headlen*Math.sin(angle-Math.PI/6)
						context.moveTo tox, toy
						context.lineTo tox-headlen*Math.cos(angle+Math.PI/6), toy-headlen*Math.sin(angle+Math.PI/6)

						context.closePath()
						context.stroke()
						return

					# insert the images into the dome elements
					for MagOrRow,octave in MagOr
						for data,blurStep in MagOrRow
							label = "Magnitude"
							imgMag = new MMImage data.magnitude
							imgOr = new MMImage data.orientation
							image = myScaleSpace[octave][0]
							canvas = MM.toImage image

							diag = Math.sqrt( Math.pow(imgMag.width,2) + Math.pow(imgMag.height,2) );
							ctx = canvas.getContext '2d'
							ctx.strokeStyle = 'red'

							for x in [0..imgMag.width-1]
								for y in [0..imgMag.height-1]
									mag = imgMag.at x, y
									if 0!=mag
										orient = imgOr.at x, y
										canvas_arrow ctx, x, y, orient, mag*0.5

							$thumbLi = createThumbnail canvas, label, null, octave+1
							$contents.append $thumbLi

					# add the elements to the visible DOM
					$dome.append $title
					$dome.append $contents
					return
			return

	return