import Game from "../Game";
import Environment from "./Environment";
import Car from "./Car";
import Floor from "./Arena/Floor";
import Arena from "./Arena/Arena";
import Ball from "./Ball";

export default class World {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.ressources = this.game.ressources;
    this.ressources.on("ready", () => {
      //setup
      this.environment = new Environment();
      this.arena = new Arena();
      this.car = new Car(1);
      this.ball = new Ball();
    });
  }
  update(keys) {
    if (this.car) {
      this.car.update(keys);
    }
    if (this.arena) {
      //this.arena.update();
    }
    if (this.ball) {
      this.ball.update();
    }
  }
}
