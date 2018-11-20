/**
 * @author oosmoxiecode
 * @author Mugen87 <https://github.com/Mugen87>
 * @author bcrespy <https://crespy-baptiste.com>
 *
 * based on http://www.blackpawn.com/texts/pqtorus/
 * 
 * An array of indexes is stored
 * 
 * resources: 
 * https://www.maa.org/sites/default/files/images/upload_library/23/stemkoski/knots/page5.html
 */

import { Geometry, BufferGeometry, Float32BufferAttribute, Vector3 } from "three";

// TorusKnotGeometry

class AnimableTorusKnowBufferGeometry extends BufferGeometry {
  constructor (radius, tube, tubularSegments, radialSegments, p, q) {
    super();

    this.type = 'TorusKnotBufferGeometry';

    radius = radius || 1;
    tube = tube || 0.4;
    tubularSegments = Math.floor( tubularSegments ) || 64;
    radialSegments = Math.floor( radialSegments ) || 8;
    p = p || 2;
    q = q || 3;

    this.parameters = {
      radius: radius,
      tube: tube,
      tubularSegments: tubularSegments,
      radialSegments: radialSegments,
      p: p,
      q: q
    };

    // buffers

    var indices = [];
    var vertices = [];
    var normals = [];
    var uvs = [];

    this.maxY = 0;

    // helper variables

    var i, j;

    var vertex = new Vector3();
    var normal = new Vector3();

    var P1 = new Vector3();
    var P2 = new Vector3();

    var B = new Vector3();
    var T = new Vector3();
    var N = new Vector3();

    // generate vertices, normals and uvs

    for ( i = 0; i <= tubularSegments; ++ i ) {

      // the radian "u" is used to calculate the position on the torus curve of the current tubular segement

      var u = i / tubularSegments * p * Math.PI * 2;

      // now we calculate two points. P1 is our current position on the curve, P2 is a little farther ahead.
      // these points are used to create a special "coordinate space", which is necessary to calculate the correct vertex positions

      this.calculatePositionOnCurve( u, P1 );
      this.calculatePositionOnCurve( u + 0.01, P2 );

      // calculate orthonormal basis

      T.subVectors( P2, P1 );
      N.addVectors( P2, P1 );
      B.crossVectors( T, N );
      N.crossVectors( B, T );

      // normalize B, N. T can be ignored, we don't use it

      B.normalize();
      N.normalize();

      for ( j = 0; j <= radialSegments; ++ j ) {

        // now calculate the vertices. they are nothing more than an extrusion of the torus curve.
        // because we extrude a shape in the xy-plane, there is no need to calculate a z-value.

        var v = j / radialSegments * Math.PI * 2;
        var cx = - tube * Math.cos( v );
        var cy = tube * Math.sin( v );

        // now calculate the final vertex position.
        // first we orient the extrusion with our basis vectos, then we add it to the current position on the curve

        vertex.x = P1.x + ( cx * N.x + cy * B.x );
        vertex.y = P1.y + ( cx * N.y + cy * B.y );
        vertex.z = P1.z + ( cx * N.z + cy * B.z );

        let absy = Math.abs(vertex.y);
        if (absy > this.maxY) this.maxY = absy;

        vertices.push( vertex.x, vertex.y, vertex.z );

        // normal (P1 is always the center/origin of the extrusion, thus we can use it to calculate the normal)

        normal.subVectors( vertex, P1 ).normalize();

        normals.push( normal.x, normal.y, normal.z );

        // uv

        uvs.push( i / tubularSegments );
        uvs.push( j / radialSegments );

      }

    }

    // generate indices

    for ( j = 1; j <= tubularSegments; j ++ ) {

      for ( i = 1; i <= radialSegments; i ++ ) {

        // indices

        var a = ( radialSegments + 1 ) * ( j - 1 ) + ( i - 1 );
        var b = ( radialSegments + 1 ) * j + ( i - 1 );
        var c = ( radialSegments + 1 ) * j + i;
        var d = ( radialSegments + 1 ) * ( j - 1 ) + i;

        // faces

        indices.push( a, b, d );
        indices.push( b, c, d );

      }

    }

    // build geometry

    this.setIndex( indices );
    this.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
    this.addAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
    this.addAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

    this.initialPositions = new Float32BufferAttribute(vertices.slice(), 3);
  }
  
  // this function calculates the current position on the torus curve
  calculatePositionOnCurve (u, position) {
    var cu = Math.cos(u);
    var su = Math.sin(u);
    var quOverP = this.parameters.q / this.parameters.p * u;
    var cs = Math.cos(quOverP);

    position.x = this.parameters.radius * ( 2 + cs ) * 0.5 * cu;
    position.y = this.parameters.radius * ( 2 + cs ) * su * 0.5;
    position.z = this.parameters.radius * Math.sin( quOverP ) * 0.5;
  }

  lerpToOrigin () {
    let t = 0.94;

    let positions = this.attributes.position.array,
        origins = this.initialPositions.array;

    for (let i = 0; i < positions.length; i++) {
      for (let a = 0; a < 3; a++ ) {
        positions[i+a] = origins[i+a] + (positions[i+a]-origins[i+a])*t;
      }
    }
  }

  getPointsIndexesAt (t) {
    let indexes = this.getIndex().array;
    let vertices = this.attributes.position.array;

    let ret = [];
    
    let start = Math.floor(t*this.parameters.tubularSegments);
    let st2 = start*this.parameters.radialSegments;

    let start2 = (start+this.parameters.tubularSegments-1)%this.parameters.tubularSegments;
    let st3 = start2*this.parameters.radialSegments;

    for (let i = st2; i < st2+this.parameters.radialSegments; i++) {
      let e = i*6;
      let e2 = (i+this.parameters.tubularSegments-1)%this.parameters.tubularSegments;
      for (let a = 0; a < 6; a++) {
        let id = indexes[e+a]*3;
        ret.push(id);
        //points.push(vertices[id], vertices[id+1], vertices[id+2]);
      }
    }

    for (let i = st3; i < st3+this.parameters.radialSegments; i++) {
      let e = i*6;
      let e2 = (i+this.parameters.tubularSegments-1)%this.parameters.tubularSegments;
      for (let a = 0; a < 6; a++) {
        let id = indexes[e+a]*3;
        ret.push(id);
        //points.push(vertices[id], vertices[id+1], vertices[id+2]);
      }
    }

    return ret;
  }
};

export default AnimableTorusKnowBufferGeometry;