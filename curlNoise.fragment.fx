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
    n = n * (n * n * 15731 + 789221) + 1376312589;
    return -1.0 + 2.0 * vec2( n & ivec2(0x0fffffff)) / float(0x0fffffff);
}

// Gradient noise function with derivatives
vec3 noised( in vec2 p ) {
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

void main() {



    // Get noise value based on position and time
    vec3 n = noised( 8.0 * vUV + time * 4.0 );

    vec2 velocity = vec2(n.z, -n.y);
    vec4 texColor = texture(textureSampler, vUV+velocity*speed/1000.0);

    // Generate the final color based on the noise
    vec3 col = 0.5 + 0.5 * ((vUV.x > 0.0) ? n.yzx : n.xxx);


    float rotatDeg = radians(45.0);
    vec2 rotatedUV = rotatDeg * vUV;

    mat2 rotation = mat2(cos(rotatDeg), -sin(rotatDeg), sin(rotatDeg), cos(rotatDeg));
        vec2 sinkVectorField = vec2(
        0.5-rotatedUV.x,
        0.5-rotatedUV.y
    );

    //sinkVectorField for sort of vortex vector field
    //fragColor = vec4(sinkVectorField,0.0, 1.0);
    fragColor = vec4(texColor.xyz, 1.0);

}