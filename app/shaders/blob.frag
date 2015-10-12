uniform float time;
uniform vec2 resolution;

varying vec3 vNormal;

void main() {
  //
  // Light
  //
  vec3 light = vec3(0.35, 0.55, 1.0);
  light = normalize(light);
  float lightEmissive = max(0.0, dot(vNormal, light));

  vec2 st = gl_FragCoord.xy / resolution;
  lightEmissive = 0.35 * lightEmissive;
  float b = lightEmissive + abs(cos(st.x));
  float g = lightEmissive + abs(cos(st.y));
  float r = lightEmissive;

  gl_FragColor = vec4(0.0 * r, 0.679 * g, 0.766 * b, 1.0);
}