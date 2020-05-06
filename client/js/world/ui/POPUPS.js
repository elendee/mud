
const active = window.ACTIVE_POPUPS = []
const all = []

function bring_to_top( popup ){
	// console.log( 'clicked ', popup )
	let found
	for( let i = 0; i < active.length; i++ ){
		if( active[ i ].id == popup.id ){
			active.push( active.splice( i, 1 )[0] )
			found = true
			continue
		}
	}
	if( !found ){
		active.push( popup )
	}

	apply_indexes()
}

function remove( popup ){
	for( let i = 0; i < active.length; i++ ){
		if( active[ i ].id == popup.id ){
			active.push( active.splice( i, 1 ) )
		}
	}
	apply_indexes()

}

function toggle( id ){
	let found
	for( const popup of active ){
		if( popup.id === id ){
			found = popup
		}
	}
	if( found ){
		found.set_visible( false )
	}else{
		for( const popup of all ){
			if( popup.id === id ){
				popup.set_visible( true )
			}
		}
	}
}


function apply_indexes(){
	for( let i  = 0; i < active.length; i++ ){
		active[ i ].element.style['z-index'] = (i+1) * 9
	}
}

export {
	active,
	bring_to_top,
	remove,
	toggle,
	all
}