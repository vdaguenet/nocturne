#pragma glslify: pnoise = require(glsl-noise/periodic/3d.glsl)

attribute float size;
attribute float alpha;

uniform float time;
uniform float scale;

varying float vAlpha;

void main() {
  vAlpha = alpha;
  gl_PointSize = size;

  vec3 newPosition;
  float displacement;

  float b = 7.0 * scale * pnoise( 0.05 * position + vec3( 2.0 * time), vec3( 100.0 ) );
  displacement = -5.5 + b;
  newPosition = position + normal * displacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}