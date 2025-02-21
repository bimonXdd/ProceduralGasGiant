#version 300 es
precision highp float;

// Varying
in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;

uniform mat4 world;
uniform float time;
uniform float speed;
uniform float seed;
uniform sampler2D textureSampler;
uniform sampler2D textureSampler2;

// Refs
uniform vec3 cameraPosition;
out vec4 fragColor;

struct Particle {
    vec2 position;
    vec2 velocity;
};

// 2D hash function (non-production ready)
vec2 hash( in ivec2 p ) {
    ivec2 n = p.x * ivec2(3, 37) + p.y * ivec2(311, 113);
    n = (n << 13) ^ n;
    n = n * (n * n * int(seed) + int(seed*seed/3.14)) + 1376312589;
    return -1.0 + 2.0 * vec2( n & ivec2(0x0fffffff)) / float(0x0fffffff);
}

// Gradient noise function with derivatives
vec3 noised( in vec2 p) {
    ivec2 i = ivec2(floor(p));       // Grid cell
    vec2 f = fract(p);               // Fractional part of p

    // Interpolation (cubic or quintic)
    vec2 u = f * f * (3.0 - 2.0 * f);
    vec2 du = 6.0 * f * (1.0 - f);
    
    // Hashing for grid corner gradients
    vec2 ga = hash(i + ivec2(0, 0));
    vec2 gb = hash(i + ivec2(1, 0));
    vec2 gc = hash(i + ivec2(0, 1));
    vec2 gd = hash(i + ivec2(1, 1));

    // Compute dot products for the noise value
    float va = dot(ga, f - vec2(0.0, 0.0));
    float vb = dot(gb, f - vec2(1.0, 0.0));
    float vc = dot(gc, f - vec2(0.0, 1.0));
    float vd = dot(gd, f - vec2(1.0, 1.0));

    // Interpolate the noise value and its derivatives
    vec3 value = vec3( va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * (va - vb - vc + vd), 
                       ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) + 
                       du * (u.yx * (va - vb - vc + vd) + vec2(vb, vc) - va));
    return value;
}

vec4 gridBlur(vec4 staticSample, vec2 gridUV)
{
        // Apply a simple blur by averaging neighboring pixels around the grid point
        float blurRadius = 2.0;  // Adjust this to control how much blur is applied
        vec4 blurredColor = vec4(0.0);
        float totalWeight = 0.0;

        // Loop over a small area around the grid point
        for (float dx = -blurRadius; dx <= blurRadius; dx++) {
            for (float dy = -blurRadius; dy <= blurRadius; dy++) {
                vec2 offset = vec2(dx, dy) / vec2(textureSize(textureSampler, 0));  // Convert to UV space
                vec4 sampleX = texture(textureSampler, gridUV + offset);

                // Calculate the weight based on distance from the grid point
                float weight = exp(-0.5 * (dx * dx + dy * dy) / (blurRadius * blurRadius));  // Gaussian weight
                blurredColor += sampleX * weight;
                totalWeight += weight;
            }
        }

        // Normalize the color
        blurredColor /= totalWeight;

        // Weighted blend between original staticSample and the blurred background
        float blendFactor = 0.0;  // % of the background blur added to each 
    return mix(staticSample, blurredColor, blendFactor);;
}

void main() {
    vec2 tex = vUV;

    //----------------------------------GRID Start----------------------------------------------------
    float gridSize = 30.0;
    // Convert UV coordinates to screen-space coordinates
    vec2 screenUV = vUV * vec2(textureSize(textureSampler, 0));

    // Find the nearest grid point in screen space
    vec2 gridPoint = (floor(screenUV / gridSize) + 0.5) * gridSize;
    // Convert the grid point back to UV space
    vec2 gridUV = gridPoint / vec2(textureSize(textureSampler, 0));

    vec4 staticSample = texture(textureSampler, gridUV);        //Original picture sampled
    
    // Calculate the distance from the current pixel to the nearest grid point
    float dist = length(screenUV - gridPoint);
    // Define a threshold for how close a pixel needs to be to the grid point
    float pointRadius = 1.0; // Adjust to control point siz
    if (dist < pointRadius) {
        fragColor = gridBlur(staticSample, gridUV);
        return;
    }

    //----------------------------------GRID END----------------------------------------------------

    vec3 n = noised(tex*19.0);

    //add quake lava motion to keep the gradient moving and thus the simulation moving 
    //Otherwise artifacts present (mixing and movement kind of stops)
    float wavyFreq = 0.0002;
    float wavyAmp = 0.1;
    n.y = n.y + sin(time * speed/10000.0 +n.z * wavyFreq)*wavyAmp;
    n.z = n.z + sin(time * speed/10000.0 +n.y * wavyFreq)*wavyAmp;



    //vec2 velocity = vec2(n.z, -n.y);
    //vec2 velocity = vec2(10.,0.);   // straight to right

    float waveAmplitude = 0.1;
    vec2 rightMainMotion = vec2(10. ,sin(time/1000.0 * tex.x)*waveAmplitude);     //Right with a sine wave
    
    float vortexIntensity = 10.0;
    vec2 vortexLocation = vec2(.5);
    vec2 vortex = vec2(-(tex.y-vortexLocation.y), tex.x-vortexLocation.x)*vortexIntensity;
    vec4 texColor = texture(textureSampler, tex+(vortex+rightMainMotion)*speed/1000.0);

 
    fragColor = vec4(texColor.xyz, 1.0);

}