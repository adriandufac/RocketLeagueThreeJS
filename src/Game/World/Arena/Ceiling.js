import * as THREE from "three";
import Game from "../../Game";
import { sizes } from "./sizes";

export default class Ceiling {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.physics = this.game.physics;

    // Arena dimensions based on floor size
    this.arenaWidth = sizes.width;
    this.arenaLength = sizes.length;
    this.arenaHeight = sizes.height; // Same as width

    this.ceilingColor = 0x606060; // Slightly darker than walls

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(
      this.arenaWidth,
      this.arenaLength,
      1,
      1
    );
  }

  setMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      color: this.ceilingColor,
      side: THREE.DoubleSide,
      roughness: 0.7,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    // Rotate and position the ceiling
    this.mesh.rotation.x = Math.PI * 0.5; // Rotate to face down
    this.mesh.position.y = this.arenaHeight; // Position at top of arena

    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);

    // Add physics
    if (this.physics) {
      this.physicsBody = this.physics.addEntity(this);
    }
  }
}
