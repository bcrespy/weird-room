/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * This class handles the torus update + the way toruses are added / removed from the scene
 **/

import * as THREE from "three";
import AudioData from "@creenv/audio/audio-analysed-data";
import AnimatedTorusKnotBufferGeometry from "./animable-torus-knot";


const RADIAL      = 10;
const LONGS       = 80;


class TorusManager {
  constructor (scene) {
    this.scene = scene;
    this.material = new THREE.MeshNormalMaterial();

    this.toruses = [];
  }

  addTorus () {
    let radial = RADIAL,
        longs = LONGS;

    let geo = new AnimatedTorusKnotBufferGeometry(10, 3, longs, radial, 2, 4);
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

  /**
   * 
   * @param {number} time absolute time in ms
   * @param {AudioData} audio processed audio data
   */
  update (time, audio) {
    let t = (time/1000.0/10.0)%1.0;

    this.toruses.forEach(torus => {
      // le point sur la courve, point depuis lequel la répulsion aura lieu
      let o = new THREE.Vector3();
      torus.geo.calculatePositionOnCurve(t, o);

      let indexes = torus.geo.getPointsIndexesAt(t);
      let positions = torus.geo.attributes.position.array;
      for (let id of indexes) {
        let v = new THREE.Vector3(positions[id], positions[id+1], positions[id+2]);
        let vo = v.clone().sub(o).normalize();
        v.add(vo.multiplyScalar(0.2 * v.y/torus.geo.maxY)); // compare to Y max
        positions[id] = v.x;
        positions[id+1] = v.y;
        positions[id+2] = v.z;
      }
      torus.geo.lerpToOrigin();
      torus.mesh.geometry.attributes.position.needsUpdate = true;
    });
  }
};

export default TorusManager;