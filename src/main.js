import * as BABYLON from '@babylonjs/core';

// Setup canvas and engine
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);
var curlNoise;
var plane;
var src;
var des;
var frameCount = 0;
var tempTexture;
var tree;

const createScene = function() {
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.FreeCamera("orthoCamera", new BABYLON.Vector3(0, 0, 0), scene);
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  const size = 10;  // Controls zoom level
  camera.orthoLeft = -size/2;
  camera.orthoRight = size/2;
  camera.orthoTop = size/2;
  camera.orthoBottom = -size/2;
  camera.minZ = 0.1;
  camera.maxZ = 10;
  camera.position.z = -4;
  camera.upVector = new BABYLON.Vector3(0.0, 1.0, 0.0);
  camera.setTarget(BABYLON.Vector3.Zero());
  // Create default camera and light
  //scene.createDefaultCameraOrLight(true, true, true);
  scene.addCamera(camera);
  plane = BABYLON.MeshBuilder.CreatePlane("plane", {size: size,sideOrientation : BABYLON.Mesh.FRONTSIDE} ,scene);
  plane.position.z = 0;
  plane.rotation = BABYLON.Vector3.Zero();


  curlNoise = new BABYLON.ShaderMaterial("shader", scene, "./curlNoise", {
    attributes: ["position", "normal", "uv"],
    uniforms: [
      "world",
      "worldView",
      "worldViewProjection",
      "view",
      "projection",
      "time",
      "seed",
    ],
  });

  // Texture for the material
  //src = new BABYLON.Texture("wood.jpg", scene); // Example texture
  //des = new BABYLON.Texture("darkWood.jpg", scene); // Example texture
  curlNoise.setFloat("seed", Math.random()*1000);
  tree = new BABYLON.Texture("flowers.png", scene);

  src = new BABYLON.RenderTargetTexture(
    'render to texture', // name 
    512, // texture size
    scene // the scene
  );

  des = new BABYLON.RenderTargetTexture(
    'render to texture2', // name 
    512, // texture size
    scene // the scene
  );
  //scene.customRenderTargets.push(des);
  
  plane.material = curlNoise;

  scene.registerBeforeRender(function() {
    const time = performance.now(); // Time in seconds
  });

  curlNoise.setTexture("textureSampler", tree);

  src.renderList.push(plane);
  des.renderList.push(plane);

  
  return scene;
}

// Create the scene and run the engine
const scene = createScene();
var speed;
var last=0;
var sleepDuration = 16.0;
engine.runRenderLoop(async function() {
  let now = performance.now();
  if (now-last > sleepDuration) {
    console.log('asd');
    last = now;
  } else{
    return;
  }
  scene.render();

  //console.log(des.uniqueId);
  //scene.customRenderTargets = [];
  scene.onAfterRenderObservable.addOnce(function() {
    //curlNoise.setTexture("textureSampler", des);
    if (des.isReadyForRendering()) {
      des.render();
  
      [src, des] = [des, src];
    
      curlNoise.setTexture("textureSampler", src);
    }
  });
  
   speed = document.getElementById('speedSlider');
   console.log(speed.value);
   curlNoise.setFloat("speed", speed.value);
});

// Handle window resizing
window.addEventListener('resize', function() {
  engine.resize();
});
