export default {
  vertex: `
    varying vec2 vUv;

    void main() {
      vUv = uv;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, position.z, 1.0);
    }
  `,

  fragment: `
  varying vec2 vUv;

    void main() {

      gl_FragColor = vec4(gl_FragCoord.x, gl_FragCoord.x, gl_FragCoord.x, 0.4);
    }
  `
};