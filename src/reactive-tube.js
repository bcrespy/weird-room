/**
 * @license MIT 
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 */


import * as THREE from "three";
import Camera from "./camera";
import AudioData from "@creenv/audio/audio-analysed-data";

import LineShader from "./shaders/line-shader";


const MAX_POINTS = 100000;

const TUBE_RADIUS = 2;
const LONG = 5;

class ReactiveTube {
  /**
   * 
   * @param {THREE.Scene} scene 
   * @param {Camera} camera 
   */
  constructor (scene, camera) {
    this.camera = camera;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(MAX_POINTS*3);
    this.indices = new Array(MAX_POINTS*6);
    this.indices.fill(0);
    for (let i = LONG*2; i < MAX_POINTS-LONG; i++) {
      let idx = i*3-1;
      let a = idx;
      let b = idx+3;
      let c = idx-(LONG*3);
      let d = idx-(LONG*3)+3;

      let idcsIdx = i*6;

      this.indices[idcsIdx] = a;
      this.indices[idcsIdx+1] = b;
      this.indices[idcsIdx+2] = c;
      this.indices[idcsIdx+3] = b;
      this.indices[idcsIdx+4] = c;
      this.indices[idcsIdx+5] = d;
    }

    console.log(this.indices);

    this.geometry.setIndex(this.indices);

    this.geometry.addAttribute("position", new THREE.BufferAttribute(this.positions, 3));

    let mat = new THREE.ShaderMaterial({
      fragmentShader: LineShader.fragment,
      vertexShader: LineShader.vertex,
      side: THREE.DoubleSide,
      transparent: true
    });

    this.cloud = new THREE.Mesh(this.geometry, mat);

    scene.add(this.cloud);

    // number of points currently being rendered to the scene 
    this.pointsNumber = 0;

    this.direction = new THREE.Vector3();
    this.lastPoint = new THREE.Vector3();
  }

  /**
   * 
   * @param {THREE.Vector3} point 
   */
  addPoint (point) {
    // index du premier point rajouté 
    let index = this.pointsNumber*3;

    // la direction du tube 
    let tubeDirection = point.clone();
    tubeDirection.sub(this.lastPoint);
    tubeDirection.normalize();

    let positions = this.cloud.geometry.attributes.position.array;

    for (let i = 0; i < LONG; i++) {
      let idx = index+i*3;
      let theta = i * 2*Math.PI / LONG;

      let p = new THREE.Vector3(TUBE_RADIUS * Math.cos(theta)*0.5/*divide tube width by 2*/, 0, TUBE_RADIUS * Math.sin(theta));
      let e = new THREE.Euler(Math.atan(tubeDirection.z/tubeDirection.y), Math.atan(tubeDirection.y/tubeDirection.x), Math.atan(tubeDirection.x/tubeDirection.z));
      p.applyEuler(e);
      p.add(point)

      positions[idx] = p.x;
      positions[idx+1] = p.y;
      positions[idx+2] = p.z;

      /*
      positions[idx] = point.x + TUBE_RADIUS * Math.cos(theta);
      positions[idx+1] = point.y + TUBE_RADIUS * Math.sin(theta);
      positions[idx+2] = point.z + TUBE_RADIUS * Math.cos(theta);*/
    }

    // index des faces, sauf première ité
    /*if (index) {
      for (let i = 0; i < LONG; i++) {
        let idx = index + i*3;
        let a = idx;
        let b = idx+3;
        let c = idx-(LONG*3);
        let d = idx-(LONG-1)*3;

        let idcsIdx = (this.pointsNumber-LONG)*6 + i*6;

        this.cloud.geometry.index.array[idcsIdx] = a;
        this.cloud.geometry.index.array[idcsIdx+1] = b;
        this.cloud.geometry.index.array[idcsIdx+2] = c;
        this.cloud.geometry.index.array[idcsIdx+3] = b;
        this.cloud.geometry.index.array[idcsIdx+4] = c;
        this.cloud.geometry.index.array[idcsIdx+5] = d;
      }
      this.cloud.geometry.index.needsUpdate = true;
    }*/

    this.pointsNumber+= LONG;

    this.cloud.geometry.attributes.position.needsUpdate = true;
    this.cloud.geometry.setDrawRange(0, this.pointsNumber*2);

    this.lastPoint.copy(point);
  }

  /**
   * 
   * @param {number} time absolute timer since the beginning of the scene 
   * @param {AudioData} audio audio analysed data of the current signal 
   */
  update (time, audio) {
    let direction = new THREE.Vector3();
    let pos = new THREE.Vector3();
    this.camera.get().getWorldDirection(direction);
    this.camera.get().getWorldPosition(pos);
    this.addPoint(new THREE.Vector3(-pos.x* (0.7 - 0.5*(time/500000)), audio.energy/4, -pos.z* (0.7- 0.5*(time/500000))));
  }
};

export default ReactiveTube;