import env from '../../env.js'

const binds = {

	global: {

		close: 27,

		chat: 13

	},

	chat: {

		send: 13

	},

	world: {

		move: {
			forward: 87,
			back: 83,
			left: 65, 
			right: 68 
		},

		move_alt: {
			forward: 38, // up
			back: 40, // down
		},

		turn: {
			left: 37,
			right: 39
		},

		// flip_cam: 70, // f

		actions: {
			one: 49,
			two: 50,
			three: 51,
			four: 52,
			five: 53,
			six: 54
		},

		inventory: 66,
		character: 67

	},


}


if( env.EXPOSE ) window.BINDS = binds

export default binds

