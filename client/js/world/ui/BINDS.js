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
			forward: 83, // w
			back: 87, // s
			left: 68, // d
			right: 65 // a
		},

		move_alt: {
			forward: 40, // up
			back: 38, // down
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
			four: 52
		},

	},


}


if( env.EXPOSE ) window.BINDS = binds

export default binds

