import Game from "../Game/Game.js";

export default class World {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
  }
}
