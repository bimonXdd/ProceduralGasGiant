#version 300 es
precision highp float;

in vec3 position;  // Vertex position (location 0)
in vec2 uv;        // UV coordinates (location 1)

out vec3 vPosition;
out vec2 vUV; // Output UV to pass to the fragment shader (no location, as it's just passing data)

uniform mat4 worldViewProjection;

void main() {
    // Pass UVs directly from the vertex shader to the fragment shader
    vUV = uv;

    // Apply the model-view-projection matrix to the vertex position
    vec4 outPosition = worldViewProjection * vec4(position, 1.0);
    gl_Position = outPosition;
}
