#version 300 es
precision highp float;

// Varying
in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;
in vec2 vUV2; 

// Uniforms
uniform mat4 world;
uniform float time;
uniform float fbmValue;
uniform float speed;
uniform int fbmOctavesValue;
uniform int fbmShiftValue;
uniform float fbmAmplitudeValue;
// Refs
uniform vec3 cameraPosition;
uniform sampler2D textureSampler;
uniform sampler2D textureSampler2;

out vec4 fragColor;

float random (in vec3 st) {
    return fract(sin(dot(st.xyz,
                         vec3(12.9898,78.233,12.9898)))*
        43758.5453123);
}

float noise (in vec3 _st) {
    vec3 i = floor(_st);
    vec3 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec3(1.0, 0.0, 0.0));
    float c = random(i + vec3(0.0, 1.0, 0.0));
    float d = random(i + vec3(1.0, 1.0, 0.0));

    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}
vec2 randomGradient(vec2 p) {
    float random = fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    return vec2(cos(2.0 * 3.14159 * random), sin(2.0 * 3.14159 * random));
}
//https://thebookofshaders.com/13/
#define NUM_OCTAVES fbmOctavesValue
float fbm2 ( in vec3 st) {
    
    st.x *= 0.1;
    st.y *= 0.1;
  
    float v = fbmValue;
    float a = fbmAmplitudeValue;
    vec3 shift = vec3(float(fbmShiftValue));
    // Rotate to reduce axial bias
    mat3 rot = mat3(cos(0.5), -sin(0.5), 0.0,
                sin(0.5), cos(0.5), 0.0,
                0.0, 0.0, 0.0);

    for (int i = 0; i < NUM_OCTAVES; ++i) {
 
        v += a * noise(st);
        st = rot * st * 2.0 + shift;
        a *= 0.1;
    }
    v = mix(v, noise(st + vec3(0.1, 0.1, 0.1)), 0.10);  // Here, both are floats
    return v;
}
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

    vec2 targetUvPos = vec2(0.5,0.5);
    float stormSize = 0.06;
    float edgeSmoothness = 0.05;

    float dist = length(vUV - targetUvPos);
    float stormFalloff = smoothstep(stormSize, stormSize - edgeSmoothness, dist);

    const float zoom = 15.0;
    vec3 st = vec3(vUV*15.0,1.0);
    //st += st * abs(sin(time*0.1)*3.0);
    st += time* speed;
    vec3 q = vec3(0.1);
    q.x = fbm2( st);
    q.y = fbm2( st + vec3(1.0));

    vec3 r = vec3(0.);
    r.x = fbm2( st + 1.0*q + vec3(1.7,9.2,1.2)+ 0.15);
    r.y = fbm2( st + 1.0*q + vec3(8.3,2.8,1.2)+ 0.126);

 
    float f = fbm2(st*r);

//vec3 color = texture(textureSampler, clamp(vUV + f, 0.0, 1.0)).rgb; //must normalize, because otherwise artifacts presesnt (criss cross lines across planet)
    vec3 color = texture(textureSampler, fract(vUV+f)).rgb; 

    
    vec3 stormColor = texture(textureSampler, fract(vUV)).rgb; 

    color = mix(color, stormColor, stormFalloff);



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
float normalizedPerlin = (perlin(st.xy) + 1.0) * 0.5;

  float smoothPerlin = smoothstep(0.3, 0.7, normalizedPerlin);

    fragColor = vec4(vec3(smoothPerlin), 1.);


}



