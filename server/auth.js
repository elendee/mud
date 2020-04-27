const bcrypt = require('bcryptjs')

// const User = require('../models/User.js');
// const Avatar = require('../models/Avatar.js');

const log = require('./log.js')
const lib = require('./lib.js')

// const axp = require('./pure.js');
// const axst = require('./state.js');

const DB = require('./db.js')
// const ax_parcel = require('./_parcel.js');

const SALT_ROUNDS = 10

const User = require('./User.js')

log('call', 'auth.js')






async function login_user( request ){

	const pool = DB.getPool()

	const email = request.body.email.toLowerCase().trim()
	const password = request.body.password.trim()

	const response = await select_user( 'email', email )
	if( !response ) return false

	const hash_pw = response.msg.password

	const user = new User( response.msg )

	const bcrypt_boolean = await bcrypt.compare( password, hash_pw )

	if( bcrypt_boolean ){

		request.session.USER = user

		return true

	}else{

		return false

	}

}



async function register_user( request ){

	if( !request.session.USER.id && request.session.USER.level <= 0 ){ // should always be the case if routing correctly

		const pool = DB.getPool()

		const email = request.body.email.toLowerCase().trim()
		const pw = request.body.password.trim()

		let invalid = false
		if( !lib.is_valid_email( email )){
			invalid = 'invalid email'
		}else if( !lib.is_valid_password( pw )){
			invalid = 'invalid password'
		}
		if( invalid ){
			log('flag', 'register: ', invalid )
			return false
		}

		let salt = bcrypt.genSaltSync( SALT_ROUNDS )
		let hash = bcrypt.hashSync( pw, salt )

		const sql = 'INSERT INTO `users` (`email`, `password`, `level`, `confirmed`) VALUES ( ?, ?, 1, false )'

		const response = pool.queryPromise( sql, [ email, hash ] ) // , ( err, result ) => { // INSERT does not return fields

		const user = await select_user( 'id', result.insertId )

		request.session.USER = user // should be app logic: new User( res )

		return true

	}else{

		log('flag', 'bad register attempt: ', request.session.USER )
		return false

	}
}






async function select_user( type, value ){

	const pool = DB.getPool()

	let field
	if( type == 'email' ){
		field = '`email`'
	}else if( type == 'id' ){
		field = '`id`'
	}else{
		log('flag', 'invalid user lookup', type )
		resolve({
			success: false,
			msg: 'invalid user lookup'
		})
		return false
	}

	const sql = 'SELECT * from `users` WHERE ' + field + ' = ? LIMIT 1'

	const { error, results, fields } = await pool.queryPromise( sql, [ value ] ) 

	if( error )  log('flag', 'error retrieving user: ', error )
	
	return results[0]

}





const logout_user = async( request ) => {

	let msg = 'user saved'

	if( request.session.USER.save && request.session.USER.id ){

		const r = await request.session.USER.save() // auto stamps
		if( !r || !r.success )  log('flag', 'error saving user during logout (proceeding) ', r )

	}else{

		msg = 'no user found to logout'

	}

	request.session.destroy()

	return {
		success: true,
		msg: msg
	}

}











module.exports = {
	register_user,
	select_user,
	login_user,
	logout_user
}








