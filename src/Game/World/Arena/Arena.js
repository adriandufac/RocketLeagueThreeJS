import * as THREE from "three";
import Game from "../../Game";
import Floor from "./Floor";
import Walls from "./Walls";
import Ceiling from "./Ceiling";
import CornerTransitions from "./CornerTransitions";

export default class Arena {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;

    // Create all arena components
    this.initialize();
  }

  initialize() {
    // Create floor first
    this.floor = new Floor();

    // Create walls with goal cages
    this.walls = new Walls();

    // Create ceiling
    this.ceiling = new Ceiling();

    // Create smooth corner transitions
    //this.cornerTransitions = new CornerTransitions();

    // Add some lighting specific to the arena
    this.setupLighting();
  }

  setupLighting() {
    // Add some colored lights for atmosphere

    // Blue light on one goal
    const blueLight = new THREE.PointLight(0x4444ff, 0.8, 50);
    blueLight.position.set(0, 10, -this.walls.arenaLength / 2 + 5);
    blueLight.castShadow = true;
    this.scene.add(blueLight);

    // Red light on the other goal
    const redLight = new THREE.PointLight(0xff4444, 0.8, 50);
    redLight.position.set(0, 10, this.walls.arenaLength / 2 - 5);
    redLight.castShadow = true;
    this.scene.add(redLight);
  }
}
