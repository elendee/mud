const scripts = {
	base: `<script src='/client/js/base.js'></script>`,
	// base: `<script src='/client/js/base.js'></script>`,
}

const styles = {
	base: `<link rel='stylesheet' href='/client/css/base.css'>`
}

const render = function( type, request ){
	switch( type ){
		case 'index':
			let css_includes = styles.base 
			let js_includes = scripts.base
			return `
			<html>
				<head>
					<title>yehoo</title>
					${ css_includes }
					${ js_includes }
				</head>
				<body>
					<div id='mud-home'>
					</div>
				</body>
			</html>`
			break;
		default: break;
	}
}


module.exports = render