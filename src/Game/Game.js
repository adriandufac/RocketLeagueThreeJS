import * as THREE from "three";
import EventEmitter from "./Utils/EventEmitter";
import Sizes from "./Utils/Sizes";
import Camera from "./Camera";
import Renderer from "./Renderer";
import Time from "./Utils/Time";
import World from "./World/World";
import Ressources from "./Utils/Ressources";
import sources from "./sources";

let instance = null;

export default class Game extends EventEmitter {
  constructor(canvas) {
    super();
    if (instance) {
      return instance;
    }

    instance = this;

    //options
    this.canvas = canvas;

    //setup
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.ressources = new Ressources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    this.sizes.on("resize", () => {
      this.resize();
    });

    this.time.on("tick", () => {
      this.update();
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }
  update() {
    this.camera.update();
    this.world.update();
    this.renderer.update();
  }
}
