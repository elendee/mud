const WebSocket = require('ws')

const env = require('./server/.env.js')


let wss = false

function getInstance(){

	if( wss ) return wss

	wss = new WebSocket.Server({
		clientTracking: false,
		noServer: true
	})

	// wss = new WebSocket.Server({

	// 	port: env.PORT + 1

	// })

	wss.user_data = { // use this instead of passing WebSocket everywhere Server is required

		OPEN: WebSocket.OPEN
		
	}

	return wss

}

module.exports = getInstance