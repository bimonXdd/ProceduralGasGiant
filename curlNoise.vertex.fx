#version 300 es
precision highp float;

in vec3 position;  // Position of the particle on the plane
in vec2 uv;        // UV coordinates from the texture

uniform mat4 worldViewProjection;  // Transformation matrix to project the particle into 3D space
uniform mat4 world;  // Optional: if you want to manipulate individual particles later

out vec2 vUV;  // Passing the UV to the fragment shader

void main() {
    vUV = uv;  // Pass the UV coordinates to the fragment shader
    gl_Position = worldViewProjection * vec4(position, 1.0);  // Apply the transformation matrix to the particle position
}
