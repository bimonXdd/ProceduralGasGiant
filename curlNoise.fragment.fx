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

uniform mat4 worldViewProjection;
uniform vec3 t;
uniform vec3 M1;
uniform vec3 M2;
uniform vec3 M3;
uniform vec3 spotCOLOR;
uniform vec3 spotCOLOR2;
uniform vec3 spotCOLOR3;
uniform vec3 currentCOLORstorm;
uniform float stormXValue;
uniform float stormYValue;
uniform float stormSizeValue;
uniform float currentFrequency;
uniform float curlSpeed;
uniform float jetSpeed;
uniform float blendValue;
uniform float vortexChangerate;
uniform float vortexFrequency;

out vec4 fragColor;

struct Particle {
    vec2 position;
    vec2 velocity;
};

// 2D hash function
vec2 hash( in ivec2 p ) {
    ivec2 n = p.x * ivec2(3, 37) + p.y * ivec2(311, 113);
    n = (n << 13) ^ n;
    n = n * (n * n * int(seed) + int(seed*seed/3.14)) + 1376312589;
    return -1.0 + 2.0 * vec2( n & ivec2(0x0fffffff)) / float(0x0fffffff);
}


vec3 hash2( vec3 p )
{                        
	ivec3 n = ivec3( p.x*127 + p.y*311 + p.z*74,
                     p.x*269 + p.y*183 + p.z*246,
                     p.x*113 + p.y*271 + p.z*124);

	// 1D hash by Hugo Elias
	n = (n << 13) ^ n;
    n = n * (n * n * int(seed) + 789221) + 1376312589;
    return -1.0+2.0*vec3( n & ivec3(0x0fffffff))/float(0x0fffffff);
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
vec4 noised2( in vec3 x , in vec3 vNormal)
{
    // grid
    vec3 p = floor(x);
    vec3 w = fract(x);
    
    // quintic interpolant (smoothing)
    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    vec3 du = 30.0*w*w*(w*(w-2.0)+1.0);
    
    //gradient - dot(gradient, normal) * normal;

    // gradients (quite random for noise)
    vec3 ga = hash2( p+vec3(0.0,0.0,0.0) );
    vec3 gb = hash2( p+vec3(1.0,0.0,0.0) );
    vec3 gc = hash2( p+vec3(0.0,1.0,0.0) );
    vec3 gd = hash2( p+vec3(1.0,1.0,0.0) );
    vec3 ge = hash2( p+vec3(0.0,0.0,1.0) );
    vec3 gf = hash2( p+vec3(1.0,0.0,1.0) );
    vec3 gg = hash2( p+vec3(0.0,1.0,1.0) );
    vec3 gh = hash2( p+vec3(1.0,1.0,1.0) );
    
    //projections2 (gradient is on the surface of the sphere)
    //projection rejection formula
    vec3 gaP = ga - dot(ga, vNormal) * vNormal; 
    vec3 gbP = gb - dot(gb, vNormal) * vNormal; 
    vec3 gcP = gc - dot(gc, vNormal) * vNormal; 
    vec3 gdP = gd - dot(gd, vNormal) * vNormal; 
    vec3 geP = ge - dot(ge, vNormal) * vNormal; 
    vec3 gfP = gf - dot(gf, vNormal) * vNormal; 
    vec3 ggP = gg - dot(gg, vNormal) * vNormal; 
    vec3 ghP = gh - dot(gh, vNormal) * vNormal; 
    

    // projections
    float va = dot( gaP, w-vec3(0.0,0.0,0.0) );
    float vb = dot( gbP, w-vec3(1.0,0.0,0.0) );
    float vc = dot( gcP, w-vec3(0.0,1.0,0.0) );
    float vd = dot( gdP, w-vec3(1.0,1.0,0.0) );
    float ve = dot( geP, w-vec3(0.0,0.0,1.0) );
    float vf = dot( gfP, w-vec3(1.0,0.0,1.0) );
    float vg = dot( ggP, w-vec3(0.0,1.0,1.0) );
    float vh = dot( ghP, w-vec3(1.0,1.0,1.0) );
	
    // interpolation
    float v = va + 
              u.x*(vb-va) + 
              u.y*(vc-va) + 
              u.z*(ve-va) + 
              u.x*u.y*(va-vb-vc+vd) + 
              u.y*u.z*(va-vc-ve+vg) + 
              u.z*u.x*(va-vb-ve+vf) + 
              u.x*u.y*u.z*(-va+vb+vc-vd+ve-vf-vg+vh);
              
    vec3 d = ga + 
             u.x*(gb-ga) + 
             u.y*(gc-ga) + 
             u.z*(ge-ga) + 
             u.x*u.y*(ga-gb-gc+gd) + 
             u.y*u.z*(ga-gc-ge+gg) + 
             u.z*u.x*(ga-gb-ge+gf) + 
             u.x*u.y*u.z*(-ga+gb+gc-gd+ge-gf-gg+gh) +   
             du * (vec3(vb-va,vc-va,ve-va) + 
                   u.yzx*vec3(va-vb-vc+vd,va-vc-ve+vg,va-vb-ve+vf) + 
                   u.zxy*vec3(va-vb-ve+vf,va-vb-vc+vd,va-vc-ve+vg) + 
                   u.yzx*u.zxy*(-va+vb+vc-vd+ve-vf-vg+vh) );
                   
    return vec4( v, d );                   
}

vec3 vortexField(vec3 p) {
    float gamma = 1.5; // Vortex strength
    return gamma * vec3(-p.y, p.x, 0.0); 
}

// used instead of pow because the arg of pow can't be negative
vec3 oklab_mix_pow_helper (vec3 x){
    return sign(x) * pow(abs(x), vec3(1.0/3.0));
}

//small color correction used instead of mix
// https://bottosson.github.io/posts/oklab
//Method from https://www.shadertoy.com/view/ttcyRS
vec3 oklab_mix( vec3 colA, vec3 colB, float h )
{
    mat3 kCONEtoLMS = mat3(                
            0.4121656120,  0.2118591070,  0.0883097947,
            0.5362752080,  0.6807189584,  0.2818474174,
            0.0514575653,  0.1074065790,  0.6302613616);
    mat3 kLMStoCONE = mat3(
            4.0767245293, -1.2681437731, -0.0041119885,
        -3.3072168827,  2.6093323231, -0.7034763098,
            0.2307590544, -0.3411344290,  1.7068625689);

    // rgb to cone (arg of pow can't be negative)
    vec3 lmsA = oklab_mix_pow_helper( kCONEtoLMS * colA );
    vec3 lmsB = oklab_mix_pow_helper( kCONEtoLMS * colB );
    //lerp
    vec3 lms = mix( lmsA, lmsB, h );

    // cone to rgb
    return kLMStoCONE*(lms*lms*lms);
}

vec3 storms(vec3 stormLocation, vec3 posOnsphere, float speed, float stormSizeValue){
    float distanceFromStormCenter = length(stormLocation - posOnsphere);
        if (length(stormLocation - posOnsphere) < stormSizeValue) { // kui vektori pikkus suurem kui 0.2, siis curl
            float strength = smoothstep(0.7, 0.0, distanceFromStormCenter);
            vec3 curlW = normalize(cross(stormLocation, posOnsphere)); 
            vec3 stretched = curlW * vec3(1.0, 0.2, 1.0); // scale Y axis to squash vertically

            return normalize(stretched) * strength * speed;
    };
    return vec3(0.0);
}

void main() {
    vec3 posOnsphere = normalize(vUV);
    vec3 jet = vec3(0., 1., 0.);

    vec3 torm = normalize(vec3(1., stormYValue, stormXValue)); //Tormi pos
    vec3 giantStorm = storms(torm, posOnsphere, speed/100., stormSizeValue);
    float distanceFromGiantStormCenter = length(giantStorm - posOnsphere);


    float smallStormSize = 0.5;
    float smallStormSpeed = speed/80.;
    vec3 smallStorm1 = storms(normalize(vec3(0.6, 1, 0.)), posOnsphere, smallStormSpeed, smallStormSize);
    vec3 smallStorm2 = storms(normalize(vec3(-0.6, 1, 0.)), posOnsphere, smallStormSpeed, smallStormSize);
    vec3 smallStorm3 = storms(normalize(vec3(-0.3, 1, 0.5)), posOnsphere, smallStormSpeed, smallStormSize);
    vec3 smallStorm4 = storms(normalize(vec3(-0.3, 1, -0.5)), posOnsphere, smallStormSpeed, smallStormSize);
    vec3 smallStorm5 = storms(normalize(vec3(0.3, 1, 0.5)), posOnsphere, smallStormSpeed, smallStormSize);
    vec3 smallStorm6 = storms(normalize(vec3(0.3, 1, -0.5)), posOnsphere, smallStormSpeed, smallStormSize);

    float wavyFreq = 0.2;
    float wavyAmp = 0.5;
    vec4 m;
    vec4 n;

    m = noised2(time/vortexChangerate + posOnsphere*vortexFrequency, posOnsphere);

    vec3 curl = cross(m.yzw, posOnsphere);


    float vjetSpeed = jetSpeed * speed/1000.;
    float curlSpeed = curlSpeed * speed/1000.;
    float stormCurlSpeed = 15.0 * speed/100.;

    vec3 upVec = vec3(0., 1., 0.);
    vec3 v = normalize(cross(upVec, posOnsphere)); 

    float B = sin((currentFrequency * 3.14 * posOnsphere.y) / 2.); //jet east
    float B2 = cos((currentFrequency * 3.14 * posOnsphere.y) / 2.); //jet west
    float Bn = abs(B);

    vec3 jetSine = (vjetSpeed * B * v); 

    vec3 jetSimulation = jetSine + (1. - Bn) * (curl * curlSpeed) * sign(B2); //jet and curl combination as well as sign(B2) to determine the curl direction
    jetSimulation += (-giantStorm);
 
    //Northern polar storms
     jetSimulation += (-smallStorm1);
     jetSimulation += (-smallStorm2);
     jetSimulation += (-smallStorm3);
     jetSimulation += (-smallStorm4);
     jetSimulation += (-smallStorm5);
     jetSimulation += (-smallStorm6);

    vec3 sample_uv = normalize(posOnsphere+jetSimulation);

    vec4 texColor2 = texture(textureSampler, sample_uv);
    vec4 texColor3 = texture(textureSampler, posOnsphere);
    vec3 finalCol = oklab_mix(texColor2.xyz, texColor3.xyz, blendValue*2.).xyz;
    
    //jet colors
    if (B > 0.7){
        finalCol = oklab_mix(finalCol, vec3(spotCOLOR), Bn/30.);
    } else if (B < -0.7) {
        finalCol = oklab_mix(finalCol, vec3(spotCOLOR2), Bn/30.);
    } else {
        finalCol = oklab_mix(finalCol, vec3(spotCOLOR3), Bn/30.);
    }
    //storm colors (dar)
    if (length(torm - posOnsphere) < 0.2) {
      finalCol = oklab_mix(finalCol, currentCOLORstorm, distanceFromGiantStormCenter/30.);
    }
    if (length(torm - posOnsphere) < 0.1) {
      finalCol = oklab_mix(finalCol, currentCOLORstorm-vec3(0.2), distanceFromGiantStormCenter/30.);
    }
    
    fragColor = vec4(finalCol, 1.0);
}