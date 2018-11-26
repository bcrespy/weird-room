/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * This class handles the torus update + the way toruses are added / removed from the scene
 **/

import * as THREE from "three";
import AudioData from "@creenv/audio/audio-analysed-data";
import AnimatedTorusKnotBufferGeometry from "./animable-torus-knot";

import config from "./config";


const RADIAL = 15;
const LONGS = 70;


class TorusManager {
  constructor(scene) {
    this.scene = scene;
    this.material = new THREE.MeshNormalMaterial();

    this.toruses = [];

    this.sinceLast = 0;
    this.transformations = 0;
  }

  addTorus(p = 2, q = 4) {
    let radial = RADIAL,
      longs = LONGS;

    let geo = new AnimatedTorusKnotBufferGeometry(15, 5, longs, radial, p, q);
    let mesh = new THREE.Mesh(geo, this.material);

    this.toruses.push({ geo, mesh });

    /*let points = geo.getPointsAt(0);
    let geo2 = new THREE.BufferGeometry();
    geo2.addAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    let cloud = new THREE.Points(geo2, new THREE.PointsMaterial({
      color: 0xff0000,
      size: 0.5
    }));
    this.scene.add(cloud);*/

    mesh.translateY(5.0);
    this.scene.add(mesh);
  }

  removeLastTorus () {
    let lastTorus = this.toruses.pop();
    this.scene.remove(lastTorus.mesh);
  }

  /**
   * 
   * @param {number} time absolute time in ms
   * @param {AudioData} audio processed audio data
   */
  update(time, deltaT, audio) {
    let t = (time / 1000.0 / 10.0) % 1.0;

    this.sinceLast+= deltaT;
    
    if (this.sinceLast >= 10000) {
      this.removeLastTorus();
      this.addTorus(Math.floor(Math.random()*10), Math.floor(Math.random()*10));

      this.transformations++;

      if (this.transformations >= 15) {
        this.sinceLast = 0;
        this.transformations = 0;
      }
    }

    this.toruses.forEach(torus => {
      // le point sur la courve, point depuis lequel la répulsion aura lieu
      let o = new THREE.Vector3();
      torus.geo.calculatePositionOnCurve(t, o);

      let indexes = torus.geo.getPointsIndexesAt(t);
      let positions = torus.geo.attributes.position.array;
      for (let id of indexes) {
        let v = new THREE.Vector3(positions[id], positions[id + 1], positions[id + 2]);
        let vo = v.clone().sub(o).normalize();
        v.add(vo.multiplyScalar((config.torusDeform*.2 + 0.8*config.torusDeform*audio.energy/100.0) * v.y / torus.geo.maxY)); // compare to Y max
        positions[id] = v.x;
        positions[id + 1] = v.y;
        positions[id + 2] = v.z;
      }
      torus.geo.lerpToOrigin();
      torus.mesh.geometry.attributes.position.needsUpdate = true;
    });
  }
};

export default TorusManager;