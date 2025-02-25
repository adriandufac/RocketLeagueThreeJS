import Game from "./Game.js";
import RAPIER from "rapier3d";

export class Physics {
  constructor() {
    this.game = new Game();
    this.debug = this.game.debug;
    this.gravity = { x: 0, y: -9.81, z: 0 };
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("physics");
      this.debugFolder
        .add(this.gravity, "y")
        .min(0)
        .max(-20)
        .step(0.01)
        .name("gravity");
    }
    this.world = new RAPIER.world(this.gravity);
  }
  addEntity(entity) {}
}
