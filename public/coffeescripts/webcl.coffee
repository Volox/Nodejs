jQuery ($) ->
	$( '#clickme' ).click ->
		$dome = $ '#dome'
		$dome.empty()


		# get the image
		$img = $ '#img'
		try
			console.time "SIFT"
			# Build scale space
			octaves = [2,1,1/2,1/3]
			blurSteps = 5
			blurMatrix = [
				[ 0.707, 1, 1.414, 2 , 2.828 ],
				[ 1.414, 2, 2.828, 4 , 5.656 ],
				[ 2.828, 4, 5.656, 8 , 11.313 ],
				[ 5.656, 8, 11.313, 16 , 22.627 ]
			]

			tScaleSpace = "Scale space"
			console.time tScaleSpace
			scaleSpace = []
			for octave, index in octaves
				octaveRow = []
				for blurStep in [0..blurSteps-1]
					blurFactor = blurMatrix[ index ][ blurStep ]

					timeID = "Octave #{index+1} Blur #{blurStep+1}"
					#console.time timeID
					blurCanvas = MM.blur $img[0], octave, blurFactor
					#console.timeEnd timeID
					blurCanvas.id = "scale_#{octave}_#{blurStep}"
					
					octaveRow.push blurCanvas
					#$dome.append blurCanvas

				scaleSpace.push octaveRow
			console.timeEnd tScaleSpace
			
			# Compute DoG
			tDoG = "DoG"
			console.time tDoG
			DoG = []
			for octave in scaleSpace
				DoGRow = []
				for index in [1..octave.length-1]

					timeID = "Difference from #{index-1} to #{index}"
					#console.time timeID
					DoGcanvas = MM.diff octave[ index-1 ], octave[ index ]
					#console.timeEnd timeID

					DoGRow.push DoGcanvas
					#$dome.append DoGcanvas

				DoG.push DoGRow
				console.timeEnd tDoG

			# Find maxmin
			tMaxMin = 'MaxMin'
			console.time tMaxMin
			for octave in DoG
				for index in [1..octave.length-2]
					prev = octave[index-1]
					current = octave[index]
					next = octave[index+1]

					keyPoints = MM.maxmin prev, current, next, 0
					$dome.append keyPoints

			console.timeEnd tMaxMin

		catch error
			console.log error
		finally
			console.timeEnd "SIFT"


		return