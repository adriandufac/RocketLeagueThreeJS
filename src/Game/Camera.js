import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Game from "./Game";

export default class Camera {
  constructor() {
    this.game = new Game(); // since its a singleton it will return the experience  the camera is created in
    this.sizes = this.game.sizes;
    this.scene = this.game.scene;
    this.canvas = this.game.canvas;
    this.wasCarInAirLastFrame = false;
    this.setInstance();
    this.setControls();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      130
    );
    this.instance.position.set(4, 6, 7);
    console.log("camera instance", this.instance);
    this.scene.add(this.instance);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    console.log(this.controls);
    this.controls.enableDamping = true;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
    console.log("camera resize, aspect ratio updated", this.instance.aspect);
  }

  getCarPosition() {
    if (this.game.physicsReady === true) {
      if (!this.game.physics.physicsObjects) return;
      const physicsObj = this.game.physics.physicsObjects.find(
        (obj) => obj.entity.id === 1
      );
      if (!physicsObj) return;
      const rotation = physicsObj.rigidBody.rotation();
      const position = physicsObj.rigidBody.translation(); //boxRigidBody.translation();
      const isCarGrounded = this.game.world.car.carGrounded;
      return { position, rotation, isCarGrounded };
    }
  }

  updateCameraPosition(carData) {
    if (!carData) return;

    const { position, rotation, isCarGrounded } = carData;
    if (!position || !rotation) return;

    // Initialize properties if they don't exist yet
    if (this.wasCarInAirLastFrame === undefined) {
      this.wasCarInAirLastFrame = false;
    }

    if (this.transitionProgress === undefined) {
      this.transitionProgress = 1.0; // Fully using ground rotation by default
    }

    if (this.airRotation === undefined) {
      this.airRotation = new THREE.Quaternion();
    }

    // Create current car rotation quaternion
    const currentRotation = new THREE.Quaternion(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );

    // State handling when car is grounded
    if (isCarGrounded) {
      // Car just landed after being in the air
      if (this.wasCarInAirLastFrame) {
        // Store the rotation we were using in air as our starting point for the transition
        this.airRotation.copy(this.lastGroundedRotation);
        // Start the transition
        this.transitionProgress = 0.0;
        this.wasCarInAirLastFrame = false;
      }

      // While car is on ground and transition is not complete
      if (this.transitionProgress < 1.0) {
        // Advance the transition (adjust the 0.05 to control transition speed)
        this.transitionProgress = Math.min(this.transitionProgress + 0.05, 1.0);
      } else {
        // Once transition is complete, update the grounded rotation
        this.lastGroundedRotation = currentRotation.clone();
      }
    } else {
      // Car is in the air
      this.wasCarInAirLastFrame = true;
      // While in air, we don't update lastGroundedRotation
    }

    // If we don't have a lastGroundedRotation yet, initialize it
    if (!this.lastGroundedRotation) {
      this.lastGroundedRotation = currentRotation.clone();
    }

    // Calculate the blended quaternion
    let cameraQuaternion;

    if (isCarGrounded && this.transitionProgress < 1.0) {
      // During landing transition, slerp between air rotation and current rotation
      cameraQuaternion = new THREE.Quaternion();
      // Use the instance method approach that works in all Three.js versions
      cameraQuaternion
        .copy(this.airRotation)
        .slerp(currentRotation, this.transitionProgress);
    } else if (isCarGrounded) {
      // Fully grounded and transition complete
      cameraQuaternion = currentRotation;
    } else {
      // In air
      cameraQuaternion = this.lastGroundedRotation;
    }

    // Calculate backward direction vector using blended quaternion
    const backward = new THREE.Vector3(-1, 0, 0).applyQuaternion(
      cameraQuaternion
    );

    // Calculate camera position
    const cameraPosition = new THREE.Vector3(
      position.x + backward.x * 6,
      position.y + 1.6, // 1.6 meters above
      position.z + backward.z * 6
    );

    // Update camera position
    this.instance.position.copy(cameraPosition);

    // Make camera look at the car
    this.instance.lookAt(position.x, position.y, position.z);
  }
  update() {
    this.controls.update();
    this.updateCameraPosition(this.getCarPosition());
    //this.getCarPosition();
  }
}
