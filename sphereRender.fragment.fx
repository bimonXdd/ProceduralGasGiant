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
uniform int lightValue;

// Refs
uniform vec3 cameraPosition;
out vec4 fragColor;

vec3 phongLightingNoSpecular(vec3 baseColor, vec3 normal, vec3 lightDir, vec3 lightColor, float ambientStrength)
{
    normal = normalize(normal);
    lightDir = normalize(lightDir);

    // Ambient
    vec3 ambient = ambientStrength * lightColor;

    // Diffuse
    float diff = max(dot(normal, lightDir), 0.0);
    diff = pow(diff, 2.7);

    vec3 diffuse = diff * lightColor;
 
    vec3 lighting = ambient + diffuse;

    return baseColor * lighting;
}

void main() {
    vec3 normalizedUV = normalize(vPosition);
    vec3 tex = texture(textureSampler, normalizedUV).rgb; 

    vec3 lightDir = normalize(vec3(1.0, 1.0, 0.0)); // Example light direction
    vec3 lightColor = vec3(1.0); // White light
    float ambientStrength = 0.01;
    vec3 litColor = phongLightingNoSpecular(tex, normalizedUV, lightDir, lightColor, ambientStrength);

    if (lightValue == 1) {
        fragColor = vec4(litColor, 1.0);
    } else {
        fragColor = vec4(tex, 1.0);
    }
}