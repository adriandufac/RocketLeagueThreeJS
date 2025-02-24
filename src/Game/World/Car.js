import Game from "../Game";

export default class Car {
  constructor() {
    this.game = new Game();
    this.scene = this.game.scene;
    this.ressources = this.game.ressources;
    this.time = this.game.time;

    //setup
    this.ressource = this.ressources.items["octaneModel"];

    this.setModel();
  }

  setModel() {
    this.model = this.ressource.scene;
    this.model.scale.set(0.02, 0.02, 0.02);
    this.model.position.y = -0.5;
    this.scene.add(this.model);

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }
  update() {}
}
