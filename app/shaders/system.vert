// Result is not good enough.
// Work is started and need to be continued. But not for this project :(
uniform float time;
uniform vec2 resolution;

attribute vec3 velocity;
attribute float startTime;
attribute float size;
attribute float life;

varying float lifeLeft;

void main() {
  vec3 newPosition;
  vec3 vel;

  float timeElapsed = time - startTime;

  lifeLeft = 1. - (timeElapsed / life);

  float scale = 1.0;
  gl_PointSize = ( scale * size ) * lifeLeft;
  // gl_PointSize = size;

  vel.x = ( velocity.x - .5 ) * 3.;
  vel.y = ( velocity.y - .5 ) * 3.;
  vel.z = ( velocity.z - .5 ) * 3.;

  newPosition = position.xyz + ( vel * 10. ) * ( time - startTime );

  if( vel.y > 0. && vel.y < .05 ) {
    lifeLeft = 0.;
  }

  if( vel.x < -1.45 ) {
    lifeLeft = 0.;
  }

  if( timeElapsed > 0. ) {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
  } else {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    lifeLeft = 0.;
    gl_PointSize = 0.;
  }
}