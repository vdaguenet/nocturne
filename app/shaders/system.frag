varying float lifeLeft;

uniform sampler2D sprite;

float hexToFloat(float hex) {
  return hex / 255.0;
}

void main() {
  vec3 color = vec3(hexToFloat(91.0), hexToFloat(4.0), hexToFloat(189.0));
  vec4 tex = texture2D( sprite, gl_PointCoord );
  float alpha = lifeLeft * .5;

  gl_FragColor = vec4( color.rgb * tex.a, alpha * tex.a );
}