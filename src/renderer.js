
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

    //Create a closed wavey loop
    var curve = new THREE.CatmullRomCurve3( [
			new THREE.Vector3( 0, - 40, - 40 ),
			new THREE.Vector3( 0, 40, - 40 ),
			new THREE.Vector3( 0, 140, - 40 ),
			new THREE.Vector3( 0, 40, 40 ),
      new THREE.Vector3( 0, - 40, 40 ),
		] );
    curve.curveType = 'catmullrom';
    curve.closed = true;
    

    var points = curve.getPoints( 50 );
    this.geometry = new THREE.BufferGeometry().setFromPoints( points );
    this.geometry.scale(0.02,0.02,0.02);
    this.geometry.rotateZ(Math.PI/2);
    

    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

    // Create the final object to add to the scene
    this.curveObject = new THREE.Line( this.geometry, material );

    this.scene.add(this.curveObject);

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
  updateUniforms (deltaT, time, audio) {
    this.material.uniforms["iTime"].value = time;
    this.material.uniforms["distorsionStrength"].value = config.distortionMin + (audio.energyAverage/128)*config.distortionRange;
    this.material.uniforms["scale"].value = config.scale;
  }

  updateCamera () {

  }

  /**
   * 
   * @param {number} deltaT 
   * @param {number} time
   * @param {AudioData} audio 
   */
  render (deltaT, time, audio) {
    this.curveObject.position.setY(2.0);
    this.curveObject.rotateY(config.scale);

    this.updateUniforms(deltaT, time, audio);
    this.renderer.render(this.scene, this.camera);
  }
}

export default Renderer;