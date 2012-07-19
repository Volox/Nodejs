class ClassifyImage extends uTask
	init: =>
		@categories = []
		@maxNum = 1
		$( 'body' ).append $ '<form>',
			id: 'myForm'
		@getConfiguration 'category', @getCategories
		return
	
	createCategories: ()=>
		$element = $ '<select>',
			name: 'categories',
			size: if @maxNum==1 then 1 else 3,
			multiple :if @maxNum!=1 then true else false

		for category in @categories
			$option = $ '<option>',
				text: category,
				value: category
			$element.append $option

		return $element

	getImages: ( error, json) =>
		if !error
			data = json.field[ 'caption' ]
			$( 'body' ).append $ '<ul>',
				id: 'imageList'

			$ul = $ '#imageList'
			for image,index in data
				$li = $ '<li>'
				$li.attr 'data-object-id', json.id[ index ]
				$li.append $ '<img>',
					src: image
					width: 100
					height: 100
					title: json.field[ 'image' ][ index ]
				
				$li.append @createCategories()
				
				$ul.append $li
		else
			alert 'No data retrieved!'

		@$runBtn = $ '<button>',
			text: 'Send results',
			click: @run

		$( 'body' ).append @$runBtn
		return


	getCategories: ( error, json) =>
		if !error
			@categories = json

			@getData '*', @getImages
		else
			alert 'No categories specified'
		return

	createOuput: =>
		@storeData 'id', parseInt @task
		@storeData 'token', ''
		@storeData 'userId', ''
		answers = []
		$ul = $ '#imageList'
		$( 'li', $ul ).each ->
			$li = $ @
			answerObj = {}
			answerObj[ 'objectId' ] = parseInt $li.data 'objectId'
			categories = []
			$( 'select option:selected', $li ).each ->
				categories.push $( @ ).val()
			answerObj[ 'categories' ] = categories
			answers.push( answerObj );
			return
		@storeData 'answers', answers

		return
	run: =>
		console.log 'Run!'
	
		@createOuput()
		
		@postData ( error, data )=>
			if !error
				@$runBtn.prop 'disabled', true
				alert 'Data sent successfully'
			else
				alert "Unable to post results\n#{error}"
		return

# Entry point configurable
$ ->
	CI = new ClassifyImage