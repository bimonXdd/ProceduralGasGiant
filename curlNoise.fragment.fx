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
uniform float currentAmplitude;
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

// 2D hash function (non-production ready)
vec2 hash( in ivec2 p ) {
    ivec2 n = p.x * ivec2(3, 37) + p.y * ivec2(311, 113);
    n = (n << 13) ^ n;
    n = n * (n * n * int(seed) + int(seed*seed/3.14)) + 1376312589;
    return -1.0 + 2.0 * vec2( n & ivec2(0x0fffffff)) / float(0x0fffffff);
}


vec3 hash2( vec3 p )     // this hash is not production ready, please
{                        // replace this by something better
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
    
    // quintic interpolant
    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    vec3 du = 30.0*w*w*(w*(w-2.0)+1.0);
    
    //gradient - dot(gradient, normal) * normal;

    // gradients
    vec3 ga = hash2( p+vec3(0.0,0.0,0.0) );
    vec3 gb = hash2( p+vec3(1.0,0.0,0.0) );
    vec3 gc = hash2( p+vec3(0.0,1.0,0.0) );
    vec3 gd = hash2( p+vec3(1.0,1.0,0.0) );
    vec3 ge = hash2( p+vec3(0.0,0.0,1.0) );
    vec3 gf = hash2( p+vec3(1.0,0.0,1.0) );
    vec3 gg = hash2( p+vec3(0.0,1.0,1.0) );
    vec3 gh = hash2( p+vec3(1.0,1.0,1.0) );
    
    //projections2 (gradient on sfääri pinnal)
    
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
    //plynoomiga interpolation vaata yle !!
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

// vec4 gridBlur(vec4 staticSample, vec2 gridUV)
// {
//         // Apply a simple blur by averaging neighboring pixels around the grid point
//         float blurRadius = 2.0;  // Adjust this to control how much blur is applied
//         vec4 blurredColor = vec4(0.0);
//         float totalWeight = 0.0;  

//         // Loop over a small area around the grid point
//         for (float dx = -blurRadius; dx <= blurRadius; dx++) {
//             for (float dy = -blurRadius; dy <= blurRadius; dy++) {
//                 vec2 offset = vec2(dx, dy) / vec2(textureSize(textureSampler, 0));  // Convert to UV space
//                 //vec4 sampleX = texture(textureSampler, gridUV + offset);

//                 // Calculate the weight based on distance from the grid point
//                 float weight = exp(-0.5 * (dx * dx + dy * dy) / (blurRadius * blurRadius));  // Gaussian weight
//                 blurredColor += sampleX * weight;
//                 totalWeight += weight;
//             }
//         }

//         // Normalize the color
//         blurredColor /= totalWeight;

//         // Weighted blend between original staticSample and the blurred background
//         float blendFactor = 0.0;  // % of the background blur added to each 
//     return mix(staticSample, blurredColor, blendFactor);;
// }

void main() {
    //vec3 tex = vUV;
    vec3 posOnsphere = normalize(vUV);
    //posOnSphere.xzy = posOnSphere;
    vec3 jet = vec3(0., 1., 0.);
    // vec2 tex2 = vUV.yz;
    // tex2 = tex2.yx;
    // vec2 tex = vec2(tex2.x, -tex2.y);
    //----------------------------------GRID Start----------------------------------------------------
    //float gridSize = 30.0;
    // Convert UV coordinates to screen-space coordinates
    //vec3 screenUV = vUV * vec3(textureSize(textureSampler, 0));

    // Find the nearest grid point in screen space
    //vec2 gridPoint = (floor(screenUV / gridSize) + 0.5) * gridSize;
    // Convert the grid point back to UV space
    //vec2 gridUV = gridPoint / vec2(textureSize(textureSampler, 0));

    //vec4 staticSample = texture(textureSampler, gridUV);        //Original picture sampled
    
    // Calculate the distance from the current pixel to the nearest grid point
    // float dist = length(screenUV - gridPoint);
    // // Define a threshold for how close a pixel needs to be to the grid point
    // float pointRadius = 1.0; // Adjust to control point siz
    // if (dist < pointRadius) {
    //     fragColor = gridBlur(staticSample, gridUV);
    //     return;
    // }


    //----------------------------------GRID END----------------------------------------------------
    float wavyFreq = 0.2;
    float wavyAmp = 0.5;

    vec4 m = noised2(time/vortexChangerate + posOnsphere*vortexFrequency, posOnsphere);
    //Y range from 0 to -1  
    // if(posOnsphere.y > -0.3 && posOnsphere.y < 0){
    //     m += vec4(0, jet);
    // } else if (posOnsphere.y < 0.3 && posOnsphere.y > 0) {
    //     m -= vec4(0, jet);
    // }
    // if (posOnsphere.xy == vec2(0., 0.)){
    //     m = vec4(-m.y, m.x, m.y, m.w);
    // }
    vec3 curl = cross(m.yzw, posOnsphere);
    //vec3 sample_uv = normalize(posOnsphere + curl*speed/1000.0);

    float vjetSpeed = jetSpeed * speed/1000.;
    float curlSpeed = curlSpeed * speed/1000.;
    vec3 upVec = vec3(0., 1., 0.);
    vec3 v = normalize(cross(upVec, posOnsphere)); 

    
    float B = sin((currentAmplitude * 3.14 * posOnsphere.y) / 2.); //jet ida poole laius
    float B2 = cos((currentAmplitude * 3.14 * posOnsphere.y) / 2.); //jet laane laius
    float Bn = abs(B);

    vec3 jetSine = (vjetSpeed * B * v); 

    vec3 jetSimulation = jetSine + (1. - Bn) * (curl * curlSpeed) * sign(B2); //kui jet and curl interp ja sign(B2) keerise suunaks
 
    vec3 sample_uv = normalize(posOnsphere+jetSimulation);
    // if(posOnsphere.y > 0.8){
    //     sample_uv = normalize(posOnsphere + curl*speed/1000.0);
    // }
    //add quake lava motion to keep the gradient moving and thus the simulation moving 
    //Otherwise artifacts present (mixing and movement kind of stops)
   // n.y = n.y + sin(time * speed/10000.0 +n.z * wavyFreq)*wavyAmp;
   // n.z = n.z + sin(time * speed/10000.0 +n.y * wavyFreq)*wavyAmp;

    //  sample_uv.y = sample_uv.y + sin(time * speed/1000.0 +sample_uv.z * wavyFreq)*wavyAmp;
    //  sample_uv.x = sample_uv.x + sin(time * speed/1000.0 +sample_uv.y * wavyFreq)*wavyAmp;
    
    //vec2 velocity = vec2(n.z, -n.y);

    //  float waveAmplitude = 0.05;
    //  vec3 rightMainMotion = vec3(0. ,sin(time/1000.0 * sample_uv.y)*waveAmplitude, 1.);     //Right with a sine wave
  
    // float vortexIntensity = 2.0;
    // vec3 vortexLocation = vec3(.5);
    // vec3 vortex = vec3(-(sample_uv.y-vortexLocation.y), sample_uv.x-vortexLocation.x, 0.0)*vortexIntensity;
    
    //vec4 texColor = texture(textureSampler, normalize(vec3(1.,tex+(rightMainMotion*vortex)*speed/1000.0)));

    vec4 texColor2 = texture(textureSampler, sample_uv);
    vec4 texColor3 = texture(textureSampler, posOnsphere);
    vec3 finalCol = mix(texColor2, texColor3, blendValue).xyz;

    if (B > 0.7){
        finalCol = mix(finalCol, vec3(spotCOLOR), Bn/60.);
    } else if (B < -0.7) {
        finalCol = mix(finalCol, vec3(spotCOLOR2), Bn/60.);
    } else {
        finalCol = mix(finalCol, vec3(spotCOLOR3), Bn/60.);
    }
    

    fragColor = vec4(finalCol, 1.0);
}