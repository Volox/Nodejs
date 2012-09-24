$ ->
	# dom
	$msg = $ '.alert.alert-info span'
	$canvas = $ '#canvas'
	# layers
	imageLayer = new Kinetic.Layer
	faceLayer = new Kinetic.Layer
	userLayer = new Kinetic.Layer
	# misc data
	RIGHT_MOUSE_BTN = 3
	LEFT_MOUSE_BTN = 1
	facesDetected = {}
	facesSkipped = []
	facesUser = {}
	avgFace = 
		w: 0
		h: 0
	NUM_FACES = 7;

	imgNum = Math.ceil Math.random()*NUM_FACES
	imgPath = "/img/faces/faces (#{imgNum}).jpg"

	# creiamo l'immagine vera e propria
	createImage = (imageUrl)->
		img  = new Image
		img.onload = ->
			console.log 'Image loaded!'
			console.log 'Detecting faces'
			detectFaces img
		img.src = imageUrl
		console.log "Loading image: #{imageUrl}"

	drawBoundingBox = (face)->
		rect = new Kinetic.Rect
			x: face.x
			y: face.y
			width: face.width
			height: face.height
			stroke: 'red'
		return rect

	detectFaces = ( img )->
		$('#canvas').empty()

		stage = new Kinetic.Stage
			container: "canvas"
			width: img.width
			height: img.height+30


		# Add the image
		image = new Kinetic.Image
			image: img
		imageLayer.add image

		# Add to the DOM
		stage.add imageLayer
		stage.add faceLayer
		stage.add userLayer


		# use the face detection library to find the face
		comp = ccv.detect_objects
			canvas: ccv.pre imageLayer.getCanvas()
			cascade: cascade
			min_neighbors: 1
			interval: 5

		console.log "#{comp.length} faces detected"
		$msg.text " #{comp.length} faces detected"
		# For each face draw the red rectangle
		for face in comp
			assign = (id, obj)->
				facesDetected[ id ] = obj
			avgFace.w += face.width
			avgFace.h += face.height
			bb = drawBoundingBox face
			bb.on 'click', (evt)->
				if evt.which==RIGHT_MOUSE_BTN
					console.log facesDetected
					console.log bb
					faceLayer.remove bb
					delete facesDetected[ bb._id ]
					faceLayer.draw()
			faceLayer.add bb
			assign bb._id, bb

		avgFace.w /= comp.length
		avgFace.h /= comp.length
		faceLayer.draw()


		# no context menu
		$canvas.on 'contextmenu', ( evt )->
			return false
		# Bind the click on the stage to create new user faces
		stage.on 'click', ( evt )->
			if evt.which==LEFT_MOUSE_BTN
				# Create shape
				$container = $ stage.getContainer()
				offset = $container.offset()
				userRect = new Kinetic.Rect
					x: evt.pageX-offset.left-25
					y: evt.pageY-offset.top-25
					width: avgFace.w
					height: avgFace.h
					stroke: 'blue'
				userRect.on 'click', (evt)->
					if evt.which==RIGHT_MOUSE_BTN
						console.log facesUser
						console.log userRect
						userLayer.remove userRect
						delete facesUser[ userRect._id ]
						userLayer.draw()
				facesUser[userRect._id] = userRect
				userLayer.add userRect
				userLayer.draw()

			return
		return



	createImage imgPath