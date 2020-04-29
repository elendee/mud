
// function clear_object(obj){
	
// 	while(obj.children.length > 0){ 
// 		clear_object(obj.children[0])
// 		obj.remove(obj.children[0]);
// 	}

// 	if(obj.geometry) obj.geometry.dispose()

// 	if(obj.material){ 
// 		//in case of map, bumpMap, normalMap, envMap ...
// 		Object.keys(obj.material).forEach(prop => {
// 			if(!obj.material[prop])
// 				return         
// 			if(typeof obj.material[prop].dispose === 'function')                                  
// 				obj.material[prop].dispose()                                                        
// 		})

// 		obj.material.dispose()
// 	}
// }   

// clear_object(scene)
			
			
function random_hex( len ){

	//	let r = '#' + Math.floor( Math.random() * 16777215 ).toString(16)
	let s = ''
	
	for( let i = 0; i < len; i++){
		
		s += Math.floor( Math.random() * 16 ).toString( 16 )

	}
	
	return s

}







export {
	random_hex,
	// clear_object
}