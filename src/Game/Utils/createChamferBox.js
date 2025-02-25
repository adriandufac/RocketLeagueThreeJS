import * as THREE from "three";

export function createChamferedBox(
  width,
  height,
  depth,
  chamferWidth,
  chamferHeight,
  chamferSide
) {
  // Create a material for the wireframe
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
    opacity: 0.5,
    transparent: true,
  });

  // Create a group to hold our meshes
  const group = new THREE.Group();

  // Determine which side to chamfer
  if (chamferSide === "front") {
    // Create a 2D shape with an asymmetric chamfered corner
    const shape = new THREE.Shape();

    // Start at bottom-left
    shape.moveTo(-width / 2, -height / 2);

    // Draw to bottom-right
    shape.lineTo(width / 2, -height / 2);

    // Draw to chamfer start point (on the right side)
    shape.lineTo(width / 2, height / 2 - chamferHeight);

    // Draw the chamfer (diagonal line)
    shape.lineTo(width / 2 - chamferWidth, height / 2);

    // Draw to top-left
    shape.lineTo(-width / 2, height / 2);

    // Close the shape
    shape.lineTo(-width / 2, -height / 2);

    // Extrude the shape to create a 3D object
    const extrudeSettings = {
      steps: 1,
      depth: depth,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Center the geometry
    geometry.center();

    // Create mesh and add to group
    const mesh = new THREE.Mesh(geometry, wireframeMaterial);
    group.add(mesh);
  } else if (chamferSide === "right") {
    // Main box part
    const shape = new THREE.Shape();
    shape.moveTo(-depth / 2, -height / 2);
    shape.lineTo(depth / 2, -height / 2);
    shape.lineTo(depth / 2, height / 2);
    shape.lineTo(-depth / 2, height / 2);
    shape.lineTo(-depth / 2, -height / 2);

    const extrudeSettings = {
      steps: 1,
      depth: width - chamferWidth,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    const mainMesh = new THREE.Mesh(geometry, wireframeMaterial);
    mainMesh.rotation.y = Math.PI / 2;
    mainMesh.position.x = -chamferWidth / 2;
    group.add(mainMesh);

    // Add the asymmetric chamfered part
    const chamferShape = new THREE.Shape();
    chamferShape.moveTo(0, -height / 2);
    chamferShape.lineTo(depth / 2, -height / 2);
    chamferShape.lineTo(depth / 2, height / 2);
    chamferShape.lineTo(0, height / 2 - chamferHeight);
    chamferShape.lineTo(0, -height / 2);

    const chamferExtrudeSettings = {
      steps: 1,
      depth: chamferWidth,
      bevelEnabled: false,
    };

    const chamferGeometry = new THREE.ExtrudeGeometry(
      chamferShape,
      chamferExtrudeSettings
    );
    const chamferMesh = new THREE.Mesh(chamferGeometry, wireframeMaterial);
    chamferMesh.rotation.y = Math.PI / 2;
    chamferMesh.position.x = width / 2 - chamferWidth / 2;
    group.add(chamferMesh);
  } else if (chamferSide === "back") {
    // Create a 2D shape with an asymmetric chamfered corner
    const shape = new THREE.Shape();

    // Start at bottom-left
    shape.moveTo(-width / 2, -height / 2);

    // Draw to bottom-right
    shape.lineTo(width / 2, -height / 2);

    // Draw to top-right
    shape.lineTo(width / 2, height / 2);

    // Draw to chamfer start
    shape.lineTo(-width / 2 + chamferWidth, height / 2);

    // Draw chamfer
    shape.lineTo(-width / 2, height / 2 - chamferHeight);

    // Close the shape
    shape.lineTo(-width / 2, -height / 2);

    // Extrude the shape to create a 3D object
    const extrudeSettings = {
      steps: 1,
      depth: depth,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    // Create mesh and add to group
    const mesh = new THREE.Mesh(geometry, wireframeMaterial);
    mesh.rotation.y = Math.PI;
    group.add(mesh);
  } else if (chamferSide === "left") {
    // Main box part
    const shape = new THREE.Shape();
    shape.moveTo(-depth / 2, -height / 2);
    shape.lineTo(depth / 2, -height / 2);
    shape.lineTo(depth / 2, height / 2);
    shape.lineTo(-depth / 2, height / 2);
    shape.lineTo(-depth / 2, -height / 2);

    const extrudeSettings = {
      steps: 1,
      depth: width - chamferWidth,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    const mainMesh = new THREE.Mesh(geometry, wireframeMaterial);
    mainMesh.rotation.y = Math.PI / 2;
    mainMesh.position.x = chamferWidth / 2;
    group.add(mainMesh);

    // Add the asymmetric chamfered part
    const chamferShape = new THREE.Shape();
    chamferShape.moveTo(0, -height / 2);
    chamferShape.lineTo(depth / 2, -height / 2);
    chamferShape.lineTo(depth / 2, height / 2);
    chamferShape.lineTo(0, height / 2 - chamferHeight);
    chamferShape.lineTo(0, -height / 2);

    const chamferExtrudeSettings = {
      steps: 1,
      depth: chamferWidth,
      bevelEnabled: false,
    };

    const chamferGeometry = new THREE.ExtrudeGeometry(
      chamferShape,
      chamferExtrudeSettings
    );
    const chamferMesh = new THREE.Mesh(chamferGeometry, wireframeMaterial);
    chamferMesh.rotation.y = -Math.PI / 2;
    chamferMesh.position.x = -width / 2 + chamferWidth / 2;
    group.add(chamferMesh);
  } else {
    // Default to regular box if side not specified
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, wireframeMaterial);
    group.add(mesh);
  }

  return group;
}
