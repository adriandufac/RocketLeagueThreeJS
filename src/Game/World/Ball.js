import Game from "../Game.js";
import * as THREE from "three";
export default class Ball {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.physics = this.game.physics;

    // Configuration
    this.radius = 0.8;
    this.position = { x: 0, y: 5, z: 0 }; // Slightly above ground level

    this.setGeometry();
    this.setTextures();
    this.setMaterial();
    this.setMesh();
  }
  setGeometry() {
    // Create a sphere geometry
    this.geometry = new THREE.SphereGeometry(this.radius, 32, 32);
  }
  setTextures() {}
  setMaterial() {
    // Create a standard material with good lighting response
    this.material = new THREE.MeshStandardMaterial({
      color: 0x2266cc, // Blue color
      roughness: 0.2, // Slightly glossy
      metalness: 0.1, // Slightly metallic
      envMapIntensity: 0.5,
    });
  }
  setMesh() {
    // Create the mesh by combining geometry and material
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    // Set position
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);

    // Enable shadows
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Add to scene
    this.scene.add(this.mesh);
    this.physicsBody = this.physics.addEntity(this);
  }
  update() {
    // Update the mesh position with the physics body position
    if (this.physicsBody.ballRigidBody) {
      const position = this.physicsBody.ballRigidBody.translation();
      this.mesh.position.set(position.x, position.y, position.z);
    }
  }
}
