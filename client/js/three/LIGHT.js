
import env from '../env.js'

import GLOBAL from '../GLOBAL.js'

import { 
	DirectionalLight, 
	SpotLight,
	DirectionalLightHelper,
	HemisphereLight,
	Vector3
} from '../lib/three.module.js'



const offset = new Vector3( 500, 500, 500 )
// const offset = new Vector3( 1, 1, 1 )

const directional = new DirectionalLight( 
	GLOBAL.DIRECTIONAL_COLOR, 
	GLOBAL.DIRECTIONAL_INTENSITY,
	100
)

// directional.position.copy( offset )
directional.castShadow = true
directional.shadow.camera.near = 1;
directional.shadow.camera.far = 1800;
directional.shadow.camera.left = -750;
directional.shadow.camera.right = 750;
directional.shadow.camera.top = 300;
directional.shadow.camera.bottom = -250;
directional.shadow.camera.fov = 250
directional.shadow.mapSize.width = 2048;
directional.shadow.mapSize.height = 2048;
// directional.shadow.mapWidth = 2048;
// directional.shadow.mapHeight = 2048;


const spotlight = new SpotLight( 0xffffff )
spotlight.position.copy( offset )
spotlight.castShadow = true
spotlight.shadow.mapSize.width = 1024;
spotlight.shadow.mapSize.height = 1024;

spotlight.shadow.camera.near = 55;
spotlight.shadow.camera.far = 1000;
spotlight.shadow.camera.fov = 45;

const helper = new DirectionalLightHelper( directional )




const hemispherical = new HemisphereLight( GLOBAL.HEMI_BACK_COL, GLOBAL.HEMI_FACE_COL, GLOBAL.HEMI_INTENSITY )

if( env.EXPOSE ) {
	window.LIGHT = {
		directional: directional,
		hemispherical: hemispherical,
		spotlight: spotlight,
		helper: helper
	}
}

export { 
	directional, 
	hemispherical,
	spotlight,
	helper,
	offset
}