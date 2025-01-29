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

// Refs
uniform vec3 cameraPosition;
out vec4 fragColor;

vec2 randomGradient(vec2 p) {
    float random = fract(sin(dot(p, vec2(seed, 311.7))) * 43758.5453123);
    return vec2(cos(2.0 * 3.14159 * random), sin(2.0 * 3.14159 * random));
}

//Cubic Hermite interpolation 
vec2 fade(vec2 t) {
    return t * t * (3.0 - 2.0 * t);
}

float perlin(vec2 uv) {
    // Cell corners
    vec2 p0 = floor(uv);  // Bottom-left corner
    vec2 p1 = p0 + vec2(1.0, 0.0);  // Bottom-right corner
    vec2 p2 = p0 + vec2(0.0, 1.0);  // Top-left corner
    vec2 p3 = p0 + vec2(1.0, 1.0);  // Top-right corner

    // Local coordinates within the cell
    //fract(x) = x - floor(x).
    vec2 localPos = fract(uv);

    // Fade the local position
    vec2 fadePos = fade(localPos);

    // Gradients at each corner
    vec2 g0 = randomGradient(p0);
    vec2 g1 = randomGradient(p1);
    vec2 g2 = randomGradient(p2);
    vec2 g3 = randomGradient(p3);

    // Distance vectors
    vec2 d0 = localPos - vec2(0.0, 0.0);
    vec2 d1 = localPos - vec2(1.0, 0.0);
    vec2 d2 = localPos - vec2(0.0, 1.0);
    vec2 d3 = localPos - vec2(1.0, 1.0);

    // Dot products
    float dot0 = dot(g0, d0);
    float dot1 = dot(g1, d1);
    float dot2 = dot(g2, d2);
    float dot3 = dot(g3, d3);

    // Interpolate along x and y axes
    float lerpX0 = mix(dot0, dot1, fadePos.x);
    float lerpX1 = mix(dot2, dot3, fadePos.x);
    float value = mix(lerpX0, lerpX1, fadePos.y);

    return value;
}

void main(void) {
    const float zoom = 7.0;
    vec3 st = vec3(vUV*zoom,1.0);
    st += time * speed;
    
    float normalizedPerlin = (perlin(st.xy) + 1.0) * 0.5;

    float smoothPerlin = smoothstep(0.3, 0.7, normalizedPerlin);


//---------------------LIGHT START-----------
    vec3 vLightPosition = vec3(20,0,20);

    // World values
    vec3 vPositionW = vec3(world * vec4(vPosition, 1.0));
    vec3 vNormalW = normalize(vec3(world * vec4(vNormal, 0.0)));
    vec3 viewDirectionW = normalize(cameraPosition - vPositionW);

    // // Light
     vec3 lightVectorW = normalize(vLightPosition - vPositionW);
     
         
    // // diffuse
     float ndl = max(0., dot(vNormalW, lightVectorW));

     // Specular
     vec3 angleW = normalize(viewDirectionW + lightVectorW);
     float specComp = max(0., dot(vNormalW, angleW));
     specComp = pow(specComp, max(1., 64.)) * 5.;
//-----------------------LIGHT END--------------------------

//for light add *ndl

    fragColor = vec4(vec3(normalizedPerlin), 1.);
}