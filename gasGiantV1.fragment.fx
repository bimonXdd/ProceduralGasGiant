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

void main(void) {

    vec2 targetUvPos = vec2(0.5,0.5);
    float stormSize = 0.06;
    float edgeSmoothness = 0.05;

    float dist = length(vUV - targetUvPos);
    float stormFalloff = smoothstep(stormSize, stormSize - edgeSmoothness, dist);

    vec3 st = vec3(vUV*1.,1.0);
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
    if (stormFalloff > 0.2)
    {
        stormColor = texture(textureSampler2, fract(vUV+q.x)).rgb; 
    } 

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
  
    fragColor = vec4(color, 1.);


}



