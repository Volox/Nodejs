class Sample extends uTask
	init: =>
		@categories = []
		@maxNum = 1
		$( 'body' ).append $ '<form>',
			id: 'myForm'
		@getConfiguration 'maxNum', ( error, data )=>
			if !error
				@maxNum = parseInt data[0]
				@getConfiguration 'category', @getCategories
			else
				alert "Unable to get the configuration!\n#{error}"
		return
	
	createCategories: ()=>
		$element = $ '<select>',
			name: 'categories',
			size: if @maxNum==1 then 1 else 3,
			multiple: if @maxNum!=1 then true else false

		for category in @categories
			$option = $ '<option>',
				text: category,
				value: category
			$element.append $option

		return $element

	getTweets: ( error, json) =>
		if !error
			data = json.field[ 'text' ]
			$( 'body' ).append $ '<ul>',
				id: 'tweetList'

			$ul = $ '#tweetList'
			for tweet,index in data
				$li = $ '<li>'
				$li.attr 'data-object-id', json.id[ index ]
				$li.append @createCategories()
				$li.append $ '<span>',
					text: tweet
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

			@getData 'text', @getTweets
		else
			alert 'No categories specified'
		return

	createOuput: =>
		@storeData 'id', parseInt @task
		@storeData 'token', ''
		@storeData 'userId', ''
		answers = []
		$ul = $ '#tweetList'
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
			else
				alert "Unable to post results\n#{error}"
		return

# Entry point configurable
$ ->
	sample = new Sample