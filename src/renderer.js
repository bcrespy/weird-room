
import Canvas from "@creenv/canvas";
import Vector2 from "@creenv/vector/vector2";
import Color from "@creenv/color";
import AudioData from "@creenv/audio/audio-analysed-data";

import * as THREE from "three";

import config from "./config";
import GlitchyMaterial from "./shaders/glitchy-material";



class Renderer {
  constructor () {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;
    this.camera.position.x = 5;
    this.camera.position.y = 5;
    this.camera.lookAt(0, 0, 0);

    let loader = new THREE.TextureLoader();
    let text = loader.load("textures/perfect-grid.png");
    let mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: text,
      side: THREE.DoubleSide
    });

    console.log(GlitchyMaterial);

    let material = new THREE.ShaderMaterial({
      vertexShader: GlitchyMaterial.vertex,
      fragmentShader: GlitchyMaterial.fragment,
      side: THREE.DoubleSide,
      uniforms: {
        iTime: { type: "f" }
      }
    });

    let plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material);
    plane.rotateX(Math.PI/2);

    this.scene.add(plane);

    document.body.appendChild(this.renderer.domElement);

    // BINDINGS
    this._handleWindowResize = this._handleWindowResize.bind(this);

    window.addEventListener("resize", this._handleWindowResize);
  }

  init () {
  }

  /**
   * redimensionne le renderer et change l'aspect de la caméra 
   */
  _handleWindowResize () {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth/window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  /**
   * 
   * @param {number} deltaT 
   * @param {number} time
   * @param {AudioData} audio 
   */
  render (deltaT, time, audio) {
    this.renderer.render(this.scene, this.camera);
  }
}

export default Renderer;