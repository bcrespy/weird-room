/**
 * @license MIT 
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 */


import * as THREE from "three";
import Camera from "./camera";
import AudioData from "@creenv/audio/audio-analysed-data";


const MAX_POINTS = 100000;

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
    this.geometry.addAttribute("position", new THREE.BufferAttribute(this.positions, 3));

    this.cloud = new THREE.Points(this.geometry, new THREE.PointsMaterial({
      color: 0xff0000,
      size: 1.5
    }));

    scene.add(this.cloud);

    // number of points currently being rendered to the scene 
    this.pointsNumber = 0;
  }

  addPoint (point) {
    this.pointsNumber++;
    let positions = this.cloud.geometry.attributes.position.array;
    let index = this.pointsNumber*3;
    positions[index] = point.x;
    positions[index+1] = point.y;
    positions[index+2] = point.z;
    this.cloud.geometry.attributes.position.needsUpdate = true;
    this.cloud.geometry.setDrawRange(0, this.pointsNumber);
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
    this.addPoint(new THREE.Vector3(pos.x+direction.x*50.0, 0.0, pos.z+direction.z*50.0));
  }
};

export default ReactiveTube;