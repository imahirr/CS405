function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([
        0.1767767, -0.3061862,  0.9185586,  0.3,
        0.4330127,  0.8838835, -0.1767767, -0.25,
       -0.8838835,  0.3535534,  0.3061862,  0.0,
        0.0,        0.0,        0.0,        1.0
    ]);
    
    return getTransposeMatrix(transformationMatrix);
}


/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {
    // calculate the model view matrix by using the transformation
    // methods and return the modelView matrix in this method

    // scaling part
    const scaleX = 0.5;
    const scaleY = 0.5;
    const scaleZ = 1.0;  // no scaling on z-axis
    const scaleMatrix = createScaleMatrix(scaleX, scaleY, scaleZ);
    
    // rotation part
    let rotation = [30, 45, 60];  // Rotation angles in degrees

    // Convert degrees to radians (week 3 recit)
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
    const rotationMatrixX = createRotationMatrix_X(degToRad(rotation[0]));
    const rotationMatrixY = createRotationMatrix_Y(degToRad(rotation[1]));
    const rotationMatrixZ = createRotationMatrix_Z(degToRad(rotation[2]));
  
    // translation part
    let translation = [0.3, -0.25, 0]; // Translate by (0.3, -0.25, 0)
    
    const translationMatrix = createTranslationMatrix(translation[0], translation[1], translation[2]);
  
    // combine all, as scaling * rotation * translation
    let modelViewMatrix = multiplyMatrices(scaleMatrix, rotationMatrixX);
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixY);
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixZ);
    modelViewMatrix = multiplyMatrices(modelViewMatrix, translationMatrix);
    console.log("Model-View Matrix:", modelViewMatrix);
    return modelViewMatrix;
}

/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */
// In utils.js file
function getPeriodicMovement(startTime) {

    // Helper function to interpolate between two matrices
    function interpolateMatrix(matrixA, matrixB, t) {
        const resultMatrix = [];
        for (let i = 0; i < matrixA.length; i++) {
            resultMatrix[i] = (1 - t) * matrixA[i] + t * matrixB[i];
        }
        return resultMatrix;
    }
    const currentTime = Date.now(); // Get the current time in milliseconds
    const elapsedTime = (currentTime - startTime) / 1000; // Convert time to seconds

    const period = 10; // Total animation period in seconds
    const halfPeriod = period / 2; // Half of the period (5 seconds)
    
    // Calculate the fraction of time within the 10-second cycle
    const cycleTime = elapsedTime % period;

    let transformationMatrix;

    if (cycleTime <= halfPeriod) {
        // First 5 seconds: interpolate from initial position to target
        const progress = cycleTime / halfPeriod; // A value from 0 to 1
        const targetMatrix = getModelViewMatrix(); // Get the target transformation matrix
        
        // Interpolate between initial matrix (identity) and target matrix
        transformationMatrix = interpolateMatrix(createIdentityMatrix(), targetMatrix, progress);
    } else {
        // Last 5 seconds: interpolate back to the initial position
        const progress = (cycleTime - halfPeriod) / halfPeriod; // A value from 0 to 1
        const targetMatrix = getModelViewMatrix(); // Get the target transformation matrix
        
        // Interpolate between target matrix and initial matrix (identity)
        transformationMatrix = interpolateMatrix(targetMatrix, createIdentityMatrix(), progress);
    }

    return transformationMatrix;
}








  




