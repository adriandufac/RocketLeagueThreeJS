import Game from "../Game";

export default class Car {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
  }
}
