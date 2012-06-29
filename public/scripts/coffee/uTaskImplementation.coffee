class Sample extends uTask
	init: ->
		$( '#btnRun' ).remove()
		@getConfiguration 'categories', ( error, json) =>
			categories = json

			name = 'text'
			$select = $ '<select>'
			for category in categories
				$option = $ '<option>',
					text: category,
					value: category
				$select.append $option

			@getData name, ( error, json) =>
				if !error
					data = json[ name ]
					$( 'body' ).append $ '<ul>',
						id: 'tweetList'

					$ul = $ '#tweetList'
					for tweet in data
						$li = $ '<li>'
						$li.append $select.clone()
						$li.append $ '<span>',
							text: tweet.value
						$ul.append $li
				else
					alert 'FUUUUUUU'

				$( 'body' ).append $ '<button>',
					text: 'Send results',
					click: @run
				return

			return

	run: ->
		console.log 'Run!'
		@send()

# Entry point configurable
$ ->
	$( '#btnRun' ).click ->
		new Sample