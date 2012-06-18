$ ->
	$video = $ '#video'
	$timestamps = $ '#timestamps'
	$tags = $ '#tags li'

	$tags.click ->
		$li = $ '<li>',
			text: $( @ ).text() + " @ " + $video[0].currentTime
		$timestamps.append $li
		return

	$video.mouseenter ->
		@play()
		return

	$video.mouseleave ->
		@pause()
		return