import Game from "./Game";
import * as THREE from "three";

export default class PhysicsDebug {
  constructor() {
    this.game = new Game();
  }

  setup() {
    const { vertices, colors } = this.game.physics.world.debugRender();
    console.log(vertices, colors);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 4)
    );
    this.material = new THREE.LineBasicMaterial({ vertexColors: true });
    this.lineSegments = new THREE.LineSegments(this.geometry, this.material);
    this.game.scene.add(this.lineSegments);
  }

  update() {
    const { vertices, colors } = this.game.physics.world.debugRender();

    // Check if the buffer sizes have changed
    if (this.geometry.attributes.position.array.length !== vertices.length) {
      this.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
      );
    } else {
      this.geometry.attributes.position.array.set(vertices);
      this.geometry.attributes.position.needsUpdate = true;
    }

    if (this.geometry.attributes.color.array.length !== colors.length) {
      this.geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 4)
      );
    } else {
      this.geometry.attributes.color.array.set(colors);
      this.geometry.attributes.color.needsUpdate = true;
    }

    // Update the line segments if needed
    this.geometry.computeBoundingBox();
    this.geometry.computeBoundingSphere();
  }
}
