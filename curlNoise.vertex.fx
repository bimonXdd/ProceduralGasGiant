#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec3 normal;
in vec2 uv;
in vec2 uv2;

// Uniforms
uniform mat4 worldViewProjection;

// Varying
out vec3 vPosition;
out vec3 vNormal;
out vec2 vUV;
out vec2 vUV2;

void main(void) {
    vec4 outPosition = worldViewProjection * vec4(position, 1.0);
    gl_Position = outPosition;
    vUV = uv;
    vUV2 = uv2;
    vPosition = position;
    vNormal = normal;
}