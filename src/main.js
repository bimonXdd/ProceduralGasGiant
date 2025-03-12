import * as BABYLON from '@babylonjs/core';


// Setup canvas and engine
const canvas = document.getElementById('renderCanvas');

//const engine = new BABYLON.Engine(canvas, true);
const engine = new BABYLON.WebGPUEngine(canvas);
await engine.initAsync();


var curlNoise;
var plane;
var src;
var des;
var frameCount = 0;
var tempTexture;
var tree;
var cubeMap;
let renderTexture;
var mainSceneCurl;
var sphereRender;

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
    attributes: ["position", "normal", "uv",],
    uniforms: [
      "world",
      "worldView",
      "worldViewProjection",
      "view",
      "projection",
      "time",
      "seed",
      "M1",
      "M2",
      "M3"
    ],
  });

  
  // Texture for the material
  //src = new BABYLON.Texture("wood.jpg", scene); // Example texture
  //des = new BABYLON.Texture("darkWood.jpg", scene); // Example texture
  //curlNoise.setFloat("seed", Math.random()*1000);
  tree = new BABYLON.Texture("wood.jpg", scene);
  cubeMap = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
  //console.log(cubeMap);
  //tex2 = new BABYLON.Texture("flowers.png", scene);

  src = new BABYLON.RenderTargetTexture(
    'render to texture', // name 
    512, // texture size
    scene, // the scene
    false,
    false,
    BABYLON.WebGPUEngine.TEXTUREFORMAT_RGBA,
    true 
  );

  des = new BABYLON.RenderTargetTexture(
    'render to texture2', // name 
    512, // texture size
    scene, // the scene
    false,
    false,
    BABYLON.WebGPUEngine.TEXTUREFORMAT_RGBA,
    true
  );
  
  plane.material = curlNoise;

  curlNoise.setTexture("textureSampler", cubeMap);
  //curlNoise.setTexture("textureSampler2", tex2); 

  src.renderList.push(plane);
  des.renderList.push(plane);
  
//-----------------------------------------------------------------

  return scene;
}

const createMainScene = function() {
  
  const mainScene = new BABYLON.Scene(engine);
  const camera2 = new BABYLON.ArcRotateCamera("camera2", Math.PI/2, Math.PI/2, 2, new BABYLON.Vector3(0, 0, 10));

  sphereRender = new BABYLON.ShaderMaterial("shader", mainScene, "./sphereRender", {
    attributes: ["position", "normal", "uv",],
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
  var cubeMap2 = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", mainScene);
  sphereRender.setTexture("textureSampler", cubeMap2);

  camera2.attachControl(canvas, true);
  camera2.setTarget(BABYLON.Vector3.Zero());
  // Create default camera and light
  //scene.createDefaultCameraOrLight(true, true, true);
  engine.inputElement = canvas;

  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 3 }, mainScene);
  mainScene.activeCamera = camera2;
  sphere.material = sphereRender;

//--------------------------ANIMATION START -----------------------------------------
  // const animEarth = new BABYLON.Animation("animEarth", "rotation.x", 20,
  //   BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

  // const earthKeys = []; 

  // //At the animation key 0, the value of rotation.y is 0
  // earthKeys.push({
  //     frame: 0,
  //     value: 0
  // });

  // earthKeys.push({
  //     frame: 120,
  //     value: 2 * Math.PI
  // });

  // animEarth.setKeys(earthKeys);

  // sphere.animations = [];
  // sphere.animations.push(animEarth);

  // //Begin animation - object to animate, first frame, last frame and loop if true
  // scene.beginAnimation(sphere, 0, 120, true);
//--------------------------ANIMATION END -----------------------------------------

  return mainScene;
}

// Create the scene and run the engine
const scene = createScene();
const mainScene = createMainScene();
var speed;
var last=0;
var sleepDuration = 0.0;

const handleFaceIndex = (faceIndex) => {

  switch (faceIndex) {
      case 0:
          curlNoise.setVector3("t", new BABYLON.Vector3(1., 0., 0.));
          curlNoise.setVector3("M1", new BABYLON.Vector3(0., 0., 0.));
          curlNoise.setVector3("M2", new BABYLON.Vector3(1., 0., 0.));
          curlNoise.setVector3("M3", new BABYLON.Vector3(0., -1., 0.));
          break;
      case 1:
          curlNoise.setVector3("t", new BABYLON.Vector3(-1., 0., 0.));   
          curlNoise.setVector3("M1", new BABYLON.Vector3(0., 0., 0.));
          curlNoise.setVector3("M2", new BABYLON.Vector3(1., 0., 0.));
          curlNoise.setVector3("M3", new BABYLON.Vector3(0., 1., 0.));
          break;
      case 2:
        curlNoise.setVector3("t", new BABYLON.Vector3(0., 1., 0.));   
          curlNoise.setVector3("M1", new BABYLON.Vector3(0., 1., 0.));
          curlNoise.setVector3("M2", new BABYLON.Vector3(0., 0., 0.));
          curlNoise.setVector3("M3", new BABYLON.Vector3(-1., 0., 0.));
          break;
      case 3:
        curlNoise.setVector3("t", new BABYLON.Vector3(0., -1., 0.));   
          curlNoise.setVector3("M1", new BABYLON.Vector3(0., 1., 0.));
          curlNoise.setVector3("M2", new BABYLON.Vector3(0., 0., 0.));
          curlNoise.setVector3("M3", new BABYLON.Vector3(1., 0., 0.));
          break;
      case 5:
        curlNoise.setVector3("t", new BABYLON.Vector3(0., 0., 1.));   
          curlNoise.setVector3("M1", new BABYLON.Vector3(0., 1., 0.));
          curlNoise.setVector3("M2", new BABYLON.Vector3(1., 0., 0.));
          curlNoise.setVector3("M3", new BABYLON.Vector3(0., 0., 0.));
          break;
      case 4:
        curlNoise.setVector3("t", new BABYLON.Vector3(0., 0., -1.));   
          curlNoise.setVector3("M1", new BABYLON.Vector3(0., -1., 0.));
          curlNoise.setVector3("M2", new BABYLON.Vector3(1., 0., 0.));
          curlNoise.setVector3("M3", new BABYLON.Vector3(0., 0., 0.));
          break;
  }
};

des.onBeforeRenderObservable.add(handleFaceIndex);
src.onBeforeRenderObservable.add(handleFaceIndex);

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
  scene.customRenderTargets = [];
  scene.onAfterRenderObservable.addOnce(function(faceIndex) {
    if (des.isReadyForRendering()) {
      des.render();

      [src, des] = [des, src];
      curlNoise.setFloat("time", now);
      curlNoise.setTexture("textureSampler", src);
      sphereRender.setTexture("textureSampler", src);
    }
    
  });
  
  speed = document.getElementById('speedSlider');
  curlNoise.setFloat("speed", speed.value);
});

// Handle window resizing
window.addEventListener('resize', function() {
  engine.resize();
});
/**
 * t0 = (1, 0, 0)
 * M0 = {
 *  0, 0, 0,
 *  1, 0, 0,
 *  0, -1, 0,
 * },
 * 
 * t1 = (-1, 0, 0) 
 * M1 = {
 *  0, 0, 0,
 *  1, 0, 0,
 *  0, 1, 0,
 * } 
 * 
 * t2 = (0, 1, 0)
 * M2 = {
 *  0, 1, 0,
 *  0, 0, 0,
 *  -1, 0, 0
 * }
 * 
 * f3 = (0, -1, 0)
 * 00-> -1 -1 -1
 * 10-> -1 -1  1
 * 01->  1 -1 -1
 * 11->  1 -1  1
 * 
 * M3 = {
 *  0  1, 0,
 *  0, 0, 0,
 *  1, 0 ,0,
 * }
 * 
 * f4 = (0, 0, 1)
 * 00->  -1 -1  1
 * 10->  -1  1  1
 * 01->   1 -1  1 
 * 11->   1  1  1
 * 
 *  M4 = {
 *  0, 1, 0
 *  1, 0, 0
 *  0, 0, 0
 * }
 * 
 * * f5 = (0, 0, -1)
 * 00->  1 -1 -1
 * 10->  1  1 -1
 * 01-> -1 -1 -1
 * 11-> -1  1 -1
 * 
 * M5 = {
 *  0, -1, 0,
 *  1,  0, 0,
 *  0,  0, 0,
 * }
 * 
 */