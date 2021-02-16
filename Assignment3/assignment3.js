    "use strict";

    var canvas;
    var gl;
    var vPosition;

    var up = vec3(0,1,0); 
    var eye = vec3(0, 0, 4.7);
    var at = vec3(0,0,2);
    var FOVY = 45;

    var translate_X = 0;
    var translate_Y = 0;
    var translate_Z = 0;
    var scaling = 1; 
    var rotate_X = 0;
    var rotate_Y = 0;
    var rotate_Z = 0;

    var color;
    var colorRed = 0;
    var colorGreen = 0;
    var colorBlue = 0;
    var speed = 1.5;

    var pyramidVertices, bufferPyramid; 
    var planeVertices, bufferPlane;
    var redWingVertices, bufferRedWing;
    var greenWingVertices, bufferGreenWing;
    var blueWingVertices, bufferBlueWing;

    var transformationMatrix, transformationMatrixLoc;
    var modelViewMatrix, modelViewMatrixLoc;
    var projectionMatrix, projectionMatrixLoc;




    window.onload = function init()
    {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Make the letters
    pyramidVertices = [
       vec3(0.0,  0.0,  -0.25),
       vec3(-0.3, -1.0, -0.25),
       vec3(0.3, -1.0,  -0.25),

       vec3(0.0,  0.0,  -0.25),
       vec3(-0.3, -1.0, -0.25),
       vec3(0.0, -1.0, -0.7),

       vec3(0.0,  0.0,  -0.25),
       vec3(0.0, -1.0, -0.7),
       vec3(0.3, -1.0, -0.25) 
    ];


    redWingVertices = [
        vec3(0.1, -0.2, -0.23),
        vec3(0.3, -0.2, -0.23),
        vec3(0.1, 0.2, -0.23),
        vec3(0.3, 0.2, -0.23)
    ];

    greenWingVertices = [
        vec3(0.4, -0.2, -0.24),
        vec3(0.6, -0.2, -0.24),
        vec3(0.4, 0.2, -0.24),
        vec3(0.6, 0.2, -0.24)
    ];

    blueWingVertices = [
        vec3(0.7,  -0.2, -0.235),
        vec3(0.9,  -0.2, -0.235),
        vec3(0.7,  0.2, -0.235),
        vec3(0.9,  0.2, -0.235)
    ];
    
    planeVertices = [
        vec3(1.2,  -1,  1),
        vec3(-1.2,  -1,  1),
        vec3(1.2,  -1, -2),
        vec3(-1.2,  -1, -2)
    ];


    
    bufferPlane = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferPlane );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(planeVertices), gl.STATIC_DRAW );

    bufferPyramid = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferPyramid );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pyramidVertices), gl.STATIC_DRAW );

    bufferRedWing = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferRedWing );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(redWingVertices), gl.STATIC_DRAW );

   
    bufferGreenWing = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferGreenWing );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(greenWingVertices), gl.STATIC_DRAW );

   
    bufferBlueWing = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferBlueWing );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(blueWingVertices), gl.STATIC_DRAW );

   
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    transformationMatrixLoc = gl.getUniformLocation( program, "transformationMatrix" );
	modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix");
	projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix");


    color = gl.getUniformLocation( program, "color" );

    document.getElementById("FOVY").oninput = function(event) {
        FOVY = event.target.value;
    };
    document.getElementById("cam_posX").oninput = function(event) {
        eye[0] = event.target.value;
    };
    document.getElementById("cam_posY").oninput = function(event) {
       eye[1] = event.target.value;
    };
    document.getElementById("cam_posZ").oninput = function(event) {
       eye[2] = event.target.value;
    };
    document.getElementById("cam_tarX").oninput = function(event) {
        at[0] = event.target.value;
    };
    document.getElementById("cam_tarY").oninput = function(event) {
        at[1] = event.target.value;
    };
    document.getElementById("cam_tarZ").oninput = function(event) {
       at[2] = event.target.value;
    };
    document.getElementById("inp_objX").oninput = function(event) {
        translate_X = event.target.value;
    };
    document.getElementById("inp_objY").oninput = function(event) {
        translate_Y = event.target.value;
    };
    document.getElementById("inp_objZ").oninput = function(event) {
        translate_Z = event.target.value;
    };
    document.getElementById("inp_obj_scale").oninput = function(event) {
        scaling=event.target.value;
    };
    document.getElementById("inp_obj_rotationX").oninput = function(event) {
        rotate_X=event.target.value;
    };
    document.getElementById("inp_obj_rotationY").oninput = function(event) {
        rotate_Y=event.target.value;
    };
    document.getElementById("inp_obj_rotationZ").oninput = function(event) {
        rotate_Z=event.target.value;
    };
    document.getElementById("inp_wing_speed").oninput = function(event) {
        speed = parseFloat(event.target.value);
    };
    document.getElementById("redSlider").oninput = function(event) {
        colorRed=event.target.value;
    };
    document.getElementById("greenSlider").oninput = function(event) {
        colorGreen=event.target.value;
    };
    document.getElementById("blueSlider").oninput = function(event) {
        colorBlue=event.target.value;
    };

    render();

    };

    var ramount = 0;

    function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
	
    transformationMatrix=mat4();
	modelViewMatrix=mat4();
    projectionMatrix=mat4();

    //initializing modelview matrix to lookAt() function 
    modelViewMatrix=lookAt(eye,at, up);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );

    //initializing projection matrix to perspective() function
    projectionMatrix=perspective(FOVY,1,2,20);

    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    //defining transformation matrix values by mult() function

    transformationMatrix=mult(transformationMatrix, translate(translate_X, translate_Y , translate_Z));
    transformationMatrix=mult(transformationMatrix, rotateX(rotate_X));
    transformationMatrix=mult(transformationMatrix, rotateY(rotate_Y));
    transformationMatrix=mult(transformationMatrix, rotateZ(rotate_Z));
    transformationMatrix=mult(transformationMatrix, scalem(scaling, scaling, scaling));

    //Pyramid
    
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
    gl.uniform4fv( color, flatten([colorRed, colorGreen, colorBlue, 1]));;
    
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferPyramid );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 9 );


    //changing rotation degree by speed taken from slider 
    ramount = ramount + speed;    

    transformationMatrix = mult(transformationMatrix, translate(-0.3, 0.2, 0));
    transformationMatrix = mult(transformationMatrix, translate(0.3, -0.35, 0));
    transformationMatrix = mult(transformationMatrix, rotateZ(ramount));
    transformationMatrix = mult(transformationMatrix, translate(-0.3, 0.1, 0));

    //Red Wing

    gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
    gl.uniform4fv( color, flatten([1, 0, 0, 1]));

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferRedWing );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4);


    //Green Wing

    transformationMatrix = mult(transformationMatrix, translate(-0.2, -0.3, 0));
    gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
    gl.uniform4fv( color, flatten([0 ,0 , 1, 1]));


    gl.bindBuffer( gl.ARRAY_BUFFER, bufferGreenWing );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
    
    
    transformationMatrix = mult(transformationMatrix, translate(0.7, 1.0, 0));
    transformationMatrix = mult(transformationMatrix, rotateZ(-90));
    
    //Blue Wing
    
    gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
    gl.uniform4fv ( color, flatten([0, 1, 0, 1]));

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferBlueWing );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    //Plane

    transformationMatrix=mat4(); //fixed color fixed position
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
    gl.uniform4fv( color, flatten([0.74509803921, 0.57647058823,0.39607843137, 1]));

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferPlane );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );


    window.requestAnimFrame(render);
}