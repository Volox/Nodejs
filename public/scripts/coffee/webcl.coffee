jQuery ($) ->
	$( '#clickme' ).click ->
		$dome = $ '#dome'
		$dome.empty()


		# get the image
		$img = $ '#img'
		try

			# Build scale space
			octaves = [2,1,1/2,1/3]
			blurSteps = 5
			blurMatrix = [
				[ 0.707, 1, 1.414, 2 , 2.828 ],
				[ 1.414, 2, 2.828, 4 , 5.656 ],
				[ 2.828, 4, 5.656, 8 , 11.313 ],
				[ 5.656, 8, 11.313, 16 , 22.627 ]
			]
			scaleSpace = []
			for octave, index in octaves
				octaveRow = []
				for blurStep in [0..blurSteps-1]
					blurFactor = blurMatrix[ index ][ blurStep ]

					#console.log "Performing octave #{index} blur #{blurStep}, scale: #{octave}, blurFactor: #{blurFactor}"
					
					blurCanvas = MM.blur $img[0], octave, blurFactor
					blurCanvas.id = "scale_#{octave}_#{blurStep}"
					
					octaveRow.push blurCanvas
					#$dome.append blurCanvas

				scaleSpace.push octaveRow
			
			# Compute DoG
			DoG = []
			for octave in scaleSpace
				DoGRow = []
				for index in [1..octave.length-1]
					DoGcanvas = MM.diff octave[ index-1 ], octave[ index ]
					DoGRow.push DoGcanvas
					$dome.append DoGcanvas
				DoG.push DoGRow

			# Find maxmin
			for octave in scaleSpace
				MM.maxmin octave
		catch error
			console.log error
		return