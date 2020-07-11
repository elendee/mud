

import * as lib from './lib.js'
import hal from './hal.js'
import env from './env.js'

let MAP

const panels = {}

const stats = document.querySelectorAll('.stat')

const stat_panel = document.querySelector('.stat-panel')

const display = document.querySelector('#avatar-points')

let SINGLE_STAT_CAP = 15
let TOTAL_STAT_CAP = 50
if( env.LOCAL ) SINGLE_STAT_CAP = 50

document.addEventListener('DOMContentLoaded', function(){

	// const err = document.getElementById('errors').innerHTML.trim()
	(async()=>{

		// dom prep

		const res = await fetch('/map', {
			method: 'get'
		})

		MAP = await res.json()

		await build_selections()

		// render_panel( 'human' )
		// render_panel()

		// bind

		document.querySelector('#create form').addEventListener('submit', (e) => {

			e.preventDefault()

			const valid = validate_avatar()
			if( valid !== true ){
				hal('error', valid )
				return false
			}

			let stats = {}
			for( const stat of document.querySelectorAll('#stats input')){
				stats[ stat.getAttribute('data-stat') ] = stat.value
			}

			create_avatar({
				name: document.querySelector('#avatar-name').value.trim(),
				stats: stats
			})
			.then( res => {
				console.log( res )
				if( res.success && res.avatar ){
					// console.log('success', res )
					location.href = '/world'
					// render_avatars( [ res.avatar ] )
				}else{
					hal('error', res.msg )
				}
			})
			.catch( err => {
				console.log('err fetching avatars: ', err )
			})

		})

		// document.querySelector('#avatar-race').addEventListener('change', function(){
		// 	render_panel( this.value )
		// })

	})()

})


function update_input( input, stat_panel, display, name, name_ele ){

	const points = get_points( stat_panel )
	display.innerHTML = 'total:' + '<span>' + points + '/' + TOTAL_STAT_CAP + '</span>'
	name_ele.innerHTML = name + ': <span>' + input.value + ' / ' + input.max + '</span>'

}


async function build_selections(){

	for( const stat of stats ){

		const input = stat.querySelector('input')
		const name_ele = stat.querySelector('.stat-name')
		const name = input.getAttribute('data-stat')

		input.addEventListener('change', function(){
			update_input( input, stat_panel, display, name, name_ele )
		})

	}

}


function iterate_inputs(){

	for( const stat of stats ){

		const input = stat.querySelector('input')
		const name_ele = stat.querySelector('.stat-name')
		const name = input.getAttribute('data-stat')

		update_input( input, stat_panel, display, name, name_ele )

	}

}


// 	// for( const r of Object.keys( MAP.MAX_STATS )){

// 		// let race = MAP.MAX_STATS[ r ]

// 	let stat_panel = document.createElement('div')
// 	stat_panel.classList.add('stat-panel')

// 	// let img_panel = document.createElement('div')
// 	// img_panel.classList.add('img-panel')
// 	// img_panel.style.background = 'url(/resource/images/' + r + '_rich.jpg)'

// 	let display = document.createElement('div')
// 	display.id = 'avatar-points'

// 	for( const stat of Object.keys( race ) ){

// 		const s = document.createElement('div')
// 		s.classList.add('stat')
// 		const name = document.createElement('div')
// 		name.classList.add('stat-name')
// 		name.innerHTML = stat 

// 		const input = document.createElement('input')
// 		input.setAttribute('data-stat', stat )
// 		input.type = 'range'
// 		input.max = env.LOCAL ? TOTAL_STAT_CAP : race[ stat ]
// 		input.min = 0
// 		input.value = 0

// 		input.style.width =  Math.floor( input.max / SINGLE_STAT_CAP * 100 ) + '%'

// 		// + ': ' + race[ stat ]
// 		s.appendChild( name )
// 		s.appendChild( input )
// 		stat_panel.appendChild( s )
//	}

// 	stat_panel.appendChild( display )

// 	panels[ r ] = {
// 		stats: stat_panel,
// 		img: img_panel
// 	}

// 	// }

// }



// function render_panel( race ){

// 	document.getElementById('stats').innerHTML = ''
// 	document.getElementById('avatar-image').innerHTML = ''

// 	document.getElementById('stats').appendChild( panels[ race ].stats )
// 	document.getElementById('avatar-image').appendChild( panels[ race ].img )

// }

function get_points( panel ){

	const inputs = panel.querySelectorAll('input[type="range"]')

	let value = 0

	for( const input of inputs ){
		value += Number( input.value )
	}

	return value

}



function validate_avatar(){

	const stats = document.getElementById('stats')

	if( get_points( stats ) === TOTAL_STAT_CAP ) return true
	if( get_points( stats ) < TOTAL_STAT_CAP ){
		if( confirm('You have points to spare, are you sure?') ){
			return true
		}else{
			return 'Spend away.'
		}
	}

	if( get_points( stats ) > TOTAL_STAT_CAP ) return 'YOU SHALL NOT PASS!!!  Decrease your points.'

}


async function create_avatar( data ) {

	const response = await fetch('/create_avatar', {
		method: 'post',
		headers: {
	    	'Content-Type': 'application/json'
	    },
		body: JSON.stringify({
			name: data.name,
			stats: data.stats
		})
	})

	const res = await response.json()

	return res

}




iterate_inputs()
