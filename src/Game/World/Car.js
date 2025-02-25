import Game from "../Game";
import * as THREE from "three";

export default class Car {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.ressources = this.game.ressources;
    this.time = this.game.time;
    this.debug = this.game.debug;
    this.physics = this.game.physics;
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("car");
    }

    this.debugObject = {};
    this.debugObject.scale = 0.01;
    this.debugObject.hitBoxRatios = {
      x: 0.8,
      y: 0.9,
    };

    //setup
    this.ressource = this.ressources.items["octaneModel"];

    if (this.debug.active) {
      this.debugFolder
        .add(this.debugObject.hitBoxRatios, "x")
        .min(0.5)
        .max(1.5)
        .step(0.1)
        .name("hitboxXratio")
        .onChange(() => {
          let currentPosition;
          if (this.physicsBody) {
            const translation = this.physicsBody.translation();
            currentPosition = new THREE.Vector3(
              translation.x,
              translation.y,
              translation.z
            );
          } else {
            currentPosition = this.carHitbox.position.clone();
          }

          // Also store current rotation if needed
          let currentRotation;
          if (this.physicsBody) {
            const rotation = this.physicsBody.rotation();
            currentRotation = new THREE.Quaternion(
              rotation.x,
              rotation.y,
              rotation.z,
              rotation.w
            );
          } else {
            currentRotation = this.carHitbox.quaternion.clone();
          }

          //clean
          this.scene.remove(this.model);
          this.scene.remove(this.carHitbox);
          this.physics.removeEntity(this);

          // Create new objects at the origin first
          this.setModel(new THREE.Vector3(0, 0, 0));
          this.setHitBox(true);

          // Manually position both objects at the saved position
          this.carHitbox.position.copy(currentPosition);
          this.model.position.copy(currentPosition);

          // Apply saved rotation if needed
          this.carHitbox.quaternion.copy(currentRotation);
          this.model.quaternion.copy(currentRotation);

          this.physicsBody = this.physics.addEntity(this);
        });
      this.debugFolder
        .add(this.debugObject.hitBoxRatios, "y")
        .min(0.5)
        .max(1.5)
        .step(0.1)
        .name("hitboxYratio")
        .onChange(() => {
          let currentPosition;
          if (this.physicsBody) {
            const translation = this.physicsBody.translation();
            currentPosition = new THREE.Vector3(
              translation.x,
              translation.y,
              translation.z
            );
          } else {
            currentPosition = this.carHitbox.position.clone();
          }

          // Also store current rotation if needed
          let currentRotation;
          if (this.physicsBody) {
            const rotation = this.physicsBody.rotation();
            currentRotation = new THREE.Quaternion(
              rotation.x,
              rotation.y,
              rotation.z,
              rotation.w
            );
          } else {
            currentRotation = this.carHitbox.quaternion.clone();
          }

          //clean
          this.scene.remove(this.model);
          this.scene.remove(this.carHitbox);
          this.physics.removeEntity(this);

          // Create new objects at the origin first
          this.setModel(new THREE.Vector3(0, 0, 0));
          this.setHitBox(true);

          // Manually position both objects at the saved position
          this.carHitbox.position.copy(currentPosition);
          this.model.position.copy(currentPosition);

          // Apply saved rotation if needed
          this.carHitbox.quaternion.copy(currentRotation);
          this.model.quaternion.copy(currentRotation);

          this.physicsBody = this.physics.addEntity(this);
        });
      this.debugFolder
        .add(this.debugObject, "scale")
        .min(0.001)
        .max(0.1)
        .step(0.001)
        .name("scale")
        .onChange(() => {
          let currentPosition;
          if (this.physicsBody) {
            const translation = this.physicsBody.translation();
            currentPosition = new THREE.Vector3(
              translation.x,
              translation.y,
              translation.z
            );
          } else {
            currentPosition = this.carHitbox.position.clone();
          }

          // Also store current rotation if needed
          let currentRotation;
          if (this.physicsBody) {
            const rotation = this.physicsBody.rotation();
            currentRotation = new THREE.Quaternion(
              rotation.x,
              rotation.y,
              rotation.z,
              rotation.w
            );
          } else {
            currentRotation = this.carHitbox.quaternion.clone();
          }

          //clean
          this.scene.remove(this.model);
          this.scene.remove(this.carHitbox);
          this.physics.removeEntity(this);

          // Create new objects at the origin first
          this.setModel(new THREE.Vector3(0, 0, 0));
          this.setHitBox(true);

          // Manually position both objects at the saved position
          this.carHitbox.position.copy(currentPosition);
          this.model.position.copy(currentPosition);

          // Apply saved rotation if needed
          this.carHitbox.quaternion.copy(currentRotation);
          this.model.quaternion.copy(currentRotation);

          this.physicsBody = this.physics.addEntity(this);
        });
    }

    this.setModel();
    this.setHitBox();
  }

  setModel(position) {
    this.model = this.ressource.scene;
    if (position) {
      this.model.position.set(position.x, position.y, position.z);
    } else {
      this.model.position.set(0, 5, 0);
    }
    this.model.scale.set(
      this.debugObject.scale,
      this.debugObject.scale,
      this.debugObject.scale
    );
    this.scene.add(this.model);

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  setHitBox(debuging) {
    this.boundingBox = new THREE.Box3().setFromObject(this.model);
    const size = this.boundingBox.getSize(new THREE.Vector3());
    const center = this.boundingBox.getCenter(new THREE.Vector3());

    this.hitBoxGeometry = new THREE.BoxGeometry(
      size.x * this.debugObject.hitBoxRatios.x,
      size.y * this.debugObject.hitBoxRatios.y,
      size.z
    );
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00, // Green color
      wireframe: true, // Make it wireframe
      transparent: true, // Enable transparency
      opacity: 0.5, // Semi-transparent
    });
    this.carHitbox = new THREE.Mesh(this.hitBoxGeometry, wireframeMaterial);
    this.carHitbox.position.copy(center);
    this.boxModelOffset = center.y - this.model.position.y;
    this.carHitboxOffset = (size.y * (1 - this.debugObject.hitBoxRatios.y)) / 2;
    this.carHitbox.position.y -= this.carHitboxOffset;
    this.scene.add(this.carHitbox);
    if (!debuging) {
      this.physicsBody = this.physics.addEntity(this);
    }
  }

  update() {
    if (this.physicsBody) {
      // Get position from physics simulation
      const position = this.physicsBody.translation();

      // Update hitbox position
      this.carHitbox.position.set(position.x, position.y, position.z);
      // Update model position to match hitbox
      // Calculate the offset between the hitbox center and model origin

      // Update model position to match the hitbox, applying the offset
      console.log(this.boxModelOffset);
      this.model.position.set(
        position.x,
        position.y - this.boxModelOffset + this.carHitboxOffset,
        position.z
      );

      // Get rotation from physics simulation
      const rotation = this.physicsBody.rotation();

      // Apply rotation to both hitbox and model
      this.carHitbox.quaternion.set(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w
      );
      this.model.quaternion.copy(this.carHitbox.quaternion);
    }
  }
}
