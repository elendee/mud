const read = require('node-readability')

module.exports = function( url ){

	return new Promise((resolve, reject) => {

		read( url, function( err, article ){

			let response = {}

			if( err ){

				response.success = false

			}else{

				let response = {
					success: true,
					title: article.title,
					content: article.content,
					// html
					// document
					// meta
				}

			}
			
			article.close()

			resolve( response )

		})

	})

}

