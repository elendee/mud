
// const GALLERY_DIAMETER = 500

// const WALKABLE_GRID_MARGIN = 100

// const BASE_PIECE_SIZE = 8

module.exports = {

	// REGROW_PULSE: 60 * 1000,

	// GRID_MODULO: 5,

	MOVE_PULSE: 2900,

	ZONE_WIDTH: 1000,

	TILE_WIDTH: 100,

	// CENSUS_PULSE: 9900,

	// BOT_PULSE: 3000,

	// BOT_SWEEP: 15000,

	// BOT_THINK_TICKS: 5,

	// PILLARS: 5,

	// GALLERY_DIAMETER: GALLERY_DIAMETER,
	// GALLERY_RADIUS: GALLERY_DIAMETER / 2,

	// BASE_PIECE_SIZE: BASE_PIECE_SIZE,

	// SLOT_SIZE: 20,

	// BASE_PILLAR_HEIGHT: 15,
	// BASE_PILLAR_WIDTH: BASE_PIECE_SIZE * 2,

	// BASE_WING_WIDTH: 100,
	// BASE_WING_HEIGHT: 100,
	// BASE_WING_LENGTH: 100,

	// EYELINE: 7,


	// IMAGE_DEPTH: .3,

	TARGET_DIST: 25,

	ROTATE_RATE: .05,

	// GROWTH_RATE: .1, // 1x min avg
	// GROWTH_RATE: .00005,

	// LOBBY_CENTER: {
	// 	x: ( GALLERY_DIAMETER / 2 ) + FLOOR_WIDTH,
	// 	y: false,
	// 	z: GALLERY_DIAMETER / 2
	// },

	ZOOM_DIST: 500,

	// WALKABLE_GRID_MARGIN: WALKABLE_GRID_MARGIN,

	// PORTRAITS: [
	// 	'butterbur.png', 
	// 	'wolf.png', 
	// 	'carl-reininghaus.png', 
	// 	'egon-photo.png', 
	// 	'egon.png', 
	// 	'frog.png',
	// 	'iron-man.png', 
	// 	'mononoke.png',
	// 	'nelson.png', 
	// 	'panther.png',
	// 	'owl.png',
	// 	'owl2.png',
	// ]

	SPEED_FLOOR: 15,

	MAX_STATS: {
		human: {
			strength: 10,
			vitality: 10,
			dexterity: 10,
			perception: 10,
			luck: 10,
			intellect: 10,
			speed: 10,
		},
		gnome: {
			strength: 5,
			vitality: 6,
			dexterity: 12,
			perception: 12,
			luck: 15,
			intellect: 11,
			speed: 9,
		},
		elf: {
			strength: 7,
			vitality: 10,
			dexterity: 12,
			perception: 12,
			luck: 7,
			intellect: 12,
			speed: 10,
		},
		dwarf: {
			strength: 13,
			vitality: 13,
			dexterity: 6,
			perception: 10,
			luck: 8,
			intellect: 9,
			speed: 9,
		}
	}

}