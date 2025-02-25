import Game from "./Game.js";
import RAPIER from "@dimforge/rapier3d-compat";
import Car from "./World/Car.js";
import Floor from "./World/Arena/Floor.js";
import * as THREE from "three";

export default class Physics {
  constructor() {
    this.game = new Game();
    this.debug = this.game.debug;
    this.gravity = { x: 0, y: -9, z: 0 };
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

    console.log("Physics initialized!");

    // Trigger any waiting functions
    if (this.onReady) this.onReady();
  }

  addEntity(entity) {
    if (!this.world || !this.RAPIER) {
      console.warn("Physics not initialized yet");
      // Queue this entity to be added when physics is ready
      this.entitiesToAdd = this.entitiesToAdd || [];
      this.entitiesToAdd.push(entity);
      return null;
    }

    if (entity instanceof Car) {
      console.log("its a car");
      const carHitBoxGeometry = entity.hitBoxGeometry;
      const carHitBoxMesh = entity.carHitbox;
      const size = {
        x: carHitBoxGeometry.parameters.width,
        y: carHitBoxGeometry.parameters.height,
        z: carHitBoxGeometry.parameters.depth,
      };
      console.log(size);

      const boxRigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
        carHitBoxMesh.position.x,
        carHitBoxMesh.position.y,
        carHitBoxMesh.position.z
      );
      // Set initial velocity to zero to prevent immediate falling
      boxRigidBodyDesc.setLinvel(0, 0, 0);

      const boxRigidBody = this.world.createRigidBody(boxRigidBodyDesc);
      const boxColliderDesc = RAPIER.ColliderDesc.cuboid(
        size.x / 2,
        size.y / 2,
        size.z / 2
      );
      this.world.createCollider(boxColliderDesc, boxRigidBody);
      this.physicsObjects.push({
        entity: entity,
        rigidBody: boxRigidBody,
      });

      return boxRigidBody;
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
  }

  removeEntity(entity) {
    if (!this.world) {
      console.warn("Physics not initialized yet - cannot remove entity");
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
        console.log(`Removed physics entity: ${entity.type || "unknown"}`);
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

      console.warn("Entity not found in physics system");
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
}
