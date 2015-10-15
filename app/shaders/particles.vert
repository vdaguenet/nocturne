#pragma glslify: pnoise = require(glsl-noise/periodic/3d.glsl)

attribute float size;
attribute float alpha;

uniform float time;
uniform float scale;

varying float vAlpha;

void main() {
  vAlpha = alpha;
  gl_PointSize = size;

  float b = 7.0 * scale * pnoise( 0.05 * position + vec3( 2.0 * time), vec3( 100.0 ) );
  float displacement = -5.5 + b;
  vec3 newPosition = position + normal * displacement; //* 0.15

  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}