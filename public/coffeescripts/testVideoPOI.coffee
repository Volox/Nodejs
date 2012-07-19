$ ->
	$video = $ '#video'
	$poi = $ '#poi'

	threshdold = 3
	timeStart = 0

	resetStartTime = ->
		timeStart = this.currentTime
		return

	timePassed = ->
		duration = @currentTime-timeStart
		if duration>threshdold
			dateDuration = new Date 0
			dateDuration.setSeconds duration
			dateStart = new Date 0
			dateStart.setSeconds timeStart

			$li = $ '<li>',
				text: "POI @ #{dateStart.getMinutes()}:#{dateStart.getSeconds()} for #{dateDuration.getMinutes()}:#{dateDuration.getSeconds()}"
			$poi.append $li

		resetStartTime()
		return
		
	$video.on 'seeked', resetStartTime

	$video.on 'pause', timePassed
