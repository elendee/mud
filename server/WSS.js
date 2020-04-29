const WebSocket = require('ws')

const env = require('./.env.js')


let wss = false

module.exports = (function(){

	if( wss ) return wss

	wss = new WebSocket.Server({
		clientTracking: false,
		noServer: true
	// 	port: env.PORT + 1
	})

	wss.user_data = { // use this instead of passing WebSocket everywhere Server is required
		OPEN: WebSocket.OPEN
	}

	return wss

})()
