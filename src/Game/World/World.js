import * as THREE from "three";
import Game from "../Game";
import Environment from "./Environment";

export default class World {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;

    //Test Cube
    const testMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial()
    );
    this.scene.add(testMesh);

    //setup
    this.environment = new Environment();
  }
}
