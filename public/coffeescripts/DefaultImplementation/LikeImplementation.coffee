class Like extends uTask
	init: =>
		console.log 'Like init'

		@getData 'image', @getImages

		$body = $ 'body'
		$postButton = $ '<button>',
			text: 'Post results',
			click: @run
		
		$body.append $postButton

		return

	like: ( evt )=>
		$button = $ evt.target

		objectId = $button.closest( 'div' ).data 'objectId'
		liked = @toggleData "like_#{objectId}"

		if liked
			$button.text 'Unlike'
		else
			$button.text 'Like'
		return

	getImages: ( error, data )=>
		if( !error )
			$body = $ 'body'
			for objectId, index in data.id
				image = data.field[ 'image' ][ index ]

				$container = $ '<div>'
				$container.attr 'data-object-id', objectId
				
				$image = $ '<img>',
					src: image
				$like = $ '<button>',
					text: 'Like',
					click: @like

				$container.append $image
				$container.append $like

				$body.append $container
		return

	createAnswer: =>
		answers = []
		answerObj = 
			id: @task
			token: '',
			userId: '',
			answers: answers

		for key of @outputData
			answers.push 
				objectId: parseInt( key.replace 'like_', '' )

		@outputData = answerObj

		return
	run: ( evt )=>
		console.log 'Run!'

		@createAnswer()

		@postData ( error, data )=>
			if !error
				alert 'Data sent successfully'
				$( evt.target ).prop 'disabled', true
			else
				alert data
			return
		return

# Entry point configurable
$ ->
	LI = new Like