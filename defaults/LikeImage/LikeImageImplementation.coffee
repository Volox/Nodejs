class Like extends uTask
	init: =>
		console.log 'Like init'

		@getData 'googleUrl', @getImages

		$sendBtn = $ '#sendBtn'
		$sendBtn.click @run

		@getDetails @getQuestion

	like: ( evt )=>
		$button = $ evt.target

		objectId = $button.data 'objectId'
		liked = @toggleData "like_#{objectId}"

		if liked
			$button.html '<i class="icon-thumbs-down"></i> Unlike'
		else
			$button.html '<i class="icon-thumbs-up"></i> Like'


	getQuestion: ( error, data )=>
		if !error
			$question = $ '#question'
			$question.text data.question

	createImage: ( url, id )=>
		$html = $ '<li class="span4"><div class="thumbnail"><p class="center">' +
			'<button type="button" class="btn"><i class="icon-thumbs-up"></i> Like</button>'+
			'</p></div></li>';
		
		$images = $ '#imageList'
		$images.append $html
		$img = $ '<img>',
			src: url,
			height: 200
		$img.attr 'data-object-id', id

		$html.find( '.thumbnail' ).prepend $img
		$html.find( 'button' ).attr( 'data-object-id', id ).click @like


	getImages: ( error, data )=>

		self = @
		if !error
			for objectId, index in data.id
				image = data[ 'googleUrl' ][ index ]

				self.createImage image, objectId








	createAnswer: =>
		answers = []
		answerObj = 
			id: @task
			token: '4dogghraplkmfvovdk2qginbnv',
			userId: '',
			answers: answers

		for key of @outputData
			answers.push 
				objectId: parseInt( key.replace 'like_', '' )

		@outputData = answerObj

	run: ( evt )=>
		console.log 'Run!'

		@createAnswer()

		@postData ( error, data )=>
			if !error
				alert 'Data sent successfully'
				$( evt.target ).prop 'disabled', true
			else
				console.error error, data

# Entry point configurable
$ ->
	LI = new Like