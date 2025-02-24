import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import EventEmitter from "./EventEmitter";

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();
    this.sources = sources;

    //setup
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.loaders = {};
    this.loaders.gltfLoader = new GLTFLoader();
    this.loaders.textureLoader = new THREE.TextureLoader();
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
  }

  startLoading() {
    this.sources.forEach((source) => {
      this.loadItem(source);
    });
  }

  loadItem(source) {
    let loader = null;
    if (source.type === "gltfModel") loader = this.loaders.gltfLoader;
    if (source.type === "texture") loader = this.loaders.textureLoader;
    if (source.type === "cubeTexture") loader = this.loaders.cubeTextureLoader;

    loader.load(source.path, (file) => {
      this.sourceLoaded(source, file);
    });
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file;
    this.loaded++;
    if (this.loaded === this.toLoad) this.trigger("ready");
  }
}
