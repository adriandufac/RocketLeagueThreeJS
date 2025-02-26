import Game from "../Game";
import * as THREE from "three";

export default class Car {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.ressources = this.game.ressources;
    this.isMovingForward = false;
    this.isMovingBackward = false;
    this.time = this.game.time;
    this.debug = this.game.debug;
    this.physics = this.game.physics;
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("car");
    }
    this.carGrounded = true;
    this.debugObject = {};
    this.debugObject.scale = 0.01;
    this.debugObject.hitBoxRatios = {
      x: 0.8,
      y: 0.9,
    };
    this.doubleJumpAvailable = true;
    this.debugObject.jumpForce = 0.6;

    //setup
    this.ressource = this.ressources.items["octaneModel"];

    this.setUpDebugFolder();

    this.setModel();
    this.setHitBox();
    this.initRaycastVisuals();
  }

  setModel(position) {
    this.model = this.ressource.scene;
    if (position) {
      this.model.position.set(position.x, position.y, position.z);
    } else {
      this.model.position.set(0, 2, 0);
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
      opacity: 0.1, // Semi-transparent
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

  update(keys) {
    if (this.physicsBody.boxRigidBody) {
      if (keys.forward && this.carGrounded) {
        this.moveForward(keys);
      }
      if (keys.forward && !this.carGrounded) {
        this.rotateForward();
      }
      if (keys.left && !this.carGrounded) {
        this.rotateLeft();
      }
      if (keys.right && !this.carGrounded) {
        this.rotateRight();
      }
      if (keys.backward && this.carGrounded) {
        this.moveBackward();
      }
      if (keys.backward && !this.carGrounded) {
        this.rotateBackward();
      }
      if (keys.jump && this.carGrounded) {
        this.jump();
      }
      // Get position from physics simulation
      const position = this.physicsBody.boxRigidBody.translation();
      // Get rotation from physics simulation
      const rotation = this.physicsBody.boxRigidBody.rotation();
      // Update hitbox position
      this.carHitbox.position.set(position.x, position.y, position.z);
      this.carHitbox.quaternion.set(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w
      );
      // Calculate doffset in local space
      const offsetVector = new THREE.Vector3(
        0,
        -this.boxModelOffset + this.carHitboxOffset,
        0
      );
      // Apply car's rotation to the offset vector to get it in world space
      offsetVector.applyQuaternion(this.carHitbox.quaternion);
      // Update model position to match hitbox
      // Update model position to match the hitbox, applying the offset
      // Apply position with rotated offset
      this.model.position.set(
        position.x + offsetVector.x,
        position.y + offsetVector.y,
        position.z + offsetVector.z
      );

      this.model.quaternion.copy(this.carHitbox.quaternion);
    }
    this.carGrounded = this.detectGround();
  }

  detectGround() {
    const { boxRigidBody, collider } = this.physicsBody; // Extract boxRigidBody and collider

    // Default fallback for half extents
    let halfExtents = { x: 1, y: 1, z: 1 };

    // Check if we have a valid collider and if it's a cuboid
    if (collider && collider._shape && collider._shape.halfExtents) {
      halfExtents = collider._shape.halfExtents;
    }

    // Raycast offsets based on the box dimensions (half extents)
    const cornerOffset = 0.01;
    const rayOriginOffsets = [
      new THREE.Vector3(
        halfExtents.x + cornerOffset,
        0,
        halfExtents.z + cornerOffset
      ), // Front-right
      new THREE.Vector3(
        -halfExtents.x - cornerOffset,
        0,
        halfExtents.z + cornerOffset
      ), // Front-left
      new THREE.Vector3(
        halfExtents.x + cornerOffset,
        0,
        -halfExtents.z - cornerOffset
      ), // Back-right
      new THREE.Vector3(
        -halfExtents.x - cornerOffset,
        0,
        -halfExtents.z - cornerOffset
      ), // Back-left
    ];

    const groundDistanceThreshold = 0.3; // Very short distance threshold
    // Count the number of successful raycast hits
    let groundedRayCount = 0;
    // Check if all 4 raycasts hit the ground

    rayOriginOffsets.forEach((offset, index) => {
      const position = boxRigidBody.translation(); // Correct way to get the position
      // Get current car rotation as a quaternion
      const rotation = this.physicsBody.boxRigidBody.rotation();

      const carQuaternion = new THREE.Quaternion(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w
      );

      // Scale by desired speed
      //forwardVector.multiplyScalar(this.debugObject.moveSpeed || 1.0);
      const rayOrigin = new THREE.Vector3(
        position.x,
        position.y,
        position.z
      ).add(offset.applyQuaternion(carQuaternion)); // Using boxRigidBody's translation
      const rayDirection = new THREE.Vector3(0, -1, 0); // Ray points downward
      rayDirection.applyQuaternion(carQuaternion); // Apply car's rotation
      // Create a ray using Rapier's Ray class (without needing RAPIER.Ray)
      const ray = new this.physics.RAPIER.Ray(rayOrigin, rayDirection);

      // Cast the ray to detect collisions
      const hit = this.physics.world.castRay(ray, groundDistanceThreshold);

      // If the ray hit something within the threshold distance, increment groundedRayCount
      if (hit) {
        groundedRayCount++;
      }
      // Update the visual rays if they exist
      if (this.rayLines && this.rayLines[index]) {
        // Get the current ray line
        const rayLine = this.rayLines[index];

        // Validate ray origin position
        if (isNaN(rayOrigin.x) || isNaN(rayOrigin.y) || isNaN(rayOrigin.z)) {
          console.warn("Invalid ray origin position detected:", rayOrigin);
          return; // Skip this ray
        }

        // Create start point (safe copy)
        const startPoint = new THREE.Vector3(
          rayOrigin.x,
          rayOrigin.y,
          rayOrigin.z
        );

        // Create end point with safety checks
        let endPoint;
        if (hit && !isNaN(hit.toi)) {
          // Valid hit - calculate end point
          const rayLength = Math.min(hit.toi, groundDistanceThreshold); // Prevent excessive lengths
          endPoint = new THREE.Vector3(
            rayOrigin.x + rayDirection.x * rayLength,
            rayOrigin.y + rayDirection.y * rayLength,
            rayOrigin.z + rayDirection.z * rayLength
          );
        } else {
          // No hit or invalid hit - use threshold distance
          endPoint = new THREE.Vector3(
            rayOrigin.x + rayDirection.x * groundDistanceThreshold,
            rayOrigin.y + rayDirection.y * groundDistanceThreshold,
            rayOrigin.z + rayDirection.z * groundDistanceThreshold
          );
        }

        // Final validation of points
        if (isNaN(endPoint.x) || isNaN(endPoint.y) || isNaN(endPoint.z)) {
          console.warn("Invalid ray end position calculated:", endPoint);
          return; // Skip this ray
        }

        // Update ray geometry with validated points
        const points = [startPoint, endPoint];
        rayLine.geometry.dispose();
        rayLine.geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Update ray material based on hit/miss
        rayLine.material = hit ? this.rayHitMaterial : this.rayMissMaterial;
      }
    });

    // If all 4 rays hit the ground, the car is considered grounded
    const isCarGrounded = groundedRayCount === 4;

    return isCarGrounded;
  }

  jump() {
    console.log("tryingto jump", this.carGrounded);
    if (this.physicsBody.boxRigidBody && this.carGrounded) {
      this.physicsBody.boxRigidBody.applyImpulse(
        { x: 0.0, y: this.debugObject.jumpForce, z: 0.0 },
        true
      );
    }
  }
  getCarAxis(localAxis) {
    if (!this.physicsBody.boxRigidBody) return localAxis.clone();

    const rotation = this.physicsBody.boxRigidBody.rotation();
    const carQuaternion = new THREE.Quaternion(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );

    return localAxis.clone().applyQuaternion(carQuaternion);
  }
  rotateForward() {
    if (this.physicsBody.boxRigidBody) {
      // Get current angular velocity
      const currentAngVel = this.physicsBody.boxRigidBody.angvel();

      // Get current orientation
      const rotation = this.physicsBody.boxRigidBody.rotation();

      // Create quaternion from current rotation
      const quat = new THREE.Quaternion(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w
      );

      // CRITICAL FIX: Create a pure rotation quaternion for just the axis we want to rotate around
      // This prevents mixing of axes when the car is already rotated
      const rotationQuat = new THREE.Quaternion();
      rotationQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.02); // Z-axis, negative for forward

      // Apply this rotation in local space
      quat.multiply(rotationQuat);

      // Set the new rotation directly
      this.physicsBody.boxRigidBody.setRotation(
        {
          x: quat.x,
          y: quat.y,
          z: quat.z,
          w: quat.w,
        },
        true
      );

      // Reset angular velocity to prevent unwanted spinning
      // Can be adjusted if you want some momentum
      this.physicsBody.boxRigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }
  rotateBackward() {
    if (this.physicsBody.boxRigidBody) {
      // Get current orientation
      const rotation = this.physicsBody.boxRigidBody.rotation();

      // Create quaternion from current rotation
      const quat = new THREE.Quaternion(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w
      );

      // Create a pure rotation quaternion for the Z axis (positive for backward)
      const rotationQuat = new THREE.Quaternion();
      rotationQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.02); // Z-axis, positive for backward

      // Apply this rotation in local space
      quat.multiply(rotationQuat);

      // Set the new rotation directly
      this.physicsBody.boxRigidBody.setRotation(
        {
          x: quat.x,
          y: quat.y,
          z: quat.z,
          w: quat.w,
        },
        true
      );

      // Reset angular velocity
      this.physicsBody.boxRigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }
  rotateLeft() {
    if (this.physicsBody.boxRigidBody) {
      // Get current orientation
      const rotation = this.physicsBody.boxRigidBody.rotation();

      // Create quaternion from current rotation
      const quat = new THREE.Quaternion(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w
      );

      // Create a pure rotation quaternion for the Y axis
      const rotationQuat = new THREE.Quaternion();
      rotationQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.02); // Y-axis, positive for left

      // Apply this rotation in local space
      quat.multiply(rotationQuat);

      // Set the new rotation directly
      this.physicsBody.boxRigidBody.setRotation(
        {
          x: quat.x,
          y: quat.y,
          z: quat.z,
          w: quat.w,
        },
        true
      );

      // Reset angular velocity
      this.physicsBody.boxRigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }
  rotateRight() {
    if (this.physicsBody.boxRigidBody) {
      // Get current orientation
      const rotation = this.physicsBody.boxRigidBody.rotation();

      // Create quaternion from current rotation
      const quat = new THREE.Quaternion(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w
      );

      // Create a pure rotation quaternion for the Y axis
      const rotationQuat = new THREE.Quaternion();
      rotationQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.02); // Y-axis, negative for right

      // Apply this rotation in local space
      quat.multiply(rotationQuat);

      // Set the new rotation directly
      this.physicsBody.boxRigidBody.setRotation(
        {
          x: quat.x,
          y: quat.y,
          z: quat.z,
          w: quat.w,
        },
        true
      );

      // Reset angular velocity
      this.physicsBody.boxRigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }
  moveForward(keys) {
    //right now it use the global X axis, we need to change it to the MODEL X axis

    if (this.physicsBody.boxRigidBody) {
      console.log("move forward");
      // Get current car rotation as a quaternion
      const rotation = this.physicsBody.boxRigidBody.rotation();

      const carQuaternion = new THREE.Quaternion(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w
      );

      // Create a forward vector
      const forwardVector = new THREE.Vector3(1, 0, 0);

      // Apply the car's rotation to the forward vector
      forwardVector.applyQuaternion(carQuaternion);

      // Scale by desired speed
      forwardVector.multiplyScalar(this.debugObject.moveSpeed || 1.0);
      const currentVelocity = this.physicsBody.boxRigidBody.linvel();
      this.physicsBody.boxRigidBody.setLinvel(
        { x: forwardVector.x, y: currentVelocity.y, z: forwardVector.z },
        true
      );
      if (keys.left) {
        this.rotateLeft();
      }
      if (keys.right) {
        this.rotateRight();
      }
    }
  }

  moveBackward() {
    if (this.physicsBody.boxRigidBody) {
      // Get current car rotation as a quaternion
      const rotation = this.physicsBody.boxRigidBody.rotation();

      const carQuaternion = new THREE.Quaternion(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w
      );

      // Create a forward vector
      const forwardVector = new THREE.Vector3(-1, 0, 0);

      // Apply the car's rotation to the forward vector
      forwardVector.applyQuaternion(carQuaternion);

      // Scale by desired speed
      forwardVector.multiplyScalar(this.debugObject.moveSpeed || 1.0);
      const currentVelocity = this.physicsBody.boxRigidBody.linvel();
      console.log("move backward");
      this.physicsBody.boxRigidBody.setLinvel(
        { x: forwardVector.x, y: currentVelocity.y, z: forwardVector.z },
        true
      );
    }
  }

  limitAngVel(angVel, maxValues = { x: 0.8, y: 0.8, z: 0.8 }) {
    // Clamp each component
    angVel.x = Math.max(-maxValues.x, Math.min(maxValues.x, angVel.x));
    angVel.y = Math.max(-maxValues.y, Math.min(maxValues.y, angVel.y));
    angVel.z = Math.max(-maxValues.z, Math.min(maxValues.z, angVel.z));

    return angVel;
  }

  initRaycastVisuals() {
    // Create a group to hold all ray visuals
    this.rayVisuals = new THREE.Group();
    this.scene.add(this.rayVisuals);

    // Array to store ray line objects
    this.rayLines = [];

    // Create materials for hit/miss states
    this.rayHitMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00, // Green for ray hits
      linewidth: 2,
    });

    this.rayMissMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000, // Red for ray misses
      linewidth: 2,
    });

    // Create 4 ray lines (one for each corner)
    for (let i = 0; i < 4; i++) {
      // Create line geometry with initial points
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -0.3, 0), // Initial ray length = threshold distance
      ]);

      // Create line with miss material by default
      const rayLine = new THREE.Line(lineGeometry, this.rayMissMaterial);

      // Add to group and store reference
      this.rayVisuals.add(rayLine);
      this.rayLines.push(rayLine);
    }

    // Add a debug toggle if debugging is enabled
    if (this.debug.active) {
      this.debugObject.showRays = true;
      this.debugFolder
        .add(this.debugObject, "showRays")
        .name("Show Raycasts")
        .onChange((value) => {
          this.rayVisuals.visible = value;
        });
    }
  }

  setUpDebugFolder() {
    if (this.debug.active) {
      this.debugFolder
        .add(this.debugObject, "jumpForce")
        .min(0.5)
        .max(10)
        .step(0.1);
      this.debugFolder
        .add(this.debugObject.hitBoxRatios, "x")
        .min(0.5)
        .max(1.5)
        .step(0.1)
        .name("hitboxXratio")
        .onChange(() => {
          let currentPosition;
          if (this.physicsBody.boxRigidBody) {
            const translation = this.physicsBody.boxRigidBody.translation();
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
            const rotation = this.physicsBody.boxRigidBody.rotation();
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
            const translation = this.physicsBody.boxRigidBody.translation();
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
          if (this.physicsBody.boxRigidBody) {
            const rotation = this.physicsBody.boxRigidBody.rotation();
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
          if (this.physicsBody.boxRigidBody) {
            const translation = this.physicsBody.boxRigidBody.translation();
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
          if (this.physicsBody.boxRigidBody) {
            const rotation = this.physicsBody.boxRigidBody.rotation();
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
  }
}
