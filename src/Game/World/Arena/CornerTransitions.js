import * as THREE from "three";
import Game from "../../Game";

export default class CornerTransitions {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.physics = this.game.physics;

    // Arena dimensions based on floor size
    this.arenaWidth = 50;
    this.arenaLength = 140;
    this.arenaHeight = 50;

    // Corner radius for smooth transitions
    this.cornerRadius = 3;
    this.cornerSegments = 8; // Number of segments in the curved sections

    // Corner color (same as wall or slightly different)
    this.cornerColor = 0x666666;

    this.createAllTransitions();
  }

  createAllTransitions() {
    // Create floor-to-wall transitions (all 4 corners)
    this.createFloorWallTransitions();

    // Create wall-to-ceiling transitions (all 4 corners)
    this.createWallCeilingTransitions();

    // Create the 8 vertical corner edges where walls meet
    this.createVerticalEdgeTransitions();
  }

  createFloorWallTransitions() {
    // Create the curved transitions between floor and walls

    // These are the 4 long transitions along the edges of the floor
    this.createFloorWallTransition(true, true); // +X, +Z edge
    this.createFloorWallTransition(true, false); // +X, -Z edge
    this.createFloorWallTransition(false, true); // -X, +Z edge
    this.createFloorWallTransition(false, false); // -X, -Z edge
  }

  createFloorWallTransition(isPositiveX, isPositiveZ) {
    // Create a quarter-cylinder curved transition
    const radius = this.cornerRadius;
    const length =
      isPositiveZ || !isPositiveZ ? this.arenaLength : this.arenaWidth;

    // Create a buffer geometry for the curved section
    const curve = new THREE.Shape();

    // Start at the corner of the floor
    curve.moveTo(0, 0);

    // Draw a quarter circle
    curve.quadraticCurveTo(radius, 0, radius, radius);

    // Complete the shape
    curve.lineTo(0, radius);
    curve.lineTo(0, 0);

    // Create geometry by extruding the shape
    const extrudeSettings = {
      steps: 1,
      depth: length,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(curve, extrudeSettings);

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: this.cornerColor,
      side: THREE.DoubleSide,
    });

    // Create mesh
    const cornerMesh = new THREE.Mesh(geometry, material);
    cornerMesh.castShadow = true;
    cornerMesh.receiveShadow = true;

    // Position and rotate the corner
    if (isPositiveX) {
      cornerMesh.position.x = this.arenaWidth / 2 - radius;
    } else {
      cornerMesh.position.x = -this.arenaWidth / 2;
      cornerMesh.rotation.y = Math.PI / 2;
    }

    if (isPositiveZ) {
      cornerMesh.position.z = this.arenaLength / 2 - (isPositiveX ? 0 : radius);
    } else {
      cornerMesh.position.z =
        -this.arenaLength / 2 + (isPositiveX ? 0 : radius);
      cornerMesh.rotation.y += Math.PI;
    }

    this.scene.add(cornerMesh);

    // Add physics (approximate with a convex hull)
    if (this.physics) {
      this.physics.addEntity({
        mesh: cornerMesh,
        instanceof: function (type) {
          return type.name === "Floor";
        },
      });
    }

    return cornerMesh;
  }

  createWallCeilingTransitions() {
    // Create the curved transitions between walls and ceiling

    // These are the 4 long transitions along the edges where walls meet ceiling
    this.createWallCeilingTransition(true, true); // +X, +Z edge
    this.createWallCeilingTransition(true, false); // +X, -Z edge
    this.createWallCeilingTransition(false, true); // -X, +Z edge
    this.createWallCeilingTransition(false, false); // -X, -Z edge
  }

  createWallCeilingTransition(isPositiveX, isPositiveZ) {
    // Similar to floor-wall transitions but positioned at the ceiling level
    const radius = this.cornerRadius;
    const length =
      isPositiveZ || !isPositiveZ ? this.arenaLength : this.arenaWidth;

    // Create a buffer geometry for the curved section
    const curve = new THREE.Shape();

    // Start at the corner
    curve.moveTo(0, 0);

    // Draw a quarter circle
    curve.quadraticCurveTo(radius, 0, radius, radius);

    // Complete the shape
    curve.lineTo(0, radius);
    curve.lineTo(0, 0);

    // Create geometry by extruding the shape
    const extrudeSettings = {
      steps: 1,
      depth: length,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(curve, extrudeSettings);

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: this.cornerColor,
      side: THREE.DoubleSide,
    });

    // Create mesh
    const cornerMesh = new THREE.Mesh(geometry, material);
    cornerMesh.castShadow = true;
    cornerMesh.receiveShadow = true;

    // Position and rotate the corner - at ceiling height
    cornerMesh.position.y = this.arenaHeight - radius;

    if (isPositiveX) {
      cornerMesh.position.x = this.arenaWidth / 2 - radius;
      cornerMesh.rotation.z = -Math.PI / 2;
    } else {
      cornerMesh.position.x = -this.arenaWidth / 2;
      cornerMesh.rotation.y = Math.PI / 2;
      cornerMesh.rotation.z = -Math.PI / 2;
    }

    if (isPositiveZ) {
      cornerMesh.position.z = this.arenaLength / 2 - (isPositiveX ? 0 : radius);
    } else {
      cornerMesh.position.z =
        -this.arenaLength / 2 + (isPositiveX ? 0 : radius);
      cornerMesh.rotation.y += Math.PI;
    }

    this.scene.add(cornerMesh);

    // Add physics
    if (this.physics) {
      this.physics.addEntity({
        mesh: cornerMesh,
        instanceof: function (type) {
          return type.name === "Floor";
        },
      });
    }

    return cornerMesh;
  }

  createVerticalEdgeTransitions() {
    // Create the 8 vertical curved corners where walls meet

    // Four corners at the bottom
    this.createVerticalEdgeTransition(true, true, false); // +X, +Z, bottom
    this.createVerticalEdgeTransition(true, false, false); // +X, -Z, bottom
    this.createVerticalEdgeTransition(false, true, false); // -X, +Z, bottom
    this.createVerticalEdgeTransition(false, false, false); // -X, -Z, bottom

    // Four corners at the top
    this.createVerticalEdgeTransition(true, true, true); // +X, +Z, top
    this.createVerticalEdgeTransition(true, false, true); // +X, -Z, top
    this.createVerticalEdgeTransition(false, true, true); // -X, +Z, top
    this.createVerticalEdgeTransition(false, false, true); // -X, -Z, top
  }

  createVerticalEdgeTransition(isPositiveX, isPositiveZ, isTop) {
    // Create a quarter-cylinder for the vertical edge
    const radius = this.cornerRadius;
    const height = this.arenaHeight - 2 * radius; // Leave space for floor and ceiling corners

    // Create a cylindrical geometry
    const geometry = new THREE.CylinderGeometry(
      radius, // top radius
      radius, // bottom radius
      height, // height
      8, // radial segments
      1, // height segments
      true, // open-ended
      0, // start angle
      Math.PI / 2 // end angle (quarter circle)
    );

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: this.cornerColor,
      side: THREE.DoubleSide,
    });

    // Create mesh
    const cornerMesh = new THREE.Mesh(geometry, material);
    cornerMesh.castShadow = true;
    cornerMesh.receiveShadow = true;

    // Position the corner
    cornerMesh.position.y = isTop
      ? this.arenaHeight - radius - height / 2
      : radius + height / 2;

    // Position and rotate based on which corner this is
    if (isPositiveX) {
      cornerMesh.position.x = this.arenaWidth / 2 - radius;
    } else {
      cornerMesh.position.x = -this.arenaWidth / 2 + radius;
      cornerMesh.rotation.y = Math.PI;
    }

    if (isPositiveZ) {
      cornerMesh.position.z = this.arenaLength / 2 - radius;
      cornerMesh.rotation.y += Math.PI / 2;
    } else {
      cornerMesh.position.z = -this.arenaLength / 2 + radius;
      cornerMesh.rotation.y -= Math.PI / 2;
    }

    this.scene.add(cornerMesh);

    // Add physics
    if (this.physics) {
      this.physics.addEntity({
        mesh: cornerMesh,
        instanceof: function (type) {
          return type.name === "Floor";
        },
      });
    }

    return cornerMesh;
  }
}
