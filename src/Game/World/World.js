import Game from "../Game";
import Environment from "./Environment";
import Car from "./Car";

export default class World {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.ressources = this.game.ressources;
    this.ressources.on("ready", () => {
      //setup
      this.environment = new Environment();
      this.car = new Car();
    });
  }
  update() {
    if (this.car) {
      this.car.update();
    }
  }
}
