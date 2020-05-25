// import log from '../LOG.js'

// log('call', 'GLOBAL.js')
import {
	Vector3
} from './lib/three.module.js'


const base = {
	LOOK_SPEED: .003
}

export default {

	TREE_BASE: 20,

	// AUDIBLE: {

	// 	EXPLOSION: 1500

	// },

	MAX_CAM: 300,

	MIN_CAM: 150,

	// TILE_WIDTH: 10,

	// MATERIALIZE_TIME: 1000,
	HEMI_BACK_COLOR: 0xff000,
	HEMI_FACE_COLOR: 0x000ff,
	HEMI_INTENSITY: .5,

	DIRECTIONAL_INTENSITY: 1.5,
	DIRECTIONAL_COLOR: 0xddffff,

	TARGET_DIST: 1000,

	VIEW: 2000,

	// SKY_WIDTH: 14900,

	// SUN_DIST: 200,

	// PLANET_DIST: 7400, // never more than half sky_width ...

	// PLANET_RADIUS: 200,

	// PLANET_DETAIL: 30,

	FOG_COLOR: 0xffffff,

	FOG_SCALAR: 0.004,

	// GRAVITY_FIELD_BEGIN: 100000,

	// GRAVITY_FIELD_NORETURN: 10000,

	// FPS_MAP: {
	// 	'very_low': 10,
	// 	'low': 20,
	// 	'medium': 30,
	// 	'high': 60
	// },

	// FPS: 0,

	RES_MAP: {
		'very_low': 3,
		'low': 2,
		'medium': 1.3,
		'high': 1
	},

	SOUNDTRACK: 'off',

	CURRENT_SOUNDTRACK: false,

	RES_KEY: 'medium',

	SOUND_ALL: 'off',

	ORIGIN: new Vector3(0,0,0),

	UP: new Vector3( 0, 1, 0 ),
	DOWN: new Vector3( 0, -1, 0 ),
	EAST: new Vector3( 1, 0, 0 ),
	WEST: new Vector3( -1, 0, 0 ),
	
	LOOK_HORIZONTAL: base.LOOK_SPEED / 2,

	LOOK_VERTICAL: base.LOOK_SPEED / 3,

	CAMERA_VERTICAL_OFFSET: 5,

	CAMERA_HORIZONTAL_OFFSET: 80,

	SPEAKER: 3,

	// PROFILE_IMGS: {
	// 	unknown: 'unknown.png',
	// 	flora: 'flora.png',
	// 	toon: 'toon.png',
	// 	self: 'toon.png',
	// 	npc: 'toon.png',
	// 	structure: 'structure.png'
	// }
	// SPEAKER: 80

}