class Sample extends uTask
	init: ->
		console.log 'Init!'

		@getData 'image', 1

		# 
	run: ->
		console.log 'Run!'

		results = []
		@sendStatus 'running'

		for perc in [0..100]
			results.push perc
			@sendStatus "processing #{perc}%"

		@setData 'results', results

		@send()

# Entry point configurable
$ ->
	new Sample