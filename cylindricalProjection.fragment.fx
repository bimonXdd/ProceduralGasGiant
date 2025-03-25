#version 300 es
precision highp float;
uniform samplerCube textureSampler;
in vec2 vUV;
out vec4 fragColor;


void main() {
    vec2 UV2 = (vUV*2)-1.0;
    // Cylindrical equal-area projection formula
    float theta = UV2.x * 3.14159265;  // Longitude in radians
    float y = UV2.y;                   // Preserved in equal-area projection

    float x = cos(theta) * sqrt(1.0 - y * y);
    float z = sin(theta) * sqrt(1.0 - y * y);

    vec3 direction = normalize(vec3(x, y, z));

    // Sample cube map
    fragColor = vec4(texture(textureSampler, direction).xyz, 1.);
}