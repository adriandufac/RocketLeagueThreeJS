import EventEmitter from "./EventEmitter";
export default class Inputs extends EventEmitter {
  constructor(_map) {
    super();
    this.map = _map;
    this.keys = {};
    window.addEventListener("keydown", (_event) => {
      this.down(_event.code);
    });
    window.addEventListener("keyup", (_event) => {
      this.up(_event.code);
    });
  }

  down(key) {
    const map = this.map.find((_map) => _map.keys.indexOf(key) !== -1);

    if (map && !this.keys[map.name]) {
      this.keys[map.name] = true;
      this.trigger("keyDown", [map.name]);
    }
  }

  up(key) {
    const map = this.map.find((_map) => _map.keys.indexOf(key) !== -1);

    if (map && this.keys[map.name]) {
      this.keys[map.name] = false;
      this.trigger("keyUp", [map.name]);
    }
  }
}
