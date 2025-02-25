import * as THREE from "three";
import Game from "../../Game";

export default class Floor {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.ressources = this.game.ressources;
    this.physics = this.game.physics;

    this.setGeometry();
    this.setTextures();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(50, 140, 1, 1);
  }

  setTextures() {}

  setMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      color: 0x808080,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI * 0.5;
    //this.mesh.position.y = -0.5;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
    this.physicsBody = this.physics.addEntity(this);
  }
}
