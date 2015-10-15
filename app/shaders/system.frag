varying float lifeLeft;

uniform sampler2D sprite;

void main() {
  vec3 color = vec3(0., 0.650, 0.4);
  vec4 tex = texture2D( sprite, gl_PointCoord );
  float alpha = lifeLeft * .25;

  gl_FragColor = vec4( color.rgb * tex.a, alpha * tex.a );
}