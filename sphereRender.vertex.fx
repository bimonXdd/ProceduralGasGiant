#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec3 normal;
in vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform vec3 t;
uniform int lightValue;

// Varying
out vec3 vPosition;
out vec3 vNormal;
out vec3 vUV;

void main(void) {

    vec4 outPosition = worldViewProjection * vec4(position, 1.0);
    gl_Position = outPosition;
    vPosition = position;
    vNormal = normal;
}