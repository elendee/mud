
import env from './env.js'

// import { TextureLoader } from '../../../resource/inc/three/three.module.js'
// receives data from server


const MAPS = {}


if( env.EXPOSE ){
	// window.ECC = window.ECC || {}
	// window.ECC.MAPS = MAPS
}

// MAPS.ShipMap
// MAPS.ProjectileMap
// MAPS.ShipMap

MAPS.initialized = false

MAPS.icons = {
	error: '&#128028;',
	warning: '&#128028;',
	standard: '&#128037;',
	success: '&#127940;',
	hal: '&#128226;'
}

// MAPS.textures = {

// 	explosion: {
// 		texture: new TextureLoader().load( '/resource/textures/explosion.png' ),
// 		material: {} // generated
// 	},
// 	green: {
// 		texture: new TextureLoader().load( '/resource/textures/flare-green.png' ),
// 		material: {} // generated
// 	},
// 	blue: {
// 		texture: new TextureLoader().load( '/resource/textures/flare-blue.png' ),
// 		material: {} // generated
// 	}
// }




export default MAPS 

