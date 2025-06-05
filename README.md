### Steps to run the simulation:

PS! This application require Node Package Manager (npm) to run.
- Npm comes bundled with Node.js which can be downloaded for MacOS and Windows from https://nodejs.org
- For linux requiring npm can be done using command: `sudo apt install nodejs npm`

1. Install all npm packages by running command `npm install`
	1.1 This should create a folder node_modules/ as well as file `package-lock.json`

2. To run the simulation: `npm run dev`
	2.1 The simulation should then run on http://localhost:5173/
	NOTE: This may take a few seconds to load. If browser console gives errors, try refreshing the page (Shaders sometimes have trouble loading the first time.)  
	
3. To run the backend server and save the textures as .png files: `node ./src/server.js`
	3.1. Previously saved 5 local textures should be shown on spheres  on http://localhost:5173/doneGenerations`.
		Red black checkerboard means no texture found for that sphere.

### Configuration panel

- The simulation camera/view can be moved by holding down the left mouse button and dragging the mouse.

- `Speed of simulation`: Increases the length of all velocity vectors thus making the simulation faster. (Might cause artefacts at  higher values)
- `JET COLOR 1`, `JET COLOR 2`, `JET COLOR 2`:Colorpickers to change the color of jets.
- `Jet amplitude`: Increases or decreases the number of jets as well as the width of jets.
- `Curl Speed`: Increases or decreases the length of velocity vectors of storms only, thus making the storms faster.
- `Jet Speed`: : Increases or decreases the length of velocity vectors of jets only, thus making the jets flow faster.
- `Blend factor`: changes how much the colors of the simulation mix.
- `Vortex change rate`: Changes the rate at which new micro storms form and dissapear. Smaller values increase the rate.
- `Vortex frequency`: Changes the size and amount of micro storms caused by noise by resizing the underlying noise.
- `Phong lighting`: Enabel/disable the use of phong lighting.
- `Rings`: Enabel/disable the use of planetary rings.

- Storm options
	- `xPOS`: Change the location of the storm horizontally.
	- `yPOS`: Change the location of the storm vertically.
	- `Color`: Changes the storms color.
	- `Storm size`: Changes the size of the big storm.
