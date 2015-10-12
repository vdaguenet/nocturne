#pragma glslify: pnoise = require(glsl-noise/periodic/3d.glsl)

uniform float scale;
uniform float time;

varying vec3 vNormal;

void main() {
    vNormal = normal;

    float b = scale * pnoise( 0.05 * position + vec3( 2.0 * 0.01 * time ), vec3( 100.0 ) );
    float displacement = -10. + b;

    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}