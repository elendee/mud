
import env from './env.js'
import hal from './hal.js'

import * as ACTION_BAR from './world/ui/ACTION_BAR.js'
import * as KEYS from './world/ui/KEYS.js'

import * as ROUTER from './world/ROUTER.js'

import DEV from './world/ui/DEV.js'

import ZONE from './world/ZONE.js'

import { zone_render } from './world/ZONE_render.js'

import RENDERER from './three/RENDERER.js'

import User from './User.js'

import Toon from './world/Toon.js'




document.addEventListener('DOMContentLoaded', function(){

	ACTION_BAR.init()

	KEYS.init()

	window.addEventListener( 'resize', RENDERER.onWindowResize, false )

	ROUTER.bind()
	.then( init_res => {
		init_session( init_res )
		.then(res=>{
			zone_render( ZONE, init_res.ZONE )
			setTimeout(function(){
				window.SOCKET.send(JSON.stringify({
					type: 'ping_flora'
				}))
			}, 500)
			setTimeout(function(){
				window.SOCKET.send(JSON.stringify({
					type: 'ping_structures'
				}))
			}, 1500)
			setTimeout(function(){
				window.SOCKET.send(JSON.stringify({
					type: 'ping_items'
				}))
				document.querySelectorAll('img').forEach(function(ele){
					ele.setAttribute('draggable', false )
				})
			}, 2000)
		})
		.catch(err=>{
			console.log(err)
		})

	})
	.catch( err => {
		console.log( err )
	})


})





async function init_session( res ){

	// console.log( res.USER.TOON._INVENTORY )

	if( env.LOCAL )  DEV.ele.style.display = 'initial'

	// websocket now bound

	// window.SCENE = SCENE
	window.USER = new User( res.USER )
	window.TOON = USER.TOON = new Toon( res.TOON )
	window.TOON.set_inventory()
	window.TOON.refresh_equipped()
	if( env.EXPOSE )  window.ZONE = ZONE
	// window.TOON.model()

	// SCENE.add( GROUND )

	// SCENE.add( SKYBOX )

	await ZONE.initialize()

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






