
const { JSDOM } = require('jsdom')

const log = require('./log.js')

module.exports = function( type, text, url ){

	if( typeof text !== 'string' ) return 'unable to parse response'

	const { window } = new JSDOM( text, {
		// options: options
	} )
	const { document } = (new JSDOM( text )).window

	let response_dom = []

	switch ( type ){ // (google DOM currently)

		case 'search':

			const results = document.querySelectorAll('#main>div>div>div a')

			for( const res of results ){
				const h3 = res.querySelector('h3')
				if( h3 ){
					response_dom.push({
						text: h3.textContent,
						link: res.href
					})
				}
			}

			return response_dom

			break;

		case 'url':

			const scripts = document.querySelectorAll('script')
			for( const script of scripts ){
				log('flag', 'removing script')
				script.remove()
			}

			const styles = document.querySelectorAll('style')
			for( const style of styles ){
				log('flag', 'removing style')
				style.remove()
			}

			const as = document.querySelectorAll('a')
			for( const a of as ){
				if( a.href && !a.href.match(/^https?:\/\//g) ){
					a.href = url + '/' + a.href
				}
			}

			// let res = []
			let res = ''

			const ps = document.querySelectorAll('p')
			for( const p of ps ){
				// res.push( p.textContent  + '<br>' )
				// res += p.textContent + '<br>'
				res += p.innerHTML + '<br>'
			}

			// return document || 'could not understand request'
			return '<br>' + res || 'could not understand request'
			// ? document.serialize() :

			break;

		default: break;

	}

	

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