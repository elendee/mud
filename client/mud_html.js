const scripts = {
	base: `<script src='/client/js/base.js'></script>`,
	// base: `<script src='/client/js/base.js'></script>`,
}

const styles = {
	base: `<link rel='stylesheet' href='/client/css/base.css'>`,
	index: `<link rel='stylesheet' href='/client/css/index.css'>`,
	avatar: `<link rel='stylesheet' href='/client/css/avatar.css'>`,
}

const render = function( type, request ){
	let css_includes = styles.base
	let js_includes = scripts.base
	switch( type ){
		case 'index':
			css_includes += styles.index
			return `
			<html>
				<head>
					<title>mud</title>
					${ css_includes }
					${ js_includes }
				</head>
				<body>
					<div id='content'>
						<div id='auth-contain'>
							<form id='login-form' method='post' class='auth-form' action='/login'>
								Login
								<input id='login-email' type='text' name='email' placeholder='email'>
								<input id='login-password' type='password' name='password' placeholder='password'>
								<input type='submit' class='submit button'>
							</form>
							<form id='register-form' method='post' class='auth-form' action='/register'>
								Register
								<input id='regsiter-email' type='email' name='email' placeholder='email'>
								<input id='register-password' type='password' name='password' placeholder='password'>
								<input id-'register-password-confirm' type='password' placeholder='password again'>
								<input type='submit' class='submit button'>
							</form>
						</div>
						<div id='play-contain'>
							<form id='play-form' method='post' action='/play'>
								Play<br>
								<input type='hidden' name='play' value='human'>
								<input type='hidden' name='email' value='hpot'>
								<input type='submit' class='submit button' value='play'>
							</form>
						</div>
					</div>
				</body>
			</html>`
			break;

		case 'avatar':
			css_includes += styles.avatar
			return `
			<html>
				<head>
					<title>mud</title>
					${ css_includes }
					${ js_includes }
				</head>
				<body>
					<div id='content'>
						avatar....
					</div>
				</body>
			</html>`
			break;

		case '404':
			return `<html>
				<head>
					<title>yehoo</title>
					${ css_includes }
					${ js_includes }
				</head>
				<body>
					<div id='content'>
						404040404040404
					</div>
				</body>
			</html>`
			break;

		default: break;
	}
}


module.exports = render