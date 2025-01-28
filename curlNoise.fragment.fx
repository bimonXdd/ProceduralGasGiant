#version 300 es
precision highp float;

in vec2 vUV; // Input UV coordinates
uniform sampler2D particleDataTexture;  // Texture that stores particle data (position, velocity, speed)
uniform float time;  // Time to animate particles
uniform vec2 noiseScale;  // Scale of the noise (controls the frequency)

out vec4 fragColor;

// Simplex/Perlin noise function (2D)
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    // Sample the texture to get particle data (position, velocity, speed)
    vec4 data = texture(particleDataTexture, vUV);
    
    float x = data.r;  // X position
    float y = data.g;  // Y position
    float z = data.b;  // Velocity (if you want to use it for some purpose)
    float speed = data.a;  // Speed (from alpha channel)
    
    // Use noise to modify the particle movement dynamically
    // We can use noise to get some random but smooth variation
    vec2 noiseInput = vec2(x, y) * noiseScale + vec2(time * 0.05);  // Add time for dynamic noise
    float noiseValue = noise(noiseInput);  // Generate noise based on position and time
    
    // Add noise-based offset to velocity (or position)
    vec3 particleColor = vec3(x + noiseValue * 0.05, y + noiseValue * 0.05, z);  // Color depends on position + noise
    
    // Optionally, you can add more noise effects to modify other properties like speed, opacity, etc.
    // For example, modulate speed with noise:
    float speedVariation = speed + noise(noiseInput * 2.0) * 0.2;  // Speed variation with noise
    particleColor *= speedVariation;  // Multiply color intensity with speed

    // Set the final particle color with alpha fixed to 1 (opaque)
    fragColor = vec4(particleColor, 1.0);
}
