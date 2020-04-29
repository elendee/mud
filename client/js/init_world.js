import hal from './hal.js'

import animate from './world/animate.js'

import * as ACTION_BAR from './world/ui/ACTION_BAR.js'
import * as KEYS from './world/ui/KEYS.js'

import * as ROUTER from './world/ROUTER.js'

import DEV from './world/ui/DEV.js'

import ZONE from './world/ZONE.js'

import Toon from './world/Toon.js'

document.addEventListener('DOMContentLoaded', function(){

	ACTION_BAR.init()

	KEYS.init()

	ROUTER.bind()
	.then( res => {
		init_session( res )
	})
	.catch( err => {
		console.log( err )
	})


})





async function init_session( res ){

	if( localStorage.getItem('devkey') === 'true' )  DEV.ele.style.display = 'initial'

	// websocket now bound

	// window.SCENE = SCENE
	window.TOON = new Toon( res.USER.TOON )
	// window.TOON.model()

	// SCENE.add( GROUND )

	// SCENE.add( SKYBOX )

	ZONE.initialize()

	// const box = new BoxBufferGeometry(3, 3, 3)
	// const wires = new WireframeGeometry( box )

	// USER.box = new LineSegments( wires )
	// USER.box.material.depthTest = false
	// // USER.box.material.opacity = env.BOX_OPACITY
	// USER.box.material.transparent = true

	// USER.box.position.copy( USER.PILOT.SHIP.ref.position )
	// USER.box.quaternion.copy( USER.PILOT.SHIP.ref.quaternion )

	return true

}
