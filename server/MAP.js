
const GALLERY_DIAMETER = 500

// const WALKABLE_GRID_MARGIN = 100

const FLOOR_WIDTH = 150

const BASE_PIECE_SIZE = 8


module.exports = {

	REGROW_PULSE: 60 * 1000,

	GRID_MODULO: 5,

	MOVE_PULSE: 2900,

	CENSUS_PULSE: 9900,

	BOT_PULSE: 3000,

	BOT_SWEEP: 15000,

	BOT_THINK_TICKS: 5,

	PILLARS: 5,

	GALLERY_DIAMETER: GALLERY_DIAMETER,
	GALLERY_RADIUS: GALLERY_DIAMETER / 2,

	BASE_PIECE_SIZE: BASE_PIECE_SIZE,

	SLOT_SIZE: 20,

	BASE_PILLAR_HEIGHT: 15,
	BASE_PILLAR_WIDTH: BASE_PIECE_SIZE * 2,

	BASE_WING_WIDTH: 100,
	BASE_WING_HEIGHT: 100,
	BASE_WING_LENGTH: 100,

	EYELINE: 7,

	FLOOR_WIDTH: FLOOR_WIDTH,

	IMAGE_DEPTH: .3,

	TARGET_DIST: 25,

	ROTATE_RATE: .05,

	GROWTH_RATE: .1, // 1x min avg
	// GROWTH_RATE: .00005,

	LOBBY_CENTER: {
		x: ( GALLERY_DIAMETER / 2 ) + FLOOR_WIDTH,
		y: false,
		z: GALLERY_DIAMETER / 2
	},

	ZOOM_DIST: 500,

	// WALKABLE_GRID_MARGIN: WALKABLE_GRID_MARGIN,

	PORTRAITS: [
		'butterbur.png', 
		'wolf.png', 
		'carl-reininghaus.png', 
		'egon-photo.png', 
		'egon.png', 
		'frog.png',
		'iron-man.png', 
		'mononoke.png',
		'nelson.png', 
		'panther.png',
		'owl.png',
		'owl2.png',
	]

}