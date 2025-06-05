import * as BABYLON from '@babylonjs/core';

// Setup canvas and engine
const canvas = document.getElementById('renderCanvas2');
const engine2 = new BABYLON.Engine(canvas, true, {antialias: true}); // Enable anti-aliasing

const createScene = function() {
  const scene2 = new BABYLON.Scene(engine2);
  
  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 40, new BABYLON.Vector3(0, 0, 0), scene2);
  camera.attachControl(canvas, true);  
  camera.setTarget(BABYLON.Vector3.Zero());    
  
  var texture1 = new BABYLON.Texture("http://localhost:5000/latest1" ,scene2);
  var texture2 = new BABYLON.Texture("http://localhost:5000/latest2" ,scene2);
  var texture3 = new BABYLON.Texture("http://localhost:5000/latest3" ,scene2);
  var texture4 = new BABYLON.Texture("http://localhost:5000/latest4" ,scene2);
  var texture5 = new BABYLON.Texture("http://localhost:5000/latest5" ,scene2);


  // Create a sphere
  const sphereMain = BABYLON.MeshBuilder.CreateSphere("sphereMain", { diameter: 9 }, scene2);
  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 3 }, scene2);
  const sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere2", { diameter: 3 }, scene2);
  const sphere3= BABYLON.MeshBuilder.CreateSphere("sphere3", { diameter: 3 }, scene2);
  const sphere4 = BABYLON.MeshBuilder.CreateSphere("sphere4", { diameter: 3 }, scene2);

  const standardMaterial5 = new BABYLON.StandardMaterial("myMaterial5", scene2);
  const standardMaterial1 = new BABYLON.StandardMaterial("myMaterial1", scene2);
  const standardMaterial2 = new BABYLON.StandardMaterial("myMaterial2", scene2);
  const standardMaterial3 = new BABYLON.StandardMaterial("myMaterial3", scene2);
  const standardMaterial4 = new BABYLON.StandardMaterial("myMaterial4", scene2);

  standardMaterial5.diffuseTexture = texture5;
  standardMaterial1.diffuseTexture = texture1;
  standardMaterial2.diffuseTexture = texture2;
  standardMaterial3.diffuseTexture = texture3;
  standardMaterial4.diffuseTexture = texture4;

  sphere.material = standardMaterial5;
  sphere2.material = standardMaterial1;
  sphere3.material = standardMaterial2;
  sphere4.material = standardMaterial3;
  sphereMain.material = standardMaterial4;

  sphere2.position.x = -10;
  sphere2.position.y = 5;
  sphere2.position.z = 5;

  sphere3.position.x = 9;
  sphere3.position.y = 3;
  sphere3.position.z = -5;

  sphere4.position.y = -2;
  sphere4.position.x = -11;
  sphere4.position.z = -5;

  sphere.position.z = 13;
  sphere.position.y = 4;
  scene2.clearColor = new BABYLON.Color3(0.0, 0.0, 0.0);
  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene2);
  light.specular = new BABYLON.Color3(0, 0, 0);

  
  return scene2;
};

setInterval(() => {
  fetch("http://localhost:5000/update2")
      .then(response => response.json())
      .then(data => {
          if (data.success === true) {
              console.log("Success received! Taking action...");
              location.reload();  
            } else {
              console.log("Nothing to udpate", data);
          }
      })
      .catch(error => console.error("Error fetching update2:", error));
}, 15000);

// Create the scene
var scene2 = createScene();
scene2.render();

// Run the engine's render loop
engine2.runRenderLoop(function() {
    scene2.render();
});

// Handle window resizing
window.addEventListener('resize', function() {
    engine2.resize();
});
