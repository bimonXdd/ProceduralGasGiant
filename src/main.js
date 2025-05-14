import * as BABYLON from '@babylonjs/core';
(async function(window, document, undefined) {

  //OTHER
  const CANVAS = document.getElementById('renderCanvas');
  const ENGINE = new BABYLON.WebGPUEngine(CANVAS, {antialias: true});
  await ENGINE.initAsync();

  var buttonPressed = false;

  //RenderTargetTextures
  var CYLrenderTargetTexture;
  var sourceRenderTargetTexture;
  var destinationRenderTargetTexture;
  //FPS
  let divFps = document.getElementById("fps");
  //MATERIALS
  var CYLShaderMAT; 
  var sphereShaderMAT;
  var curlNoiseShaderMAT;
  var planetaryRingsMAT;

  //IMG SIZE
  const PANORAMA_WIDTH = 6000;
  const PANORAMA_HEIGHT = 6000; 

  // SIZE
  const CUBEMAP_SIZE = 4096;

  //SIMULATION SPEED --------------------------------------------------
  var speedValue = 1.0;
  var speed = document.getElementById('speedSlider');
  var speedText = document.getElementById('speedValueText');

  speed.addEventListener("input", (event) => {
    speedValue = event.target.value;
    speedText.textContent = speedValue;
  }, false);

  //COLORS -----------------------------------------------------------
  const COLOR_PICKER_ELEMENT1 = document.getElementById('favcolor1');
  const COLOR_PICKER_ELEMENT2 = document.getElementById('favcolor2');
  const COLOR_PICKER_ELEMENT3 = document.getElementById('favcolor3');
  const COLOR_PICKER_ELEMENT_BASE = document.getElementById('stormColor');
  var currentCOLOR = hexToRgb("#4195d1");
  var currentCOLOR2 = hexToRgb("#96ebe2");
  var currentCOLOR3 = hexToRgb("#6ca39d");
  var currentCOLORstorm = hexToRgb("#6ca39d");
  COLOR_PICKER_ELEMENT1.addEventListener("input", (event) => {currentCOLOR = hexToRgb(event.target.value)}, false);
  COLOR_PICKER_ELEMENT2.addEventListener("input", (event) => {currentCOLOR2 = hexToRgb(event.target.value)}, false);
  COLOR_PICKER_ELEMENT3.addEventListener("input", (event) => {currentCOLOR3 = hexToRgb(event.target.value)}, false);
  COLOR_PICKER_ELEMENT_BASE.addEventListener("input", (event) => {currentCOLORstorm = hexToRgb(event.target.value)}, false);

  //FREQUENCY ----------------------------------------------------
  var currentFrequency = 5; 
  const FREQUENCY_VALUE = document.getElementById('frequencyValue');
  var frequencyText = document.getElementById('frequencyText');

  FREQUENCY_VALUE.addEventListener("input", (event) => {
    currentFrequency = event.target.value;
    frequencyText.textContent = currentFrequency; 
  }, false);

  //CURL ---------------------------------------------------------
  var curlSpeed = 4.0;
  const CURL_SPEED_SLIDER = document.getElementById('curlSpeed');
  var curlSpeedSliderText = document.getElementById('curlSpeedText');

  CURL_SPEED_SLIDER.addEventListener("input", (event) => {
    curlSpeed = event.target.value;  
    curlSpeedSliderText.textContent = curlSpeed;
  }, false);

  //JET SPEED -----------------------------------------------------
  var jetSpeed = 2.0;
  const JET_SPEED_SLIDER = document.getElementById('jetSpeed');
  var jetSpeedSliderText = document.getElementById('jetSpeedText');

  JET_SPEED_SLIDER.addEventListener("input", (event) => {
    jetSpeed = event.target.value;  
    jetSpeedSliderText.textContent = jetSpeed;
  }, false);

  //BLENDING ------------------------------------------------------
  var blendValue = 0.08;
  const BLEND_SLIDER = document.getElementById('blend');
  var blendSliderText = document.getElementById('blendText');

  BLEND_SLIDER.addEventListener("input", (event) => {
    blendValue = event.target.value;
    blendSliderText.textContent = blendValue;
  }, false);

  //VORTEX --------------------------------------------------------
  var vortexFrequencyValue = 5.0;
  const VORTEX_FREQUENCY_VALUE = document.getElementById('vortexFrequency');
  var vortexFrequencyText = document.getElementById('vortexFrequencyText');

  var vortexChangerateValue = 10000;
  const VORTEX_CHANGE_RATE_VALUE = document.getElementById('vortexChangerate');
  var vortexChangeRateText = document.getElementById('vortexChangerateText');

  VORTEX_CHANGE_RATE_VALUE.addEventListener("input", (event) => {
    vortexChangerateValue = event.target.value;
    vortexChangeRateText.textContent = vortexChangerateValue;
  }, false);

  VORTEX_FREQUENCY_VALUE.addEventListener("input" ,(event) => {
    vortexFrequencyValue = event.target.value;
    vortexFrequencyText.textContent = vortexFrequencyValue;
  }, false);

  window.buttonPRESS = () => {
    buttonPressed = true;
  }

  //THE PHONG LIGHT --------------------------------------------------------
  var lightValue = true;
  const LIGHT_VALUE = document.getElementById('light');
  LIGHT_VALUE.addEventListener("input", (event) => {lightValue = event.target.checked;}, false);

  //THE RINGS --------------------------------------------------------
  var ringsValue = true;
  const RINGS_VALUE = document.getElementById('rings');
  RINGS_VALUE.addEventListener("input", (event) => {ringsValue = event.target.checked;}, false);

  //THE STORM --------------------------------------------------------
  var stormXValue = 0;
  const STORM_VALUE_X = document.getElementById('theStormX');
  var stormXvalueText = document.getElementById('theStormXtext');
  STORM_VALUE_X.addEventListener("input" ,(event) => {
    stormXValue = event.target.value;
    stormXvalueText.textContent = stormXValue;
  }, false);

  var stormYValue = 0;
  const STORM_VALUE_Y = document.getElementById('theStormY');
  var stormYvalueText = document.getElementById('theStormYtext');
  STORM_VALUE_Y.addEventListener("input" ,(event) => {
    stormYValue = event.target.value;
    stormYvalueText.textContent = stormYValue;
  }, false);

  var stormSizeValue = 0;
  const STORM_VALUE_SIZE = document.getElementById('theStormSize');
  var stormSizeValueText = document.getElementById('theStormSizeText');
  STORM_VALUE_SIZE.addEventListener("input" ,(event) => {
    stormSizeValue = event.target.value;
    stormSizeValueText.textContent = stormSizeValue;
  }, false);

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

    canvas.width = PANORAMA_WIDTH;
    canvas.height = PANORAMA_HEIGHT;
    const imageData = new ImageData(new Uint8ClampedArray(pixelData), PANORAMA_WIDTH, PANORAMA_HEIGHT);
    
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

  /**
   * 
   * Creates and prepares the Curl noise simulation scene for rendering.
   * Initializes `sourceRenderTargetTexture` and `destinationRenderTargetTexture`  for later use in the render loop
   * 
   * @returns `curlScene`
   */
  const createCurlScene = function() {
    const curlScene = new BABYLON.Scene(ENGINE);
    const camera = new BABYLON.FreeCamera("orthoCamera", new BABYLON.Vector3(0, 0, 0), curlScene);
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
    curlScene.addCamera(camera);

    //MESH TO RENDER TO
    const plane = BABYLON.MeshBuilder.CreatePlane("plane", {size: size, sideOrientation : BABYLON.Mesh.FRONTSIDE} ,curlScene);
    plane.position.z = 0;
    plane.rotation = BABYLON.Vector3.Zero();

    //MATERIAL FOR SIMULATION
    curlNoiseShaderMAT = new BABYLON.ShaderMaterial("shader", curlScene, "./curlNoise", {
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
    curlNoiseShaderMAT.forceCompilationAsync(plane);
    
    /*  Get initial cubemap texture from  babylon -- NB Not really needed but console logs error when not used

      cubeMap = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
      curlNoise.setTexture("textureSampler", cubeMap);

    */
      const cubeMap = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", curlScene);
      curlNoiseShaderMAT.setTexture("textureSampler", cubeMap);

    sourceRenderTargetTexture = new BABYLON.RenderTargetTexture(
      'render to texture', 
      CUBEMAP_SIZE, // texture size
      curlScene,
      false,
      false,
      BABYLON.WebGPUEngine.TEXTUREFORMAT_RGBA,
      true 
    );
    
    destinationRenderTargetTexture = new BABYLON.RenderTargetTexture(
      'render to texture2',
      CUBEMAP_SIZE, //texture size
      curlScene,
      false,
      false,
      BABYLON.WebGPUEngine.TEXTUREFORMAT_RGBA,
      true
    );
    
    plane.material = curlNoiseShaderMAT;
    
    sourceRenderTargetTexture.renderList.push(plane);
    destinationRenderTargetTexture.renderList.push(plane);
      
    return curlScene;
  }

  /**
   * Creates and prepares the Cylinder scene(`CYLscene`) for rendering.
   * `CYLscene` is used to capture the simulation in a way that it would appear seamless on a sphere
   * 
   * @returns `CYLscene`
   */
  const createCylindricalScene = function() {
    const CYLscene = new BABYLON.Scene(ENGINE);
    const camera = new BABYLON.FreeCamera("orthoCamera", new BABYLON.Vector3(0, 0, 0), CYLscene);
    const size = 5;

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
    CYLscene.addCamera(camera);

    const plane = BABYLON.MeshBuilder.CreatePlane("plane", {size: size,sideOrientation : BABYLON.Mesh.FRONTSIDE} ,CYLscene);
    plane.position.z = 0;
    plane.rotation = BABYLON.Vector3.Zero();

    CYLShaderMAT = new BABYLON.ShaderMaterial("shader", CYLscene, "./cylindricalProjection", {
      attributes: ["position", "uv",],
      uniforms: [
        "worldViewProjection",
        "world",
      ],
    });

    plane.material = CYLShaderMAT;
    CYLShaderMAT.forceCompilationAsync(plane);
    CYLShaderMAT.setTexture("textureSampler", sourceRenderTargetTexture);

    CYLrenderTargetTexture = new BABYLON.RenderTargetTexture(
      'render to texture',
      {width:PANORAMA_WIDTH, height:PANORAMA_HEIGHT},
      CYLscene, 
      false,
      false,
      BABYLON.WebGPUEngine.TEXTUREFORMAT_RGBA,
      false 
    );

    CYLrenderTargetTexture.renderList.push(plane);
    return CYLscene;
  }

  /**
   * Creates and prepares the main 3D Scene for rendering
   * @returns `mainScene`
   */
  const createMainScene = function() {

    const mainScene = new BABYLON.Scene(ENGINE);
    const mainSceneCamera = new BABYLON.ArcRotateCamera("camera2", Math.PI/2, Math.PI/2, 2, new BABYLON.Vector3(0, 0, 10));
    mainSceneCamera.attachControl(CANVAS, true);
    mainScene.activeCamera = mainSceneCamera;
    
    sphereShaderMAT = new BABYLON.ShaderMaterial("shader", mainScene, "./sphereRender", {
      attributes: ["position", "normal", "uv",],
      uniforms: [
        "world",
        "worldView",
        "worldViewProjection",
        "view",
        "projection",
        "time",
        "seed",
        "lightValue"
      ],
    });

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 3 }, mainScene);
    const rings = BABYLON.MeshBuilder.CreatePlane("plane", { size: 10, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, mainScene);
    
    //MATERIAL FOR RINGS SIMULATION
    planetaryRingsMAT = new BABYLON.ShaderMaterial("shaderRings", mainScene, "./planetaryRings", {
      attributes: ["position", "normal", "uv"],
      uniforms: [
        "world",
        "worldView",
        "worldViewProjection",
        "world",
        "time",
        "speed",
      ],
    });
    const randTexture = new BABYLON.Texture("/Ring.png", mainScene);
    planetaryRingsMAT.setTexture("textureSampler", randTexture);
    planetaryRingsMAT.backFaceCulling = false;
    planetaryRingsMAT.alpha = 0.0; //HAS TO BE SET, OR WONT WORK IN SHADER FOR SOME REASON

    rings.position.z = 6;
    rings.rotation.x = 3.14/2; //rotate the rings 90degrees
    rings.material = planetaryRingsMAT;
    sphere.material = sphereShaderMAT;
    sphere.position.z = 6;
    mainSceneCamera.setTarget(sphere.position);
    
  //--------------------------ANIMATION START -----------------------------------------

      const animEarth = new BABYLON.Animation("animEarth", "rotation.y", 3,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
      const sphereAnimationKeys = []; 
      
      sphereAnimationKeys.push({
        frame: 0,
        value: 0  
      });
      
      sphereAnimationKeys.push({
        frame: 340,
        value: 2 * Math.PI
      });
      
      animEarth.setKeys(sphereAnimationKeys);
      
      sphere.animations = [];
      rings.animations = [];
      sphere.animations.push(animEarth);
      rings.animations.push(animEarth);
      scene.beginAnimation(sphere, 0, 340, true);
      scene.beginAnimation(rings, 0, 340, true);

  //--------------------------ANIMATION END -----------------------------------------
    
    mainScene.clearColor = new BABYLON.Color3(0.0, 0.0, 0.0); //background color
    return mainScene;
  }
    
    // Create the scene and run the engine
    const scene = createCurlScene();
    const mainScene = createMainScene();

    createCylindricalScene();   //For saving the simulations 

    /**
     * 
     * @param faceIndex - Cubemap face index
     * 
     * Sends correct matrices to the shader based on cubemap face index 
     */
    const handleFaceIndex = (faceIndex) => {
      switch (faceIndex) {
        case 0:
          curlNoiseShaderMAT.setVector3("t", new BABYLON.Vector3(1., 0., 0.));
          curlNoiseShaderMAT.setVector3("M1", new BABYLON.Vector3(0., 0., 0.));
          curlNoiseShaderMAT.setVector3("M2", new BABYLON.Vector3(0., -1., 0.));
          curlNoiseShaderMAT.setVector3("M3", new BABYLON.Vector3(-1., 0., 0.));
          break;
        case 1:
          curlNoiseShaderMAT.setVector3("t", new BABYLON.Vector3(-1., 0., 0.));   
          curlNoiseShaderMAT.setVector3("M1", new BABYLON.Vector3(0., 0., 0.));
          curlNoiseShaderMAT.setVector3("M2", new BABYLON.Vector3(0., -1., 0.));
          curlNoiseShaderMAT.setVector3("M3", new BABYLON.Vector3(1., 0., 0.));
          break;
        case 2:
          curlNoiseShaderMAT.setVector3("t", new BABYLON.Vector3(0., 1., 0.));   
          curlNoiseShaderMAT.setVector3("M1", new BABYLON.Vector3(1., 0., 0.));
          curlNoiseShaderMAT.setVector3("M2", new BABYLON.Vector3(0., 0., 0.));
          curlNoiseShaderMAT.setVector3("M3", new BABYLON.Vector3(0., 1., 0.));
          break;
        case 3:
          curlNoiseShaderMAT.setVector3("t", new BABYLON.Vector3(0., -1., 0.));   
          curlNoiseShaderMAT.setVector3("M1", new BABYLON.Vector3(1., 0., 0.));
          curlNoiseShaderMAT.setVector3("M2", new BABYLON.Vector3(0., 0., 0.));
          curlNoiseShaderMAT.setVector3("M3", new BABYLON.Vector3(0., -1., 0.));
          break;
        case 4:
          curlNoiseShaderMAT.setVector3("t", new BABYLON.Vector3(0., 0., 1.));   
          curlNoiseShaderMAT.setVector3("M1", new BABYLON.Vector3(1., 0., 0.));
          curlNoiseShaderMAT.setVector3("M2", new BABYLON.Vector3(0., -1., 0.));
          curlNoiseShaderMAT.setVector3("M3", new BABYLON.Vector3(0., 0., 0.));
          break;
        case 5:
          curlNoiseShaderMAT.setVector3("t", new BABYLON.Vector3(0., 0., -1.));   
          curlNoiseShaderMAT.setVector3("M1", new BABYLON.Vector3(-1., 0., 0.));
          curlNoiseShaderMAT.setVector3("M2", new BABYLON.Vector3(0., -1., 0.));
          curlNoiseShaderMAT.setVector3("M3", new BABYLON.Vector3(0., 0., 0.));
          break;
      }
      };
                
  destinationRenderTargetTexture.onBeforeRenderObservable.add(handleFaceIndex);
  sourceRenderTargetTexture.onBeforeRenderObservable.add(handleFaceIndex);
                
  var previousTime = 0;
  var sleepDuration = 0.0;
  ENGINE.runRenderLoop(async function()
  {
    let currentTime = performance.now();
    divFps.innerHTML = ENGINE.getFps().toFixed() + " fps";

    if (currentTime - previousTime > sleepDuration) {
      previousTime = currentTime;
    } else return;
      

    scene.render();
    mainScene.render();

    if (buttonPressed) {
      CYLrenderTargetTexture.onAfterRenderObservable.addOnce(async function(data){
        console.log(CYLrenderTargetTexture);
        await CYLrenderTargetTexture.readPixels().then((data) => {
          // Convert to an image and send to backend                        
          sendImageToBackend(data);
        });
      });
      CYLrenderTargetTexture.render();
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
      if (destinationRenderTargetTexture.isReadyForRendering()) {

        destinationRenderTargetTexture.render();
        [sourceRenderTargetTexture, destinationRenderTargetTexture] = [destinationRenderTargetTexture, sourceRenderTargetTexture];
        curlNoiseShaderMAT.setTexture("textureSampler", sourceRenderTargetTexture);
        sphereShaderMAT.setTexture("textureSampler", sourceRenderTargetTexture);

        //For saving the simulations  
        CYLShaderMAT.setTexture("textureSampler", sourceRenderTargetTexture);
      }
    });

    // UNIFORM FOR SHADERS
    curlNoiseShaderMAT.setVector3("spotCOLOR", new BABYLON.Vector3(currentCOLOR.r/255.0, currentCOLOR.g/255.0, currentCOLOR.b/255.0));
    curlNoiseShaderMAT.setVector3("spotCOLOR2", new BABYLON.Vector3(currentCOLOR2.r/255.0, currentCOLOR2.g/255.0, currentCOLOR2.b/255.0));
    curlNoiseShaderMAT.setVector3("spotCOLOR3", new BABYLON.Vector3(currentCOLOR3.r/255.0, currentCOLOR3.g/255.0, currentCOLOR3.b/255.0));
    curlNoiseShaderMAT.setVector3("spotCOLOR3", new BABYLON.Vector3(currentCOLOR3.r/255.0, currentCOLOR3.g/255.0, currentCOLOR3.b/255.0));
    curlNoiseShaderMAT.setFloat("stormXValue", stormXValue);
    curlNoiseShaderMAT.setFloat("stormYValue", stormYValue);
    curlNoiseShaderMAT.setFloat("stormSizeValue", stormSizeValue);
    curlNoiseShaderMAT.setVector3("currentCOLORstorm", new BABYLON.Vector3(currentCOLORstorm.r/255.0, currentCOLORstorm.g/255.0, currentCOLORstorm.b/255.0));
    curlNoiseShaderMAT.setFloat("currentFrequency", currentFrequency);
    curlNoiseShaderMAT.setFloat("time", currentTime);
    curlNoiseShaderMAT.setFloat("curlSpeed", curlSpeed);
    curlNoiseShaderMAT.setFloat("jetSpeed", jetSpeed);
    curlNoiseShaderMAT.setFloat("blendValue", blendValue);
    curlNoiseShaderMAT.setFloat("speed", speedValue);
    curlNoiseShaderMAT.setFloat("vortexChangerate", vortexChangerateValue); 
    curlNoiseShaderMAT.setFloat("vortexFrequency", vortexFrequencyValue);
    sphereShaderMAT.setInt("lightValue", lightValue);

    planetaryRingsMAT.setInt("ringsValue", ringsValue);
    planetaryRingsMAT.setInt("lightValue", lightValue);
  });

  // Handle window resizing
  window.addEventListener('resize', function() {
    ENGINE.resize();
  });
})(window, document);