# Test project for Nodejs

## Requirements
* [mongodb](http://www.mongodb.org/) 2.0.x

## Installation
	git clone git@github.com:Volox/Nodejs.git
	cd Nodejs
	mkdir logs
	mkdir data
	npm install -d

## To run
	cd *Nodejs folder*
	mongod -f config/mongo-node.conf &
	node server.js