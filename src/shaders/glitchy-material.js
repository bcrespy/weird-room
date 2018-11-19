export default {
  vertex: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragment: `
    const float PI = 3.141592658;
    const float TAU = 2.0*PI;

    uniform float iTime;
    uniform sampler2D texture;
    
    varying vec2 vUv;

    float rand (const in vec2 uv) {
      const highp float a = 12.9898, b = 78.233, c = 43758.5453;
      highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
      return fract(sin(sn) * c);
    }

    void main() {

      vec2 pos = vUv+abs(rand(vUv))*0.02;
      
      float greyscale = 0.0;

      if ((mod(pos.x, 0.1) < 0.05 && mod(pos.y, 0.1) < 0.05) || (mod(pos.x, 0.1) > 0.05 && mod(pos.y, 0.1) > 0.05)) {
        greyscale = 1.0;
      }

      gl_FragColor = vec4(greyscale, greyscale, greyscale, 1.0);
    }
  `
};