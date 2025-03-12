#version 300 es
precision highp float;
#define DISABLE_UNIFORMITY_ANALYSIS
// Varying
in vec3 vPosition;
in vec3 vNormal;
in vec3 vUV;

uniform mat4 world;
uniform float time;
uniform float speed;
uniform float seed;
uniform samplerCube textureSampler;

// Refs
uniform vec3 cameraPosition;
out vec4 fragColor;

void main() {
    vec3 normalizedUV = normalize(vPosition);
    vec3 tex = texture(textureSampler, normalizedUV).rgb; 
    fragColor = vec4(tex, 1.0);
}