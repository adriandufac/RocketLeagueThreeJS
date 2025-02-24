import Game from "../Game";
import * as THREE from "three";
export default class Car {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.ressources = this.game.ressources;
    this.time = this.game.time;

    //setup
    this.ressource = this.ressources.items["octaneModel"];

    this.setModel();
  }

  setModel() {
    this.model = this.ressource.scene;

    this.model.scale.set(0.01, 0.01, 0.01);

    this.scene.add(this.model);

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    //todo get rid of this when done
    const size = new THREE.Vector3();
    this.boundingBox = new THREE.Box3().setFromObject(this.model);
    console.log(this.boundingBox.getSize(size));
  }
  update() {}
}
