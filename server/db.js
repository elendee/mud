
const log = require('./log.js')

const env = require('./.env.js')
const mysql = require('mysql')
const assert = require('assert')

let _pool

function initPool( callback ) {
    
	if ( _pool ) {
		console.log('trying to init pool redundantly')
		return callback(null, _pool)
	}

	//  _pool = mysql.createConnection({
	// 	host: env.DB.HOST,
	// 	db: env.DB.NAME,
	// 	user: env.DB.USER,
	// 	password: env.DB.PW,
	// 	charset: env.DB.CHARSET
	// 	// debug: // default false
	// 	// trace: // default true
	// 	// ssl: ...
	// 	// socketPath: env.SOCKETPATH // unix socketpath :3
	// })

	_pool = mysql.createPool({
		connectionLimit: 10,
		host: env.DB.HOST,
		user: env.DB.USER,
		password: env.DB.PW,
		database: env.DB.NAME,
		charset: env.DB.CHARSET
	})


	const queryPromise = ( ...args ) => new Promise( (resolve, reject) => {

		_pool.query( ...args, (error, results, fields) => {
			resolve({ error, results, fields })
		})

	})

	_pool.queryPromise = queryPromise

	if( _pool ) log('db', 'pool init')

	return callback( null, _pool )

}



function getPool() {

	assert.ok( _pool, 'Pool has not been initialized, call init first' )
	return _pool

}


async function update( doc, field_array, value_array ){

	const pool = getPool()

	if( !field_array || !field_array.length || !value_array || !value_array.length || field_array.length !== value_array.length ){
		log('flag', 'invalid update fields')
		return false
	}

	if( !doc._table ){
		log('flag', 'no table for update')
		return false
	}

	let full_string = ''
	let field_string = ''
	let value_string = ''
	let first_val = true

	for( let i = 0; i < field_array.length; i++ ){

		let value = 'NULL'
		let type = typeof( value_array[i] )

		if( type === 'string' ) {

			// log('flag', type + ': ', value_array[i] )

			if( value_array[i].match(/^NULL$/i) ){ // stringified 'null'

				value = 'NULL' //value_array[i]

			}else{

				value = '"' + value_array[i] + '"' // normal string

			}

		}else if( type === 'number' ){ // numbers

			value = value_array[i]

		}else if( type === 'function' ){

			// skip

		}else if( type === 'object' ){

			value = "'" + JSON.stringify( value_array[i] ) + "'" // stringify generates " so it needs ' wrappers for SQL

		}else if( type === 'boolean' ){

			value = value_array[i]

		}else if( type === 'undefined' ){

			log('flag', 'unexpected UPDATE val: \n' + field_array[i] + '\n' + value_array[i] )

		}

		// log('flag', 'field_array: ', field_array[i] +'\n' + type + '\n' + value_array[i] + '\n' + value )


		let concat
		if( first_val ){
			doc.id ? field_string += 'id, ' + field_array[i] : field_string += field_array[i]
			doc.id ? value_string += doc.id + ', ' + value : value_string += value
			concat = '`' + field_array[i] + '`=' + value
			// log('query', 'adding first value: ', concat )
			full_string += concat // no preceding comma for first
			first_val = false
		}else{
			field_string += ', ' + field_array[i]
			value_string += ', ' + value
			concat = ', `' + field_array[i] + '`=' + value
			// log('query', 'adding value: ', concat )
			full_string += concat
		}

	}

	// INSERT INTO table (id, name, age) VALUES(1, "A", 19) ON DUPLICATE KEY UPDATE name="A", age=19

	const update = 'INSERT INTO `' + doc._table + '` (' + field_string + ') VALUES (' + value_string + ') ON DUPLICATE KEY UPDATE ' + full_string

	log('query', 'attempting UPDATE: ', update )

	const { error, results, fields } = await pool.queryPromise( update )

	if( error || !results ){
		if( error ){
			log('flag', 'update err:', error.sqlMessage )
			return false
		}else{
			// throw new Error( 'UPDATE error: ', error.sqlMessage, 'attempted: ', '\nATTEMPTED: ', update, doc._table )
			throw new Error( 'no results: ' + update )
		}
	}

	log('query', 'results: ', JSON.stringify( results ) )

	return {
		msg: 'update success',
		id: results.insertId
	}

}



module.exports = {
	getPool,
	initPool,
	update
}
