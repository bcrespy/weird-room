
import Canvas from "@creenv/canvas";
import Vector2 from "@creenv/vector/vector2";
import Color from "@creenv/color";
import AudioData from "@creenv/audio/audio-analysed-data";

import * as THREE from "three";

import config from "./config";
import GlitchyMaterial from "./shaders/glitchy-material";
import Camera from "./camera";



class Renderer {
  constructor () {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setClearColor(0x0000ff);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.camera = new Camera(this.scene);

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



    // TEST 
    // https://www.maa.org/sites/default/files/images/upload_library/23/stemkoski/knots/page5.html

    function torus (t, q, p) {
      return new THREE.Vector3(
        Math.cos(q*t) * Math.sin(p*t),
        Math.sin(q*t) * Math.cos(p*t),
        Math.sin(p*t)
      );
    }

    let curvePoints = [];

    for (let i = 0; i < 2*Math.PI; i+= 0.05) {
      curvePoints.push(torus(i, 3, 7));
    }

    let curve = new THREE.CatmullRomCurve3(curvePoints);
    curve.curveType = 'catmullrom';
    curve.closed = true;
    
    let points = curve.getPoints( 50 );
    let geometry = new THREE.BufferGeometry().setFromPoints( points );
  
    var material = new THREE.LineBasicMaterial( { color : 0xff0000, linewidth: 3 } );

    // Create the final object to add to the scene
    let curveObject = new THREE.Line( geometry, material );
    curveObject.position.setY(7);
    curveObject.scale.set(5,5,5);

    this.scene.add(curveObject);
    // END TEST 



    // BINDINGS
    this._handleWindowResize = this._handleWindowResize.bind(this);

    window.addEventListener("resize", this._handleWindowResize);
    document.addEventListener("click", () => {
      this.addTorus();
    })
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

  addTorus () {
    let geo = new THREE.TorusKnotBufferGeometry(5, 2, 50, 8);
    let material = new THREE.MeshNormalMaterial();
    let knot = new THREE.Mesh(geo, material);
    this.scene.add(knot);
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

    this.updateUniforms(deltaT, time, audio);
    this.renderer.render(this.scene, this.camera.get());
  }
}

export default Renderer;