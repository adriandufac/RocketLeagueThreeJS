import Game from "../Game";
import * as THREE from "three";

export default class Environment {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.debug = this.game.debug;
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("environment");
    }
    //Light
    this.setAmbientLight();
    this.setDirectionalLight();
  }

  setAmbientLight() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(this.ambientLight);
    //debug
    if (this.debug.active) {
      this.debugFolder
        .add(this.ambientLight, "intensity")
        .min(0)
        .max(10)
        .step(0.001)
        .name("ambientLightIntensity");
    }
  }
  setDirectionalLight() {
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
    this.sunLight.position.set(1, 10, 3);
    this.sunLight.castShadow = true; // Enable shadow casting

    // Configure shadow properties
    this.sunLight.shadow.mapSize.width = 1024; // Higher resolution shadows
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 50;
    this.sunLight.shadow.camera.left = -10;
    this.sunLight.shadow.camera.right = 10;
    this.sunLight.shadow.camera.top = 10;
    this.sunLight.shadow.camera.bottom = -10;
    this.scene.add(this.sunLight);
    //debug
    if (this.debug.active) {
      this.debugFolder
        .add(this.sunLight, "intensity")
        .min(0)
        .max(10)
        .step(0.001)
        .name("sunLightIntensity");

      this.debugFolder
        .add(this.sunLight.position, "x")
        .min(-5)
        .max(5)
        .step(0.001)
        .name("sunLightX");

      this.debugFolder
        .add(this.sunLight.position, "y")
        .min(-5)
        .max(5)
        .step(0.001)
        .name("sunLightY");

      this.debugFolder
        .add(this.sunLight.position, "z")
        .min(-5)
        .max(5)
        .step(0.001)
        .name("sunLightZ");
    }
    const helper = new THREE.DirectionalLightHelper(this.sunLight, 5);
    this.scene.add(helper);
  }
}
