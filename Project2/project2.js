/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: 
 *      @task4: 
 * 		setMesh, draw, setAmbientLight, setSpecularLight and enableLighting functions 
 */


function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');

		this.colorLoc = gl.getUniformLocation(this.prog, 'color');

		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');


		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();

		this.numTriangles = 0;

		/**
		 * @Task2 : You should initialize the required variables for lighting here
		 */
		this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');
		this.ambientLightLoc = gl.getUniformLocation(this.prog, 'ambient');
		this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');

		this.specularLightLoc = gl.getUniformLocation(this.prog, 'specularLight');
		this.shininessLoc = gl.getUniformLocation(this.prog, 'shininess');
		// Initialize default lighting parameters
		this.lightingEnabled = false;
		this.ambient = 0.2; // Example ambient value
		this.specularIntensity = 0.5; // Example specular intensity
		this.shininess = 32.0; // Example shininess factor

		this.secondTexLoc = gl.getUniformLocation(this.prog, 'secondTex');
		this.useSecondTexLoc = gl.getUniformLocation(this.prog, 'useSecondTex');
		
		
		
	}

	setMesh(vertPos, texCoords, normalCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// update texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		

		/**
		 * @Task2 : You should update the rest of this function to handle the lighting
		 */
		this.normbuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);
		this.numTriangles = vertPos.length / 3;

	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		gl.useProgram(this.prog);

		gl.uniformMatrix4fv(this.mvpLoc, false, trans);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

		/**
		 * @Task2 : You should update this function to handle the lighting
		 */
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
		const normalLoc = gl.getAttribLocation(this.prog, 'normal');
		gl.enableVertexAttribArray(normalLoc);
		gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
		gl.uniform3f(this.lightPosLoc, lightX, lightY, 2.0);

		gl.uniform1f(this.specularLightLoc, specularIntensity);
		gl.uniform1f(this.shininessLoc, shininessValue);

		///////////////////////////////
		


		
		updateLightPos();
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);


	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img, isSecond = false) { // Ensure a default value for isSecond
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
	
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img
		);
	
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.LINEAR);
		}
	
		gl.useProgram(this.prog);
	
		if (isSecond) {
			this.secondTexture = texture;
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.secondTexture);
			gl.uniform1i(this.secondTexLoc, 1); // Bind to texture unit 1
			gl.uniform1i(this.useSecondTexLoc, true);
		} else {
			this.mainTexture = texture;
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.mainTexture);
			const sampler = gl.getUniformLocation(this.prog, 'tex');
			gl.uniform1i(sampler, 0); // Bind to texture unit 0
		}
	}
	
	setSpecularLight(specular) {
		gl.useProgram(this.prog);
		gl.uniform1f(this.specularLightLoc, specular);
	}

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}

	enableLighting(enable) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.enableLightingLoc, enable);
	}
	
	setAmbientLight(ambient) {
		gl.useProgram(this.prog);
		gl.uniform1f(this.ambientLightLoc, ambient);
	}
	
}


function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}

// Vertex shader source code
const meshVS = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec3 normal;

			uniform mat4 mvp; 

			varying vec2 v_texCoord; 
			varying vec3 v_normal; 

			void main()
			{
				v_texCoord = texCoord;
				v_normal = normal;

				gl_Position = mvp * vec4(pos,1);
			}`;

// Fragment shader source code
/**
 * @Task2 : You should update the fragment shader to handle the lighting
 */
const meshFS = `
			precision mediump float;

			uniform bool showTex;
			uniform bool enableLighting;
			uniform sampler2D tex;
			uniform sampler2D secondTex; // New
			uniform bool useSecondTex;   // New
			uniform vec3 color;
			uniform vec3 lightPos;
			uniform float ambient;
			uniform float specularLight;
			uniform float shininess;

			varying vec2 v_texCoord;
			varying vec3 v_normal;

			void main() {
				if (showTex && enableLighting) {
					vec3 normal = normalize(v_normal);
					vec3 lightDir = normalize(lightPos);
					vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));

					// Diffuse lighting
					float diff = max(dot(normal, lightDir), 0.0);

					// Specular lighting
					vec3 reflectDir = reflect(-lightDir, normal);
					float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess) * specularLight;

					// Ambient light
					vec3 ambientLight = vec3(ambient);
					vec3 lighting = ambientLight + diff * vec3(1.0, 1.0, 1.0) + spec * vec3(1.0, 1.0, 1.0);

					// Fetch base texture
					vec4 texColor = texture2D(tex, v_texCoord);

					// Fetch second texture if enabled
					vec4 secondTexColor = useSecondTex ? texture2D(secondTex, v_texCoord) : vec4(0.0);

					// Blend textures (e.g., averaging them)
					vec3 finalTexColor = useSecondTex ? mix(texColor.rgb, secondTexColor.rgb, 0.5) : texColor.rgb;

					// Apply lighting to the blended texture color
					vec3 finalColor = finalTexColor * lighting;

					gl_FragColor = vec4(finalColor, texColor.a);
				} else if (showTex) {
					gl_FragColor = texture2D(tex, v_texCoord);
				} else {
					gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
				}
			}`;

// Light direction parameters for Task 2
var lightX = 1;
var lightY = 1;

const keys = {};
function updateLightPos() {
	const translationSpeed = 1;
	if (keys['ArrowUp']) lightY -= translationSpeed;
	if (keys['ArrowDown']) lightY += translationSpeed;
	if (keys['ArrowRight']) lightX -= translationSpeed;
	if (keys['ArrowLeft']) lightX += translationSpeed;
}
function LoadTexture2(param) {
    if (param.files && param.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                meshDrawer.setTexture(img, true); // Pass `true` to indicate this is the second texture
                DrawScene();
            };
        };
        reader.readAsDataURL(param.files[0]);
    }
}
let specularIntensity = 1.0;
let shininessValue = 32.0;

// Function to update specular intensity
function SetSpecularLight(param) {
    specularIntensity = param.value / 100;
    MeshDrawer.setSpecularLight(specularIntensity);
    DrawScene();
}


///////////////////////////////////////////////////////////////////////////////////