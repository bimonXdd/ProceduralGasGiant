#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;

uniform mat4 worldViewProjection;
uniform int lightValue;

out vec3 vPosition;
out vec3 vNormal;
out vec2 vUV;

void main() {
    gl_Position = worldViewProjection * vec4(position, 1.0);
    vUV = uv;
    vPosition = position;
    vNormal = normal;
}
