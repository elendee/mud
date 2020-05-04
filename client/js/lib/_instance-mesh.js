// material, geometry ....
// import SCENE from '../three/SCENE.js'

export default function( instance_number ){
	// var instanceNumbers = [ 200 , 1000 , 5000 , 20000 , 100000 ];
	var trsCache = [];
	var objectWrapper = new THREE.Object3D();
	objectWrapper.position.y = 3;
	// SCENE.add( objectWrapper );

	// for ( var i = 0 ; i < instanceNumbers[ 4 ] ; i ++ ){
	for ( var i = 0 ; i < instance_number ; i ++ ){

		var dummyObj = new THREE.Object3D(); //will hold position , rotation , scale 

		// dummyObj.position.set( Math.random() * 2 - 1 , 0 , Math.random() * 2 - 1 );
		// dummyObj.position.multiplyScalar( 14 );
		// dummyObj.rotation.set( Math.random() * pi2 , Math.random() * pi2 , Math.random() * pi2 );
		// dummyObj.scale.set( Math.random() + .5 , Math.random() + .5 , Math.random() + .5 );

		trsCache.push({
			position: new THREE.Vector3( Math.random() * 2 - 1 , 0 , Math.random() * 2 - 1 ).multiplyScalar( 14 ),
			rotation: new THREE.Euler(  Math.random() * pi2 , Math.random() * pi2 , Math.random() * pi2 ),
			scale: new THREE.Vector3( Math.random() + .5 , Math.random() + .5 , Math.random() + .5 )
		});

	}

	// instanceNumbers.forEach( function( iNum ){
	// instance_number.forEach( function( iNum ){

	for ( var g in geometries ){

		for ( var uScale = 0 ; uScale < 2 ; uScale ++ ){

			for ( var dynamic = 0 ; dynamic < 2 ; dynamic ++ ){

				// var instancedMesh = cache[ getKey( g , iNum , dynamic , uScale ) ] = new THREE.InstancedMesh(
				var instancedMesh = cache[ getKey( g , instance_number , dynamic , uScale ) ] = new THREE.InstancedMesh(

					//provide geometry
					geometries[ g ], 		

					//provide material
					materials[ options.material ],	

					//how many instances to allocate
					// iNum, 								
					instance_number, 								
					
					//matrix initialization, if ommited will set identity matrix at each index
					function( placementObject , i ){

						//copy from outside holders
						var source = trsCache[i];

						placementObject.position.copy( source.position );

						placementObject.rotation.copy( source.rotation );

						if( !uScale ){
							placementObject.scale.copy( source.scale );
						}

						//InstancedMesh will automatically extract the matrix from this object at this index
					},

						//is the scale known to be uniform, will do less shader work, improperly applying this will result in wrong shading 
					!!uScale

				);

				instancedMesh.visible = false;

				instancedMesh.castShadow = true;

				instancedMesh.receiveShadow = true;

				objectWrapper.add( instancedMesh );

			}

		}

	}

	// });


	return objectWrapper

}





