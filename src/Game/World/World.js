import Game from "../Game";
import Environment from "./Environment";
import Car from "./Car";
import Floor from "./Arena/Floor";

export default class World {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.ressources = this.game.ressources;
    this.ressources.on("ready", () => {
      //setup
      this.environment = new Environment();
      this.floor = new Floor();
      this.car = new Car(1);
    });
  }
  update(keys) {
    if (this.car) {
      this.car.update(keys);
    }
    if (this.arena) {
      this.arena.update();
    }
  }
}
