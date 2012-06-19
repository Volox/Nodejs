$ ->
	$video = $ '#video'
	$timestamps = $ '#timestamps'
	$tags = $ '#tags li'

	$tags.click ->
		tag = $( @ ).text()
		time = $video[0].currentTime
		percTime = parseInt time/$video[0].duration*100

		id = "time_#{percTime}"
		$li = $ "##{id}"
		if $li.length==0
			$li = $ '<li>',
				id: "time_#{percTime}"
			$li.css 'left', "#{percTime}%"
			$li.append '<div></div>'
			$timestamps.append $li

		tagId = "#{id}_tag_#{tag}"
		$tag = $ "##{tagId}", $li
		if $tag.length==0
			$tag = $ '<span>',
				text: "#{tag}",
				id: tagId
			$( 'div', $li ).append $tag

		return

	$video.mouseenter ->
		@play()
		return

	$video.mouseleave ->
		@pause()
		return