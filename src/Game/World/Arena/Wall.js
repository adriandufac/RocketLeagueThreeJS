import * as THREE from "three";
import Game from "../../Game";

export default class Walls {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.physics = this.game.physics;

    // Arena dimensions based on floor size
    this.arenaWidth = 50;
    this.arenaLength = 140;
    this.arenaHeight = 50; // Same as width

    this.wallThickness = 1;
    this.wallColor = 0x666666;

    // Create all walls
    this.createWalls();
  }

  createWalls() {
    // Create the four walls
    this.createSideWall(true, true); // +X side (right wall)
    this.createSideWall(true, false); // -X side (left wall)
    this.createEndWall(true); // +Z side (far wall with goal)
    this.createEndWall(false); // -Z side (near wall with goal)
  }

  createSideWall(isPositiveX, hasGoal = false) {
    // Side walls run parallel to Z axis (along the length)
    const wallGeometry = new THREE.BoxGeometry(
      this.wallThickness,
      this.arenaHeight,
      this.arenaLength
    );

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: this.wallColor,
      side: THREE.DoubleSide,
    });

    const wall = new THREE.Mesh(wallGeometry, wallMaterial);

    // Position the wall
    const xPos = isPositiveX ? this.arenaWidth / 2 : -this.arenaWidth / 2;
    wall.position.set(xPos, this.arenaHeight / 2, 0);

    wall.castShadow = true;
    wall.receiveShadow = true;

    this.scene.add(wall);

    // Add physics
    if (this.physics) {
      this.physics.addEntity({
        mesh: wall,
        instanceof: function (type) {
          return type.name === "Floor"; // Trick to reuse the Floor physics code
        },
      });
    }

    return wall;
  }

  createEndWall(isPositiveZ) {
    // End walls run parallel to X axis (along the width)
    // We need to create a wall with a hole for the goal

    // Calculate dimensions
    const zPos = isPositiveZ ? this.arenaLength / 2 : -this.arenaLength / 2;

    // Goal dimensions
    const goalWidth = 5;
    const goalHeight = 2.5;

    // Create wall as a group to add parts
    const wallGroup = new THREE.Group();

    // Create the main parts of the wall (top, left, right)

    // Top part
    const topWallGeometry = new THREE.BoxGeometry(
      this.arenaWidth,
      this.arenaHeight - goalHeight,
      this.wallThickness
    );

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: this.wallColor,
      side: THREE.DoubleSide,
    });

    const topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
    topWall.position.set(
      0,
      goalHeight + (this.arenaHeight - goalHeight) / 2,
      zPos
    );
    topWall.castShadow = true;
    topWall.receiveShadow = true;
    wallGroup.add(topWall);

    // Left part
    const leftWallGeometry = new THREE.BoxGeometry(
      (this.arenaWidth - goalWidth) / 2,
      goalHeight,
      this.wallThickness
    );

    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(
      -(this.arenaWidth + goalWidth) / 4,
      goalHeight / 2,
      zPos
    );
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    wallGroup.add(leftWall);

    // Right part
    const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    rightWall.position.set(
      (this.arenaWidth + goalWidth) / 4,
      goalHeight / 2,
      zPos
    );
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    wallGroup.add(rightWall);

    // Add the goal cage (simple visual representation)
    this.addGoalCage(wallGroup, zPos, goalWidth, goalHeight);

    this.scene.add(wallGroup);

    // Add physics for each part separately
    if (this.physics) {
      [topWall, leftWall, rightWall].forEach((wallPart) => {
        this.physics.addEntity({
          mesh: wallPart,
          instanceof: function (type) {
            return type.name === "Floor"; // Trick to reuse the Floor physics code
          },
        });
      });
    }

    return wallGroup;
  }

  addGoalCage(wallGroup, zPos, goalWidth, goalHeight) {
    // Create a simple goal cage
    const goalDepth = 2; // How deep the goal cage goes

    // Goal frame material
    const goalMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.2,
    });

    // Top bar
    const topBarGeometry = new THREE.BoxGeometry(goalWidth, 0.2, 0.2);
    const topBar = new THREE.Mesh(topBarGeometry, goalMaterial);
    topBar.position.set(0, goalHeight, zPos - goalDepth / 2);
    topBar.castShadow = true;
    wallGroup.add(topBar);

    // Side posts
    const postGeometry = new THREE.BoxGeometry(0.2, goalHeight, 0.2);

    // Left post
    const leftPost = new THREE.Mesh(postGeometry, goalMaterial);
    leftPost.position.set(-goalWidth / 2, goalHeight / 2, zPos - goalDepth / 2);
    leftPost.castShadow = true;
    wallGroup.add(leftPost);

    // Right post
    const rightPost = new THREE.Mesh(postGeometry, goalMaterial);
    rightPost.position.set(goalWidth / 2, goalHeight / 2, zPos - goalDepth / 2);
    rightPost.castShadow = true;
    wallGroup.add(rightPost);

    // Back of the net
    const backNetGeometry = new THREE.BoxGeometry(goalWidth, goalHeight, 0.1);
    const netMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      wireframe: true,
    });

    const backNet = new THREE.Mesh(backNetGeometry, netMaterial);
    backNet.position.set(0, goalHeight / 2, zPos - goalDepth);
    wallGroup.add(backNet);

    // Add physics for goal posts
    if (this.physics) {
      [topBar, leftPost, rightPost].forEach((post) => {
        this.physics.addEntity({
          mesh: post,
          instanceof: function (type) {
            return type.name === "Floor"; // Trick to reuse the Floor physics code
          },
        });
      });
    }
  }
}
