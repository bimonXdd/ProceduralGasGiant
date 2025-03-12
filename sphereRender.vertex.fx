#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec3 normal;
in vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform vec3 t;

// Varying
out vec3 vPosition;
out vec3 vNormal;
out vec3 vUV;

void main(void) {
    //vec3 t0 = vec3(0, -1, 0);
    // mat3 M0 = transpose(mat3(
    //     0., 0., 0.,
    //     1., 0., 0.,
    //     0., -1., 0.
    // ));
    //vUV = 2.*(vec3(uv.x, uv.y, 0.))-vec3(1., 1., 0.);
    //vUV = M0 * vUV;
    //vUV += t0;

   
    vec4 outPosition = worldViewProjection * vec4(position, 1.0);
    gl_Position = outPosition;
    vPosition = position;
    vNormal = normal;
}