$ ->
	$dropzone = $ '.dropzone'
	$dropzone.on 'fileReady', ( evt, fileList, dataTransfer )->
		console.log 'Loading image..'

		# creiamo l'immagine vera e propria
		createImage = (imageUrl)->
			img  = new Image
			img.onload = ->
				console.log 'Image loaded!'
				console.log 'Detecting faces'
				detectFaces img
				console.log 'Face detected'
				return
			img.src = imageUrl

		# check the data type
		if fileList.length
			file = fileList[0]
			reader = new FileReader
			reader.onload = (evt)->
				imageUrl = evt.target.result
				createImage imageUrl
				return
			reader.readAsDataURL file

		else if dataTransfer
			imageUrl = dataTransfer.getData 'text/uri-list'
			createImage imageUrl


		return false
	return

detectFaces = ( img )->
	$('#canvas').empty()

	stage = new Kinetic.Stage
		container: "canvas"
		width: img.width
		height: img.height+30

	imageLayer = new Kinetic.Layer
	textLayer = new Kinetic.Layer
	faceLayer = new Kinetic.Layer
	userLayer = new Kinetic.Layer


	# Add the bottom text
	text = new Kinetic.Text
		text: 'Find the missing face/s (if any)'
		textFill: 'black'
		fontStyle: 'bold'
		y: img.height+5
		width: img.width
		align: 'center'
		fontSize: 20
		fontFamily: 'serif'

	textLayer.add text

	# Add the image
	image = new Kinetic.Image
		image: img
	imageLayer.add image

	# Add to the DOM
	stage.add imageLayer
	stage.add faceLayer
	stage.add userLayer
	stage.add textLayer


	# use the face detection library to find the face
	comp = ccv.detect_objects
		canvas: ccv.pre imageLayer.getCanvas()
		cascade: cascade
		min_neighbors: 1
		interval: 5

	# For each face draw the red rectangle
	avgFace = 
		w: 0
		h: 0
	for face in comp
		avgFace.w += face.width
		avgFace.h += face.height

		# disable to see all the detected faces
		#confidenceThreshold = Number.MIN_VALUE
		#if face.confidence<confidenceThreshold then continue
		
		text = new Kinetic.Text
			text: ""+Math.round( face.confidence*100 )/100
			x: face.x
			y: face.y+face.height/2
			textStrokeWidth: 1
			textStroke: 'black'
			textFill: 'white'
			height: 20
			width: face.width
			align: 'center'
			fontFamily: 'serif'
		textLayer.add text

		rect = new Kinetic.Rect
			x: face.x
			y: face.y
			width: face.width
			height: face.height
			stroke: 'red'
		faceLayer.add rect
	avgFace.w /= comp.length
	avgFace.h /= comp.length
	faceLayer.draw()
	textLayer.draw()


	# Bind the click on the stage to create new user faces
	userFaces = []
	stage.on 'click', ( evt )->
		# Create shape
		$container = $ stage.getContainer()
		offset = $container.offset()
		user = new Kinetic.Rect
			x: evt.pageX-offset.left-25
			y: evt.pageY-offset.top-25
			width: avgFace.w
			height: avgFace.h
			stroke: 'blue'
			strokeWidth: 1
			draggable: true


		# bind click event CTRL+click removes the shape
		user.on 'click', ( evt )->
			if evt.ctrlKey
				userLayer.remove user
				userFaces.splice user.position, 1
				userLayer.draw()
			evt.cancelBubble = true
			return

		user.position = userFaces.length
		userFaces.push user
		userLayer.add user
		userLayer.draw()

		return
	return