#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec3 normal;
in vec2 uv;

// Uniforms
uniform mat4 world;
uniform float time;
uniform float speed;
uniform float seed;
uniform samplerCube textureSampler;

uniform mat4 worldViewProjection;
uniform vec3 t;
uniform vec3 M1;
uniform vec3 M2;
uniform vec3 M3;
uniform vec3 spotCOLOR;
uniform vec3 spotCOLOR2;
uniform vec3 spotCOLOR3;
uniform float currentAmplitude;
uniform float curlSpeed;
uniform float jetSpeed;
uniform float blendValue;
uniform float vortexChangerate;
uniform float vortexFrequency;

// Varying
out vec3 vPosition;
out vec3 vNormal;
out vec3 vUV;

void main(void) {
    vec3 tester;
    vec3 t0 = t;
    mat3 M0 = transpose(mat3(
        M1,M2,M3
    )); 
    tester = 2. * vec3(uv.x, uv.y, 0.) - vec3(1., 1., 0.); //derivative (tuletis)
    //uv (0 - 1) aga see muudab uv(-1 - 1)
    tester = vec3(-tester.y, tester.x, 0.); //alam-maatriksid 90kraadi (tegelikult pole vajalik{muuda M'i vectorid})

    
    tester = M0 * tester;
    tester += t0;

    vUV = tester;
   
    vec4 outPosition = worldViewProjection * vec4(position, 1.0);
    gl_Position = outPosition;
    vPosition = position;
    vNormal = normal;
}