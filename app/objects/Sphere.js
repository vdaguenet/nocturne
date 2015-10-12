import THREE from 'three';
const glslify = require('glslify');

export default class Sphere extends THREE.Object3D {
  constructor() {
    super();

    this.uniforms = {
      scale: { type: 'f', value: 1.0 },
      time: { type: 'f', value: 0.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
    };

    this.geom = new THREE.SphereGeometry(20, 50, 50);
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: glslify('../shaders/blob.vert'),
      fragmentShader: glslify('../shaders/blob.frag'),
      wireframe: false,
    });
    this.mesh = new THREE.Mesh(this.geom, this.mat);

    this.add(this.mesh);
  }

  resize(width, height) {
    this.mat.uniforms.resolution.value.x = width;
    this.mat.uniforms.resolution.value.y = height;
  }

  update(time, soundFactor) {
    this.mat.uniforms.time.value = 0.02 * time;
    this.mat.uniforms.scale.value = 0.1 * soundFactor + 1.0;
  }
}