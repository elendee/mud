
const { JSDOM } = require('jsdom')

const log = require('./log.js')

module.exports = function( search ){

	if( typeof search !== 'string' ) return 'unable to parse response'

	const { window } = new JSDOM( search, {
		// options: options
	} )
	const { document } = (new JSDOM( search )).window

	const results = document.querySelectorAll('#main>div>div>div a')

	let send = []

	for( const res of results ){
		if( res.querySelector('h3') ){
			// log('flag', res.textContent )
			send.push({
				text: res.textContent,
				link: res.href
			})
		}
	}

	return send

	// let match = search.match(/<h3(.*?)\/h3>/ig)
	// let a_match = search.match(/<a href="\/url(.*?)\/a>/ig)

	// let r = []

	// if( match && match.index ){
	// 	r.push({
	// 		text: get_text( match[0] ),
	// 		link: get_link( a_match[0] )
	// 	})
	// }else if( Array.isArray( match ) ){
	// 	let response = ''
	// 	match.map( h3 => {
	// 		r.push({
	// 			text: get_text( h3 ),
	// 			link: get_link( h3 )
	// 		})
	// 	})
	// 	return response
	// }

	// return r

}



// function get_text( data ){
// 	log('flag', data )
// 	let r = ''
// 	let span = data.match(/<span.*?>(.*?)<\/span>/i)
// 	if( span ){
// 		r += span[1]
// 	}else{
// 		let div = data.match(/<div.*?>(.*?)<\/div>/i)
// 		if( div ){
// 			r += div[1]
// 		}
// 	}
// 	return r

// }


// function get_link( data ){



// }