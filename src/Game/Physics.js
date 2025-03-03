import Game from "./Game.js";
import RAPIER from "@dimforge/rapier3d-compat";
import Car from "./World/Car.js";
import Floor from "./World/Arena/Floor.js";
import Ball from "./World/Ball.js";
import * as THREE from "three";

export default class Physics {
  constructor() {
    this.game = new Game();
    this.debug = this.game.debug;
    this.gravity = { x: 0, y: -5, z: 0 };
    this.physicsObjects = [];
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("physics");
      this.debugFolder
        .add(this.gravity, "y")
        .min(-20)
        .max(0)
        .step(0.01)
        .name("gravity");
    }
    this.init();
  }

  async init() {
    // Import RAPIER dynamically
    const RAPIER = await import("@dimforge/rapier3d-compat");

    // Initialize WASM module
    await RAPIER.init();

    // Store RAPIER for use in other methods
    this.RAPIER = RAPIER;

    // Create physics world (note capital W in World)
    this.world = new RAPIER.World(this.gravity);

    // Trigger any waiting functions
    if (this.onReady) this.onReady();
  }

  addEntity(entity) {
    if (!this.world || !this.RAPIER) {
      // Queue this entity to be added when physics is ready
      this.entitiesToAdd = this.entitiesToAdd || [];
      this.entitiesToAdd.push(entity);
      return null;
    }

    if (entity instanceof Car) {
      const carHitBoxGeometry = entity.hitBoxGeometry;
      const carHitBoxMesh = entity.carHitbox;
      const size = {
        x: carHitBoxGeometry.parameters.width,
        y: carHitBoxGeometry.parameters.height,
        z: carHitBoxGeometry.parameters.depth,
      };

      const boxRigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(
          carHitBoxMesh.position.x,
          carHitBoxMesh.position.y,
          carHitBoxMesh.position.z
        )
        .setAngularDamping(2.0);
      // Set initial velocity to zero to prevent immediate falling
      boxRigidBodyDesc.setLinvel(0, 0, 0);

      const boxRigidBody = this.world.createRigidBody(boxRigidBodyDesc);
      const boxColliderDesc = RAPIER.ColliderDesc.cuboid(
        size.x / 2,
        size.y / 2,
        size.z / 2
      );
      const collider = this.world.createCollider(boxColliderDesc, boxRigidBody);
      this.physicsObjects.push({
        entity: entity,
        rigidBody: boxRigidBody,
      });

      return { boxRigidBody, collider };
    }

    if (entity instanceof Floor) {
      const floorMesh = entity.mesh;
      const width = floorMesh.geometry.parameters.width;
      const height = floorMesh.geometry.parameters.height;
      const thickness = 0.1; // Small thickness for collision

      // Get world position
      const position = new THREE.Vector3();
      floorMesh.getWorldPosition(position);

      // Rapier floor rigid body (static)
      const floorRigidBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
        position.x,
        position.y,
        position.z
      );
      const floorRigidBody = this.world.createRigidBody(floorRigidBodyDesc);
      const floorColliderDesc = RAPIER.ColliderDesc.cuboid(
        width / 2,
        thickness / 2,
        height / 2
      );
      this.world.createCollider(floorColliderDesc, floorRigidBody);
      this.physicsObjects.push({
        entity: entity,
        rigidBody: floorRigidBody,
      });
      return floorRigidBody;
    }
    if (entity instanceof Ball) {
      // Get ball properties
      const ballMesh = entity.mesh;
      const ballRadius = entity.radius || ballMesh.geometry.parameters.radius;

      // Get world position
      const position = new THREE.Vector3();
      ballMesh.getWorldPosition(position);

      // Create dynamic rigid body for ball
      const ballRigidBodyDesc = this.RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(position.x, position.y, position.z)
        .setAngularDamping(0.2) // Less angular damping than car for more realistic rolling
        .setLinearDamping(0.1); // Some linear damping to prevent endless rolling

      // Create rigid body
      const ballRigidBody = this.world.createRigidBody(ballRigidBodyDesc);

      // Create spherical collider
      const ballColliderDesc = this.RAPIER.ColliderDesc.ball(ballRadius)
        .setRestitution(0.7) // Bounciness
        .setFriction(0.3); // Surface friction

      const collider = this.world.createCollider(
        ballColliderDesc,
        ballRigidBody
      );

      // Add to physics objects array
      this.physicsObjects.push({
        entity: entity,
        rigidBody: ballRigidBody,
      });

      return { ballRigidBody, collider };
    }
  }

  removeEntity(entity) {
    if (!this.world) {
      return false;
    }
    const index = this.physicsObjects.findIndex((obj) => obj.entity === entity);

    if (index !== -1) {
      const physicsObject = this.physicsObjects[index];

      // Get the rigid body
      const rigidBody = physicsObject.rigidBody;

      if (rigidBody) {
        // Remove all colliders attached to this rigid body
        this.world.removeRigidBody(rigidBody);

        // Log for debugging
      }

      // Remove from our tracking array
      this.physicsObjects.splice(index, 1);

      return true;
    } else {
      // Could also check by body directly if entity reference is lost
      if (entity.physicsBody) {
        this.world.removeRigidBody(entity.physicsBody);

        // Find and remove from array by rigid body
        const bodyIndex = this.physicsObjects.findIndex(
          (obj) => obj.rigidBody === entity.physicsBody
        );
        if (bodyIndex !== -1) {
          this.physicsObjects.splice(bodyIndex, 1);
        }

        return true;
      }

      return false;
    }
  }
  update() {
    if (this.world) {
      this.world.step();
      // Immediately update all visual representations
      for (const obj of this.physicsObjects) {
        if (obj.entity && typeof obj.entity.updatePhysics === "function") {
          obj.entity.updatePhysics(obj.rigidBody);
        }
      }
    }
  }
  onReady() {
    this.game.physicsDebug.setup();
    this.game.physicsReady = true;
  }
}
