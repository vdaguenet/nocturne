#pragma glslify: pnoise = require(glsl-noise/periodic/3d.glsl)

uniform float time;
uniform vec2 resolution;

attribute vec3 velocity;
attribute float startTime;
attribute float size;
attribute float life;

varying float lifeLeft;

// Thanks to Spite for this function
float turbulence( vec3 p ) {
  float t = -.5;
  for (float f = 1.0 ; f <= 10.0 ; f++ ){
      float power = pow( 2.0, f );
      t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
  }
  return t;
}

void main() {
  vec3 newPosition;
  vec3 vel;

  float elapsedTime = time - startTime;
  float timeOnLife = elapsedTime / life;

  lifeLeft = 1.0 - timeOnLife;

  float scale = 3.0;
  gl_PointSize = ( scale * size ) * lifeLeft;

  float turb = turbulence( vec3( velocity.x * elapsedTime, velocity.y * elapsedTime, velocity.z * elapsedTime ) );
  float noise = pnoise( velocity * timeOnLife, vec3( 1000.0 ) );
  float displacement = 10. * noise + (30. * timeOnLife * turb);

  // float displacement = 1. * noise + 30. * turb * (sin(timeOnLife) + noise);

  newPosition = position + velocity * displacement;
  // newPosition = position + velocity;
  // newPosition = mix(newPosition, newPosition + vec3(displacement) , timeOnLife);


  if( gl_PointSize < .05 ) {
    lifeLeft = 0.;
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}