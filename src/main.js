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

const createScene = function() {
  const scene = new BABYLON.Scene(engine);
  // Create default camera and light
  scene.createDefaultCameraOrLight(true, true, true);

  // Sphere mesh
  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
  sphere.position.y = 1; // Move the sphere slightly above the ground to make it visible
  
  const torus = BABYLON.MeshBuilder.CreateTorus("torus", { thickness: 0.1, diameter: 4}, scene);
  torus.position = new BABYLON.Vector3(0, 1, 0);
  torus.rotation.z = 0.4;
  const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, "./gasGiantV1", {
    attributes: ["position", "normal", "uv"],
    uniforms: [
      "world",
      "worldView",
      "worldViewProjection",
      "view",
      "projection",
      "time",
      "speed",
      "fbmValue", 
      "fbmOctavesValue",
      "fbmShiftValue",
      "fbmAmplitudeValue",
    ],
    
  });

  // Texture for the material
  const mainTexture = new BABYLON.Texture("wood.jpg", scene); // Example texture
  
  shaderMaterial.setTexture("textureSampler", mainTexture);

  // Assign the shader material to the sphere
  sphere.material = shaderMaterial;

  // Register before render to animate the shader
  scene.registerBeforeRender(function() {
    const time = performance.now() * 0.001; // Time in seconds

    const speed = parseFloat(slider.value); // Get speed value from the slider
    speedValue.textContent  = speed;

    fbmValueText.textContent = parseFloat(fbmValue.value);
    
    fbmOctavesValueText.textContent= fbmOctavesValue.value;

    fbmShiftValueText.textContent = fbmShiftValue.value;

    fbmAmplitudeValueText.textContent = fbmAmplitudeValue.value;
    // Check if the speed value is valid
    if (isNaN(speed)) {
      console.error('Invalid speed value from slider:', slider.value);
    } else {
      shaderMaterial.setFloat("time", time);
      shaderMaterial.setFloat("speed", speed); // Pass speed to the shader
      shaderMaterial.setInt("fbmOctavesValue", fbmOctavesValue.value);
      shaderMaterial.setFloat("fbmValue", parseFloat(fbmValue.value)); // Static value for fbmValue (you can modify this based on your needs)
      shaderMaterial.setInt("fbmShiftValue", fbmShiftValue.value);
      shaderMaterial.setFloat("fbmAmplitudeValue", parseFloat(fbmAmplitudeValue.value));
    }
  });

  return scene;
}

// Create the scene and run the engine
const scene = createScene();
engine.runRenderLoop(function() {
  scene.render();
});

// Handle window resizing
window.addEventListener('resize', function() {
  engine.resize();
});
