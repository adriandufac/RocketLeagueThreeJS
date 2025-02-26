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
import PhysicsDebug from "./PhysicsDebug";

let instance = null;
const keys = {
  forward: false,
  backward: false,
  jump: false,
};
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
    this.physicsDebug = new PhysicsDebug();
    this.world = new World();
    this.inputs = new Inputs(inputs);

    this.sizes.on("resize", () => {
      this.resize();
    });

    this.time.on("tick", () => {
      this.update();
    });
    /*  window.addEventListener("keydown", (event) => {
      if (event.code === "KeyW" && this.world.car.carGrounded)
        keys.forward = true;
      if (event.code === "KeyS" && this.world.car.carGrounded)
        keys.backward = true;
    });
    window.addEventListener("mousedown", (event) => {
      if (event.button === 2 && this.world.car.carGrounded) keys.jump = true;
    });
    window.addEventListener("mouseup", (event) => {
      if (event.button === 2 && this.world.car.carGrounded) keys.jump = false;
    });

    window.addEventListener("keyup", (event) => {
      if (event.code === "KeyW") keys.forward = false;
      if (event.code === "KeyS") keys.backward = false;
    }); */
    this.inputs.on("keyDown", (mapName) => {
      if (mapName === "jump") {
        keys.jump = true;
      }
      if (mapName === "forward") {
        keys.forward = true;
      }
      if (mapName === "backward") {
        keys.backward = true;
      }
    });
    this.inputs.on("keyUp", (mapName) => {
      console.log(mapName, "keyUp");
      if (mapName === "forward") {
        keys.forward = false;
      }
      if (mapName === "backward") {
        keys.backward = false;
      }
      if (mapName === "jump") {
        keys.jump = false;
      }
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }
  update() {
    if (this.physicsReady) {
      this.physics.update();
      this.physicsDebug.update();
      this.camera.update();

      this.world.update(keys);
      this.renderer.update();
    }
  }
}
