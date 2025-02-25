import * as THREE from "three";
import EventEmitter from "./Utils/EventEmitter";
import Sizes from "./Utils/Sizes";
import Camera from "./Camera";
import Renderer from "./Renderer";
import Time from "./Utils/Time";
import World from "./World/World";
import Ressources from "./Utils/Ressources";
import sources from "./sources";
import Debug from "./Utils/Debug";
import Physics from "./Physics";
import inputs from "./inputsArray";
import Inputs from "./Utils/Inputs";

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
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.ressources = new Ressources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.physics = new Physics();
    this.world = new World();
    this.inputs = new Inputs(inputs);

    this.sizes.on("resize", () => {
      this.resize();
    });

    this.time.on("tick", () => {
      this.update();
    });

    this.inputs.on("keyDown", (mapName) => {
      console.log(mapName, "keyDown");
    });
    this.inputs.on("keyUp", (mapName) => {
      console.log(mapName, "keyUp");
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }
  update() {
    this.physics.update();
    this.camera.update();
    this.world.update();
    this.renderer.update();
  }
}
