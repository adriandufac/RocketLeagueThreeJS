import Game from "../Game";
import * as THREE from "three";

export default class Environment {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;

    //Light
    this.setAmbientLight();
    this.setDirectionalLight();
  }

  setAmbientLight() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(this.ambientLight);
  }
  setDirectionalLight() {
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(1, 2, 3);
    this.scene.add(this.directionalLight);
  }
}
