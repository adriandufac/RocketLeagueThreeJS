export default class Wall {
  constructor(isSideWall, isPositive) {
    this.game = new Game();
    this.scene = this.game.scene;
    this.physics = this.game.physics;

    // Arena dimensions based on floor size
    this.arenaWidth = sizes.width;
    this.arenaLength = sizes.length;
    this.arenaHeight = sizes.height; // Same as width

    this.wallThickness = 0.5;
    this.wallColor = 0x808080;
    this.wallOpacity = 0.2;
  }
  setGeometry(isSideWall) {
    this.geometry = new THREE.BoxGeometry(
      this.wallThickness,
      this.arenaHeight,
      this.arenaLength
    );
  }

  setMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      color: this.wallColor,
      side: THREE.DoubleSide,
      opacity: this.wallOpacity,
      transparent: true,
    });
  }

  setMesh(isSideWall, isPositiveX) {
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);

    // Position the wall
    const xPos = isPositiveX ? this.arenaWidth / 2 : -this.arenaWidth / 2;
    wall.position.set(xPos, this.arenaHeight / 2, 0);

    wall.castShadow = true;
    wall.receiveShadow = true;

    this.scene.add(wall);

    // Add physics
    if (this.physics) {
      this.physics.addEntity(wall);
    }
    /*     this.mesh = new THREE.Mesh(this.geometry, this.material);

    // Rotate and position the ceiling
    this.mesh.rotation.x = Math.PI * 0.5; // Rotate to face down
    this.mesh.position.y = this.arenaHeight; // Position at top of arena

    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);

    // Add physics
    if (this.physics) {
      this.physicsBody = this.physics.addEntity(this);
    } */
  }
}
