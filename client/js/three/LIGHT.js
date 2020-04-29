
import env from '../env.js'

import GLOBAL from '../GLOBAL.js'

import { 
	DirectionalLight, 
	SpotLight,
	DirectionalLightHelper,
	HemisphereLight,
	Vector3
} from '../lib/three.module.js'



const offset = new Vector3( 150, 150, 150 )
// const offset = new Vector3( 1, 1, 1 )

const directional = new DirectionalLight( 
	GLOBAL.DIRECTIONAL_COLOR, 
	GLOBAL.DIRECTIONAL_INTENSITY 
)
// directional.position.copy( offset )
// directional.castShadow = true
// directional.shadowCameraNear = 1;
// directional.shadowCameraFar = 200;
// directional.shadowCameraLeft = -50;
// directional.shadowCameraRight = 50;
// directional.shadowCameraTop = 50;
// directional.shadowCameraBottom = -50;
// directional.shadowMapWidth = 2048;
// directional.shadowMapHeight = 2048;


const spotlight = new SpotLight( 0xffffff )
spotlight.position.copy( offset )
spotlight.castShadow = true
spotlight.shadow.mapSize.width = 1024;
spotlight.shadow.mapSize.height = 1024;

spotlight.shadow.camera.near = 55;
spotlight.shadow.camera.far = 1000;
spotlight.shadow.camera.fov = 45;

const helper = new DirectionalLightHelper( directional )




const hemispherical = new HemisphereLight( GLOBAL.HEMI_BACK_COL, GLOBAL.HEMI_FACE_COL, GLOBAL.HEMI_INTENSITY)

window.LIGHT = {
	directional: directional,
	hemispherical: hemispherical,
	spotlight: spotlight,
	helper: helper
}

export { 
	directional, 
	hemispherical,
	spotlight,
	helper,
	offset
}