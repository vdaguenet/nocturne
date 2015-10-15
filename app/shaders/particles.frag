varying float vAlpha;

void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, min(vAlpha, 1.0));
}