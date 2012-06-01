class MM
	@gauss2d: (size, sigma = 1) ->
		result = new Float32Array size*size

		cY = parseInt size/2
		cX = parseInt size/2

		for x in [0..size]
			for y in [0..size]
				index = y*size+x

				rX = x-cX
				rY = y-cY

				#front = 1/(2*Math.PI*sigma*sigma)
				front = 1
				exp = -1*(rX*rX+rY*rY)/(2*sigma*sigma)
				result[ index ] = front*Math.exp exp
		return result


# Make global available
window.MM = MM