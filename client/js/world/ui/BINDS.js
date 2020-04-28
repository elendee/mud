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
			forward: 87, // w
			back: 83, // s
			left: 65, // d
			right: 68 // a
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
			four: 52
		},

	},


}


window.BINDS = binds

export default binds

