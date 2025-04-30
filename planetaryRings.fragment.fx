#version 300 es
precision highp float;

in vec2 vUV;
in vec3 vPosition; 
in vec3 vNormal; 
out vec4 fragColor;
uniform sampler2D textureSampler;
uniform int lightValue;

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

vec3 phongLightingNoSpecular(vec3 baseColor, vec3 normal, vec3 lightDir, vec3 lightColor, float ambientStrength)
{
    normal = normalize(normal);
    lightDir = normalize(lightDir);

    // Ambient
    vec3 ambient = ambientStrength * lightColor;

    // Diffuse
    float diff = max(dot(normal, lightDir), 0.1);
    diff = pow(diff, 1.9);
    diff *= 1.85;
    vec3 diffuse = diff * lightColor;
    
    vec3 lighting = ambient + diffuse;

    // Apply lighting to base color
    return baseColor * lighting;
}

void main() {
    vec2 center = vec2(0.5);
    float outerRadius = 0.5;
    float innerRadius = 0.2;
    float edgeSmoothness = 0.2;

    float dist = length(vUV - center);

    // Fade in from innerRadius and fade out toward outerRadius
    float fadeIn  = smoothstep(innerRadius, innerRadius + edgeSmoothness, dist);
    float fadeOut = smoothstep(outerRadius - edgeSmoothness, outerRadius, dist);

    float alpha = fadeIn * (1.0 - fadeOut);

    vec3 texColor = texture(textureSampler, vUV).rgb;
    if (dist > 0.4 && dist < 0.401){
        alpha = 0.0;
    } else if (dist > 0.403 && dist < 0.41){
        alpha = 0.0;
    }

    vec3 normalizedUV = normalize(vPosition);

    vec3 lightDir = normalize(vec3(0.0, 0.5, 1.0)); // Example light direction
    vec3 lightColor = vec3(1.0); // White light
    float ambientStrength = 0.01;
    vec3 litColor = phongLightingNoSpecular(texColor, normalizedUV, lightDir, lightColor, ambientStrength);
    if (lightValue == 1) {
        fragColor = vec4(litColor, alpha);
    } else {
        fragColor = vec4(texColor, alpha);
    }
}
