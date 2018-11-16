
import Canvas from "@creenv/canvas";
import Vector2 from "@creenv/vector/vector2";
import Color from "@creenv/color";
import AudioData from "@creenv/audio/audio-analysed-data"

import * as THREE from "three";

import config from "./config";



class Renderer {
  constructor () {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    let cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({
        color: 0xff0000
      })
    );

    this.scene.add(cube);

    document.body.appendChild(this.renderer.domElement);
  }

  init () {
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