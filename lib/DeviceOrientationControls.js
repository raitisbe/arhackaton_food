/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function( object ) {

	var scope = this;

	this.object = object;
	this.object.rotation.reorder( "YXZ" );

	this.enabled = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	this.alpha = 0;
	this.alphaOffsetAngle = 0;


	var onDeviceOrientationChangeEvent = function( event ) {

		scope.deviceOrientation = event;

	};

	var onScreenOrientationChangeEvent = function() {

		scope.screenOrientation = window.orientation || 0;

	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

    var cords = ['x', 'y', 'z'];
    var KM = {};
    var KO = {};
    var direction_correction = parseFloat(localStorage.getItem("direction_correction")) || 0;
    
	var setObjectQuaternion = function() {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function( quaternion, alpha, beta, gamma, orient ) {
            
		
        var camera = {x: alpha, y: beta, z: gamma };
        //camera.z  += Math.PI * 2.0;
        //camera.x += Math.PI * 2.0;
        //camera.y += Math.PI * 2.0;
        if(typeof KM.x == 'undefined'){
            for(var i=0; i<cords.length; i++){
                var x_0 = $V([camera[cords[i]]]);
                var P_0 = $M([[1]]);
                var F_k=$M([[1]]);
                var Q_k=$M([[0.2]]);
                KM[cords[i]] = new KalmanModel(x_0,P_0,F_k,Q_k);

                var z_k = $V([camera[cords[i]]]);
                var H_k = $M([[1]]);
                var R_k = $M([[4]]);
                KO[cords[i]] = new KalmanObservation(z_k,H_k,R_k);
            }
        }
    
        for(var i=0; i<cords.length; i++){
            if(KO[cords[i]]){
                z_k = $V([camera[cords[i]]]);
                KO[cords[i]].z_k=z_k;
                KM[cords[i]].update(KO[cords[i]]);
            }
        }
        
        alpha = KM.x.x_k.elements[0];
        alpha += direction_correction;
        beta = KM.y.x_k.elements[0];
        gamma = KM.z.x_k.elements[0];
        //console.log(alpha, beta, gamma, orient);

        
            euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler ); // orient the device

			quaternion.multiply( q1 ); // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation
    
		}

	}();

	this.connect = function() {

		onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = true;

	};

	this.disconnect = function() {

		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = false;

	};    
    
	this.update = function() {

		if ( scope.enabled === false ) return;

		var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) + this.alphaOffsetAngle : 0; // Z
		var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad( scope.deviceOrientation.beta ) : 0; // X'
		var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
		var orient = scope.screenOrientation ? THREE.Math.degToRad( scope.screenOrientation ) : 0; // O

		setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
		this.alpha = alpha;

	};

	this.updateAlphaOffsetAngle = function( angle ) {

		this.alphaOffsetAngle = angle;
		this.update();

	};

	this.dispose = function() {

		this.disconnect();

	};
    
    document.addEventListener('touchstart', handleTouchStart, false);        
    document.addEventListener('touchmove', handleTouchMove, false);

    var xDown = null;                                                        
    var yDown = null;                                                        

    function handleTouchStart(evt) {                                         
        xDown = evt.touches[0].clientX;                                      
        yDown = evt.touches[0].clientY;                                      
    };                                                

    function handleTouchMove(evt) {
        if ( ! xDown || ! yDown ) {
            return;
        }

        var xUp = evt.touches[0].clientX;                                    
        var yUp = evt.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
            direction_correction -= xDiff / 100.0;
            localStorage.setItem("direction_correction", direction_correction);                       
        } else {
            drone_pos.altitude += yDiff / 20;
            if(drone_pos.altitude<0.02)
                    drone_pos.altitude = 0.02;
            drone.position.y = plane_size + drone_pos.altitude;                                                             
            droneshadow.scale.set(drone_pos.altitude, drone_pos.altitude, drone_pos.altitude);
        }
        /* reset values */
        xDown = null;
        yDown = null;                                             
    };

	this.connect();

};
