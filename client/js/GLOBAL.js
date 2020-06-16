// import log from '../LOG.js'

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

	HEMI_BACK_COLOR: 0xff000,
	HEMI_FACE_COLOR: 0x000ff,
	HEMI_INTENSITY: .5,

	DIRECTIONAL_INTENSITY: 1.5,
	DIRECTIONAL_COLOR: 0xddffff,

	TARGET_DIST: 1000,

	VIEW: 2000,

	FOG_COLOR: 0xffffff,

	FOG_SCALAR: 0.004,

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
	
	// LOOK_HORIZONTAL: base.LOOK_SPEED / 2,

	// LOOK_VERTICAL: base.LOOK_SPEED / 3,

	CAMERA_VERTICAL_OFFSET: 5,

	CAMERA_HORIZONTAL_OFFSET: 80,

	SPEAKER: 3,

	MODEL_TYPES: {

		// toon:
		'toon': 'glb',
		'npc': 'glb',

		'human': 'glb',
		'gorgon': 'glb',
		'gargoyle': 'glb',

		// entity:
		'structure_tavern': 'glb',
		'structure_hut': 'glb',
		'structure_blacksmith': 'obj',
		'flora_oak': 'obj',
		'flora_pine': 'obj',
		// 'plainsgrass': 'obj',
		// 'rock': 'obj'

	},

}