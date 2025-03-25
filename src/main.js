import * as BABYLON from '@babylonjs/core';

//OTHER
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.WebGPUEngine(canvas, {antialias: true});
await engine.initAsync();
var cylindricalCapture;
var CYCprojection;
var buttonPressed = false;
var curlNoise;
var plane;
var src;
var des;
var cubeMap;
var sphereRender;


//IMG SIZE
const imageWidth = 1024;
const imageHeight = 512; 

//SIMULATION SPEED --------------------------------------------------
var speedValue = 1.0;
var speed = document.getElementById('speedSlider');
var speedText = document.getElementById('speedValueText');

speed.addEventListener("input", (event) => {
  speedValue = event.target.value;
  speedText.textContent = speedValue;
}, false);

//COLORS -----------------------------------------------------------
const colorPicker = document.getElementById('favcolor1');
const colorPicker2 = document.getElementById('favcolor2');
const colorPicker3 = document.getElementById('favcolor3');
var currentCOLOR = hexToRgb("#4195d1");
var currentCOLOR2 = hexToRgb("#96ebe2");
var currentCOLOR3 = hexToRgb("#6ca39d");
colorPicker.addEventListener("input", (event) => {currentCOLOR = hexToRgb(event.target.value)}, false);
colorPicker2.addEventListener("input", (event) => {currentCOLOR2 = hexToRgb(event.target.value)}, false);
colorPicker3.addEventListener("input", (event) => {currentCOLOR3 = hexToRgb(event.target.value)}, false);

//AMPLITUDE ----------------------------------------------------

var currentAmplitude = 5; 
const amplitude = document.getElementById('amplitudeValue');
var amplitudeText = document.getElementById('amplitudeText');

amplitude.addEventListener("input", (event) => {
  currentAmplitude = event.target.value;
  amplitudeText.textContent = currentAmplitude; 
}, false);

//CURL ---------------------------------------------------------
var curlSpeed = 5;
const curlSpeedSlider = document.getElementById('curlSpeed');
var curlSpeedText = document.getElementById('curlSpeedText');

curlSpeedSlider.addEventListener("input", (event) => {
  curlSpeed = event.target.value;  
  curlSpeedText.textContent = curlSpeed;
}, false);

//JET SPEED -----------------------------------------------------
var jetSpeed = 1.0;
const jetSpeedSlider = document.getElementById('jetSpeed');
var jetSpeedText = document.getElementById('jetSpeedText');

jetSpeedSlider.addEventListener("input", (event) => {
  jetSpeed = event.target.value;  
  jetSpeedText.textContent = jetSpeed;
}, false);

//BLENDING ------------------------------------------------------
var blendValue = 1.0;
var blendSlider = document.getElementById('blend');
var blendText = document.getElementById('blendText');

blendSlider.addEventListener("input", (event) => {
  blendValue = event.target.value;
  blendText.textContent = blendValue;
}, false);

//VORTEX --------------------------------------------------------
var vortexFrequencyValue = 5.0;
var vortexFrequency = document.getElementById('vortexFrequency');
var vortexFrequencyText = document.getElementById('vortexFrequencyText');

var vortexChangerateValue = 10000;
var vortexChangerate = document.getElementById('vortexChangerate');
var vortexChangerateText = document.getElementById('vortexChangerateText');

vortexChangerate.addEventListener("input", (event) => {
  vortexChangerateValue = event.target.value;
  vortexChangerateText.textContent = vortexChangerateValue;
}, false);

vortexFrequency.addEventListener("input" ,(event) => {
  vortexFrequencyValue = event.target.value;
  vortexFrequencyText.textContent = vortexFrequencyValue;
}, false);

window.buttonPRESS = () => {
  buttonPressed = true;
}

/**
 * 
 * @param pixelData
 * 
 * Composes img data to upload to backend server
 * @function uploadImage
 * 
 * @returns void 
 */
function sendImageToBackend(pixelData) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imageWidth;
  canvas.height = imageHeight;
  const imageData = new ImageData(new Uint8ClampedArray(pixelData), imageWidth, imageHeight);
  
  ctx.putImageData(imageData, 0, 0);
  canvas.toBlob((blob) => {
      if (blob) {
          uploadImage(blob);
      }
  }, "image/png");
}

/**
 * 
 * @param blob
 * 
 * 
 * Uploads img file to server in png format
 * Also calls update method on server
 * 
 * @returns void
*/
function uploadImage(blob) {
  const formData = new FormData();
  formData.append("file", blob, "render.png");

  //send img to backend server
  fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData
  })
  .then(response => response.json())
  .then(data => console.log("Upload success:", data))
  .catch(error => console.error("Upload error:", error));

  //Call update to update saved simulations
  fetch("http://localhost:5000/update", {
    method: "GET",
  })
  .then(response => response.json())
  .then(data => console.log("Update success:", data))
  .catch(error => console.error("Update error:", error));
}

/**
 * 
 * @param String hex
 * 
 * 
 * Converts hex string to RGB array. 
 * 
 * @returns array|null
 */
//https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

const createScene = function() {
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.FreeCamera("orthoCamera", new BABYLON.Vector3(0, 0, 0), scene);
  const size = 5; // Controls zoom level of camera

  //CAMERA(ORTHO) SETUP
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  camera.orthoLeft = -size/2;
  camera.orthoRight = size/2;
  camera.orthoTop = size/2;
  camera.orthoBottom = -size/2;
  camera.minZ = 0.1;
  camera.maxZ = 10;
  camera.position.z = -6;
  camera.upVector = new BABYLON.Vector3(0.0, 1.0, 0.0);
  camera.setTarget(BABYLON.Vector3.Zero());
  scene.addCamera(camera);

  //MESH TO RENDER TO
  plane = BABYLON.MeshBuilder.CreatePlane("plane", {size: size, sideOrientation : BABYLON.Mesh.FRONTSIDE} ,scene);
  plane.position.z = 0;
  plane.rotation = BABYLON.Vector3.Zero();

  //MATERIAL FOR SIMULATION
  curlNoise = new BABYLON.ShaderMaterial("shader", scene, "./curlNoise", {
    attributes: ["position", "normal", "uv"],
    uniforms: [
      "world",
      "time",
      "speed",
      "seed",
      "worldViewProjection",
      "spotCOLOR",
      "spotCOLOR2",
      "spotCOLOR3",
      "blendValue",
      "t",
      "M1",
      "M2",
      "M3",
    ],
  });
  curlNoise.forceCompilationAsync(plane);
  
  /*  Get initial cubemap texture from  babylon -- NB NOT USED ATM

    cubeMap = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
    curlNoise.setTexture("textureSampler", cubeMap);

  */
  
  src = new BABYLON.RenderTargetTexture(
    'render to texture', 
    512, // texture size
    scene,
    false,
    false,
    BABYLON.WebGPUEngine.TEXTUREFORMAT_RGBA,
    true 
  );
  
  des = new BABYLON.RenderTargetTexture(
    'render to texture2',
    512, //texture size
    scene,
    false,
    false,
    BABYLON.WebGPUEngine.TEXTUREFORMAT_RGBA,
    true
  );
  
  plane.material = curlNoise;
  
  src.renderList.push(plane);
  des.renderList.push(plane);
    
  return scene;
}


const createCylindricalScene = function() {

  const CYLscene = new BABYLON.Scene(engine);
  const camera = new BABYLON.FreeCamera("orthoCamera", new BABYLON.Vector3(0, 0, 0), CYLscene);

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
  //CYLscene.createDefaultCameraOrLight(true, true, true);
  CYLscene.addCamera(camera);
  plane = BABYLON.MeshBuilder.CreatePlane("plane", {size: size,sideOrientation : BABYLON.Mesh.FRONTSIDE} ,CYLscene);
  plane.position.z = 0;
  plane.rotation = BABYLON.Vector3.Zero();


  cylindricalCapture = new BABYLON.ShaderMaterial("shader", CYLscene, "./cylindricalProjection", {
    attributes: ["position", "uv",],
    uniforms: [
      "worldViewProjection",
      "world",
    ],
  });
  cylindricalCapture.forceCompilationAsync(plane);


  CYCprojection = new BABYLON.RenderTargetTexture(
    'render to texture',
    {
      width: imageWidth,
      height: imageHeight
    },
    CYLscene, // the scene
    false,
    false,
    BABYLON.WebGPUEngine.TEXTUREFORMAT_RGBA,
    false 
  );
  plane.material = cylindricalCapture;
  cylindricalCapture.setTexture("textureSampler", src);
  CYCprojection.renderList.push(plane);
  return CYLscene;
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

  engine.inputElement = canvas;
  
  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 3 }, mainScene);
  mainScene.activeCamera = camera2;
  sphere.material = sphereRender;
  sphere.position.z = 6;
  camera2.setTarget(sphere.position);
  
  //--------------------------ANIMATION START -----------------------------------------
  const animEarth = new BABYLON.Animation("animEarth", "rotation.y", 3,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    
    const earthKeys = []; 
    
    //At the animation key 0, the value of rotation.y is 0
    earthKeys.push({
      frame: 0,
      value: 0  
    });
    
    earthKeys.push({
      frame: 340,
      value: 2 * Math.PI
    });
    
    animEarth.setKeys(earthKeys);
    
    sphere.animations = [];
    sphere.animations.push(animEarth);
    
    //Begin animation - object to animate, first frame, last frame and loop if true
    scene.beginAnimation(sphere, 0, 340, true);
    //--------------------------ANIMATION END -----------------------------------------
    
    
    mainScene.clearColor = new BABYLON.Color3(0.0, 0.0, 0.0);
    return mainScene;
  }
  
  // Create the scene and run the engine
  const scene = createScene();
  const mainScene = createMainScene();
  //For saving the simulations  
  const CylScene = createCylindricalScene();

  //HANDlES giving cubemap faces vectors to shaders
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
      case 4:
        curlNoise.setVector3("t", new BABYLON.Vector3(0., 0., 1.));   
        curlNoise.setVector3("M1", new BABYLON.Vector3(0., 1., 0.));
        curlNoise.setVector3("M2", new BABYLON.Vector3(1., 0., 0.));
        curlNoise.setVector3("M3", new BABYLON.Vector3(0., 0., 0.));
        break;
      case 5:
        curlNoise.setVector3("t", new BABYLON.Vector3(0., 0., -1.));   
        curlNoise.setVector3("M1", new BABYLON.Vector3(0., -1., 0.));
        curlNoise.setVector3("M2", new BABYLON.Vector3(1., 0., 0.));
        curlNoise.setVector3("M3", new BABYLON.Vector3(0., 0., 0.));
        break;
    }
    };
              
des.onBeforeRenderObservable.add(handleFaceIndex);
src.onBeforeRenderObservable.add(handleFaceIndex);
              
var previousTime = 0;
var sleepDuration = 0.0;
engine.runRenderLoop(async function()
{
  let currentTime = performance.now();

  if (currentTime-previousTime > sleepDuration) {
    previousTime = currentTime;
  } else {
    return;
  }

  scene.render();
  mainScene.render();

  if (buttonPressed) {
    CYCprojection.onAfterRenderObservable.addOnce(async function(data){
      console.log(CYCprojection);
      await CYCprojection.readPixels().then((data) => {
        // Convert to an image and send to backend                        
        sendImageToBackend(data);
      });
    });
    CYCprojection.render();
    buttonPressed = false;
  }

  scene.customRenderTargets = [];
  scene.onAfterRenderObservable.addOnce(function(faceIndex) {
    /**
     * Switch between 2 textures (src, des)
     * Render into 1 then the other.
     * 
     * isReadyForRendering - check needed because JS is async and textures might still be loading in time of render
     */
    if (des.isReadyForRendering()) {

      des.render();
      [src, des] = [des, src];
      curlNoise.setTexture("textureSampler", src);
      sphereRender.setTexture("textureSampler", src);

      //For saving the simulations  
      cylindricalCapture.setTexture("textureSampler", src);
    }
  });

  //Mandatory 
  curlNoise.setVector3("spotCOLOR", new BABYLON.Vector3(currentCOLOR.r/255.0, currentCOLOR.g/255.0, currentCOLOR.b/255.0));
  curlNoise.setVector3("spotCOLOR2", new BABYLON.Vector3(currentCOLOR2.r/255.0, currentCOLOR2.g/255.0, currentCOLOR2.b/255.0));
  curlNoise.setVector3("spotCOLOR3", new BABYLON.Vector3(currentCOLOR3.r/255.0, currentCOLOR3.g/255.0, currentCOLOR3.b/255.0));
  curlNoise.setFloat("currentAmplitude", currentAmplitude);
  curlNoise.setFloat("time", currentTime);
  curlNoise.setFloat("curlSpeed", curlSpeed);
  curlNoise.setFloat("jetSpeed", jetSpeed);
  curlNoise.setFloat("blendValue", blendValue);
  curlNoise.setFloat("speed", speedValue);
  curlNoise.setFloat("vortexChangerate", vortexChangerateValue); 
  curlNoise.setFloat("vortexFrequency", vortexFrequencyValue);
});

// Handle window resizing
window.addEventListener('resize', function() {
  engine.resize();
});
