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
var tex2;
let renderTexture;

const createScene = function() {
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.FreeCamera("orthoCamera", new BABYLON.Vector3(0, 0, 0), scene);

  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  const size = 5;  // Controls zoom level
  camera.orthoLeft = -size/2;
  camera.orthoRight = size/2;
  camera.orthoTop = size/2;
  camera.orthoBottom = -size/2;
  camera.minZ = 0.1;
  camera.maxZ = 10;
  camera.position.z = -6;
  camera.upVector = new BABYLON.Vector3(0.0, 1.0, 0.0);
  camera.setTarget(BABYLON.Vector3.Zero());
  // Create default camera and light
  //scene.createDefaultCameraOrLight(true, true, true);
  scene.addCamera(camera);
  plane = BABYLON.MeshBuilder.CreatePlane("plane", {size: size,sideOrientation : BABYLON.Mesh.FRONTSIDE} ,scene);
  plane.position.z = 0;
  plane.rotation = BABYLON.Vector3.Zero();


  curlNoise = new BABYLON.ShaderMaterial("shader", scene, "./curlNoise", {
    attributes: ["position", "normal", "uv", "uv2",],
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
  tree = new BABYLON.Texture("wood.jpg", scene);
  tex2 = new BABYLON.Texture("flowers.png", scene);

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
  
  plane.material = curlNoise;


  curlNoise.setTexture("textureSampler", tree);
  curlNoise.setTexture("textureSampler2", tex2); 

  src.renderList.push(plane);
  des.renderList.push(plane);
  
  des.coordinatesMode = BABYLON.Texture.CUBIC_MODE;
//-----------------------------------------------------------------
const cubeTexture = new BABYLON.CubeTexture("./", scene, [
  "wood.jpg", "wood.jpg", "wood.jpg",
  "wood.jpg", "wood.jpg", "wood.jpg"
])
  return scene;
}

const createMainScene = function() {
  const mainScene = new BABYLON.Scene(engine);
  const camera2 = new BABYLON.ArcRotateCamera("camera2", Math.PI/2, Math.PI/2, 2, new BABYLON.Vector3(0, 0, 0));
  camera2.attachControl(canvas, true);
  camera2.setTarget(BABYLON.Vector3.Zero());
  // Create default camera and light
  //scene.createDefaultCameraOrLight(true, true, true);
  engine.inputElement = canvas;


  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 3 }, mainScene);
  mainScene.activeCamera = camera2;
  sphere.material = curlNoise;


  const animEarth = new BABYLON.Animation("animEarth", "rotation.x", 20,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

  const earthKeys = []; 

  //At the animation key 0, the value of rotation.y is 0
  earthKeys.push({
      frame: 0,
      value: 0
  });

  earthKeys.push({
      frame: 120,
      value: 2 * Math.PI
  });

  animEarth.setKeys(earthKeys);

  sphere.animations = [];
  sphere.animations.push(animEarth);

  //Begin animation - object to animate, first frame, last frame and loop if true
  scene.beginAnimation(sphere, 0, 120, true);


  return mainScene;
}

// Create the scene and run the engine
const scene = createScene();
const mainScene = createMainScene();
var speed;
var last=0;
var sleepDuration = 16.0;
engine.runRenderLoop(async function() {
  let now = performance.now();
  if (now-last > sleepDuration) {
    last = now;
  } else{
    return;
  }
  scene.render();
  mainScene.render();

  //console.log(des.uniqueId);
  //scene.customRenderTargets = [];
  scene.onAfterRenderObservable.addOnce(function() {
    if (des.isReadyForRendering()) {
      des.render();

      [src, des] = [des, src];
      curlNoise.setFloat("time", now);
      curlNoise.setTexture("textureSampler", src);
    }
    
  });
  
   speed = document.getElementById('speedSlider');
   curlNoise.setFloat("speed", speed.value);
});

// Handle window resizing
window.addEventListener('resize', function() {
  engine.resize();
});
