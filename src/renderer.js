
import Canvas from "@creenv/canvas";
import Vector2 from "@creenv/vector/vector2";
import Color from "@creenv/color";
import AudioData from "@creenv/audio/audio-analysed-data";

import * as THREE from "three";

import config from "./config";
import GlitchyMaterial from "./shaders/glitchy-material";
import Camera from "./camera";
import TorusManager from "./torus-manager";
import ReactiveTube from './reactive-tube';



class Renderer {
  constructor () {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setClearColor(0x0000ff);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.camera = new Camera(this.scene, this.renderer);

    let loader = new THREE.TextureLoader();
    let text = loader.load("textures/perfect-grid.png");
    text.wrapS = THREE.RepeatWrapping;
    text.wrapT = THREE.RepeatWrapping;
    text.minFilter = THREE.LinearMipMapLinearFilter;
    text.magFilter = THREE.LinearFilter;
    text.anisotropy = 0;

    let mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: text,
      side: THREE.DoubleSide
    });

    this.material = new THREE.ShaderMaterial({
      vertexShader: GlitchyMaterial.vertex,
      fragmentShader: GlitchyMaterial.fragment,
      side: THREE.DoubleSide,
      uniforms: {
        iTime: { type: "f" },
        distorsionStrength: { type: "f", value: 0.0 },
        texture: { type: "t", value: text },
        scale: { type:"f"}
      }
    });

    let plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), this.material);
    plane.rotateX(Math.PI/2);

    this.scene.add(plane);

    this.setLights();

    document.body.appendChild(this.renderer.domElement);

    this.torusManager = new TorusManager(this.scene);
    this.torusManager.addTorus();

    this.reactiveTube = new ReactiveTube(this.scene, this.camera);

    // BINDINGS
    this._handleWindowResize = this._handleWindowResize.bind(this);

    window.addEventListener("resize", this._handleWindowResize);
  }

  init () {
  }

  setLights () {
    var directionalLight = new THREE.DirectionalLight( 0x00ff00, 1.0 );
    this.scene.add( directionalLight );

    let l2 = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(l2);
  }

  /**
   * redimensionne le renderer et change l'aspect de la caméra 
   */
  _handleWindowResize () {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.get().aspect = window.innerWidth/window.innerHeight;
    this.camera.get().updateProjectionMatrix();
  }

  /**
   * 
   * @param {number} deltaT 
   * @param {number} time
   * @param {AudioData} audio 
   */
  updateUniforms (deltaT, time, audio) {
    this.material.uniforms["iTime"].value = time;
    this.material.uniforms["distorsionStrength"].value = config.distortionMin + (audio.energyAverage/80)*config.distortionRange;
    this.material.uniforms["scale"].value = config.scale;
  }

  updateCamera (time) {
    this.camera.update(time);
  }

  /**
   * 
   * @param {number} deltaT 
   * @param {number} time
   * @param {AudioData} audio 
   */
  render (deltaT, time, audio) {

   this.updateCamera(time);

    this.torusManager.update(time, audio);
    this.reactiveTube.update(time, audio);

    this.updateUniforms(deltaT, time, audio);
    this.renderer.render(this.scene, this.camera.get());
  }
}

export default Renderer;