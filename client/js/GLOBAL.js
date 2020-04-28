import log from '../LOG.js'

log('call', 'GLOBAL.js')


const base = {
	LOOK_SPEED: .003
}

export default {

	AUDIBLE: {

		EXPLOSION: 1500

	},

	HAL_ICON: 'robot',

	NUM_BILLBOARDS: 4,

	MATERIALIZE_TIME: 1000,

	TARGET_DIST: 10000,

	VIEW: 15000,

	SKY_WIDTH: 14900,

	SUN_DIST: 200,

	PLANET_DIST: 7400, // never more than half sky_width ...

	PLANET_RADIUS: 200,

	PLANET_DETAIL: 30,

	FOG_COLOR: 0x010101,

	FOG_SCALAR: 0.0001,

	GRAVITY_FIELD_BEGIN: 100000,

	GRAVITY_FIELD_NORETURN: 10000,

	FPS_MAP: {
		'very_low': 10,
		'low': 20,
		'medium': 30,
		'high': 60
	},

	FPS: 0,

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

	LOOK_HORIZONTAL: base.LOOK_SPEED / 2,

	LOOK_VERTICAL: base.LOOK_SPEED / 3,

	CAMERA_VERTICAL_OFFSET: 5,

	CAMERA_HORIZONTAL_OFFSET: 80,

	RESOLUTION: 1,

	SPEAKER: 3
	// SPEAKER: 80

}