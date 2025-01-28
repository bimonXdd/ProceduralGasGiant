import * as BABYLON from '@babylonjs/core';

// Setup canvas and engine
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

const slider = document.getElementById("slider");
var speedValue = document.getElementById("speedValue");

const fbmValue = document.getElementById("fbmValue");
var fbmValueText = document.getElementById("fbmValueText");

const fbmOctavesValue = document.getElementById("fbmOctavesValue");
var fbmOctavesValueText = document.getElementById("fbmOctavesText");

const fbmShiftValue = document.getElementById("fbmShiftValue");
var fbmShiftValueText = document.getElementById("fbmShiftText");

const fbmAmplitudeValue = document.getElementById("fbmAmplitudeValue");
var fbmAmplitudeValueText = document.getElementById("fbmAmplitudeText"); 
let time = 0;


const createScene = function() {
  const scene = new BABYLON.Scene(engine);
  // Create default camera and light
  scene.createDefaultCameraOrLight(true, true, true);

 /**
  * Sphere
  */
  // const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { segments: 16, diameter: 2 }, scene);
  // sphere.position.y = 1;
  
  /*
  
  Torus

  */
  // const torus = BABYLON.MeshBuilder.CreateTorus("torus", { thickness: 0.1, diameter: 4}, scene);
  // torus.position = new BABYLON.Vector3(0, 1, 0);
  // torus.rotation.z = 0.4;



  // const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, "./gasGiantV1", {
  //   attributes: ["position", "normal", "uv"],
  //   uniforms: [
  //     "world",
  //     "worldView",
  //     "worldViewProjection",
  //     "view",
  //     "projection",
  //     "time",
  //     "speed",
  //     "fbmValue", 
  //     "fbmOctavesValue",
  //     "fbmShiftValue",
  //     "fbmAmplitudeValue",
  //   ],
  // });
  // const shaderMaterial2 = new BABYLON.ShaderMaterial("shader", scene, "./gasGiantV1", {
  //   attributes: ["position", "normal", "uv"],
  //   uniforms: [
  //     "world",
  //     "worldView",
  //     "worldViewProjection",
  //     "view",
  //     "projection",
  //     "time",
  //     "speed",
  //     "fbmValue", 
  //     "fbmOctavesValue",
  //     "fbmShiftValue",
  //     "fbmAmplitudeValue",
  //   ],
  // });

  // // Texture for the material
  // const mainTexture = new BABYLON.Texture("wood.jpg", scene); // Example texture
  // const northStormTexture = new BABYLON.Texture("darkWood.jpg", scene); // Example texture

  // shaderMaterial.setTexture("textureSampler", mainTexture);
  // shaderMaterial2.setTexture("textureSampler", northStormTexture);
  // var multiMaterial = new BABYLON.MultiMaterial("multi", scene);
  // var standardMaterial = new BABYLON.StandardMaterial("standardMat", scene);
  // standardMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
  
  // // Add materials to the MultiMaterial
  // multiMaterial.subMaterials.push(shaderMaterial);
  // multiMaterial.subMaterials.push(shaderMaterial2);

  // sphere.subMeshes = [];
  // var verticesCount = sphere.getTotalVertices();
  
  // new BABYLON.SubMesh(1, 0, verticesCount, 0, 432, sphere);
  // new BABYLON.SubMesh(0, 0, verticesCount, 432, 3456, sphere);

  // sphere.material = multiMaterial;

  const plain = BABYLON.MeshBuilder.CreatePlane("plain", { size: 2});
  plain.position.z = 1;
  const particleCount = 1;
  const textureWidth = 1024;
  const textureHeight = 1024;
  const deltaTime = engine.getDeltaTime() * 0.001;
  // Initialize particle data (position and velocity)
  const particleData = new Float32Array(textureWidth * textureHeight * 6);

  const particleDataTexture = new BABYLON.RawTexture(
    particleData, 
    textureWidth, 
    textureHeight, 
    BABYLON.Engine.TEXTUREFORMAT_RGBA, 
    scene, 
    false, 
    false, 
    BABYLON.Texture.NEAREST_SAMPLINGMODE, 
    BABYLON.Engine.TEXTURETYPE_FLOAT
);
const standardTexture = new BABYLON.Texture('images/wood.jpg', scene);

const particleMaterial = new BABYLON.ShaderMaterial("particleShader", scene, "./curlNoise", {
  attributes: ["position", "uv"],
  uniforms: ["worldViewProjection", "particleDataTexture", "time"]
});
particleMaterial.setTexture("particleDataTexture", standardTexture);
particleMaterial.setFloat("time", 0.6);


plain.material = particleMaterial;


//particleData[i * 4 + 0] += 0.01 * Math.random(); // Update X position
particleDataTexture.update(particleData);



  //CPU INITIAL PARTICLE STUFF
  // const dynamicTexture = new BABYLON.DynamicTexture("dynamicTexture", { width: 1024, height: 1024 }, scene, false);
  // const planeMaterial = new BABYLON.StandardMaterial("planeMaterial", scene);
  
  // planeMaterial.diffuseTexture = dynamicTexture;
  // plain.material = planeMaterial;


//   const shaderMaterial = new BABYLON.ShaderMaterial("particleShader", scene, "curlNoise", {
//     attributes: ["position"],
//     uniforms: ["positionTexture", "resolution"],
// });

//shaderMaterial.setTexture("positionTexture", particleTexture);
//shaderMaterial.setVector2("resolution", new BABYLON.Vector2(canvas.width, canvas.height));


let timeFrame = 0;
let i = 0;
let index = i * 3; 

scene.registerBeforeRender(function() {
  const currentTime = performance.now()*0.1;  // Time in seconds
  particleMaterial.setFloat("time", currentTime); // Update time uniform
  const deltaTime = engine.getDeltaTime() * 0.001;

    i +=1;
    index = i * 3
    particleData[index] = 1;  
    particleData[index+1] = 1;  
    particleData[index+2] = 1;

    particleData[index-1] = 0;  
    particleData[index-2] = 0;  
    particleData[index-3] = 0;

    timeFrame += 1; 
    //particleDataTexture.update(particleData);

    // dynamicTexture.getContext().clearRect(0, 0, 1024, 1024);

    // particles.forEach(p => {
    //     p.x += p.vx;
    //     p.y += p.vy;

    //     // Bounce particles off the edges
    //     if (p.x < 0 || p.x > 1024) p.vx *= -1;
    //     if (p.y < 0 || p.y > 1024) p.vy *= -1;

    //     dynamicTexture.getContext().beginPath();
    //     dynamicTexture.getContext().arc(p.x, p.y, p.size, 0, 2 * Math.PI);
    //     dynamicTexture.getContext().fillStyle = p.color;  
    //     dynamicTexture.getContext().fill();
    // });

    // Update the dynamic texture
    //dynamicTexture.update();
    // speedValue.textContent  = speed;

    // fbmValueText.textContent = parseFloat(fbmValue.value);
    
    // fbmOctavesValueText.textContent= fbmOctavesValue.value;

    // fbmShiftValueText.textContent = fbmShiftValue.value;

    // fbmAmplitudeValueText.textContent = fbmAmplitudeValue.value;
    // Check if the speed value is valid

      //shaderMaterial.setFloat("time", time);
      // shaderMaterial.setFloat("speed", speed); // Pass speed to the shader
      // shaderMaterial.setInt("fbmOctavesValue", fbmOctavesValue.value);
      // shaderMaterial.setFloat("fbmValue", parseFloat(fbmValue.value)); // Static value for fbmValue (you can modify this based on your needs)
      // shaderMaterial.setInt("fbmShiftValue", fbmShiftValue.value);
      // shaderMaterial.setFloat("fbmAmplitudeValue", parseFloat(fbmAmplitudeValue.value));
    
  });

  return scene;
}

// Create the scene and run the engine
const scene = createScene();
engine.runRenderLoop(function() {

  time += 0.01; // Increment time
  scene.render();
});

// Handle window resizing
window.addEventListener('resize', function() {
  engine.resize();
});
