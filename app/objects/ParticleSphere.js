import THREE from 'three';
const glslify = require('glslify');

export default class ParticleSphere extends THREE.Object3D {
  constructor() {
    super();

    this.nbParticles;
    this.positions;
    this.colors;
    this.sizes;
    this.alpha = 0;
    this.mustTransitioning = false;

    this.uniforms = {
      time: { type: 'f', value: 0.0 },
      scale: { type: 'f', value: 1.0 },
      resolution: { type: 'v2', value: new THREE.Vector2() },
    };

    this.geom = new THREE.BufferGeometry();
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: glslify('../shaders/particles.vert'),
      fragmentShader: glslify('../shaders/particles.frag'),
      depthTest: false,
      transparent: true,
    });

    this.init();

    this.particleSphere = new THREE.Points(this.geom, this.mat);
    this.add(this.particleSphere);
  }

  init() {
    const hiddenSphere = new THREE.SphereGeometry(40, 80, 80);
    this.nbParticles = hiddenSphere.vertices.length;
    this.positions = new Float32Array(this.nbParticles * 3);
    this.sizes = new Float32Array(this.nbParticles);
    this.alphas = new Float32Array(this.nbParticles);

    for (let i = 0, i3 = 0; i < this.nbParticles; i ++, i3 += 3) {
      this.positions[ i3 + 0 ] = hiddenSphere.vertices[ i ].x;
      this.positions[ i3 + 1 ] = hiddenSphere.vertices[ i ].y;
      this.positions[ i3 + 2 ] = hiddenSphere.vertices[ i ].z;

      this.sizes[ i ] = 1.0;
      this.alphas[ i ] = this.alpha;
    }

    this.geom.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geom.addAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    this.geom.addAttribute('alpha', new THREE.BufferAttribute(this.alphas, 1));
    this.geom.computeVertexNormals();
    this.geom.computeFaceNormals();
  }

  resize(width, height) {
    this.mat.uniforms.resolution.value.x = width;
    this.mat.uniforms.resolution.value.y = height;
  }

  start() {
    this.mustTransitioning = true;
    console.log('start', this.mustTransitioning);
  }

  transitionIn() {
    if (this.alpha >= 0.95) {
      this.mustTransitioning = false;
      return;
    }

    const alphas = this.geom.attributes.alpha.array;
    for (let i = 0; i < this.nbParticles; i++) {
      alphas[ i ] += (1 - alphas[i]) * 0.006;
    }
    this.alpha = alphas[0];
    this.geom.attributes.alpha.needsUpdate = true;
  }

  update(time, soundFactor) {
    if (this.mustTransitioning) {
      this.transitionIn();
    }

    this.mat.uniforms.time.value = 0.2 * time;
    this.mat.uniforms.scale.value = 0.07 * soundFactor;

    this.geom.computeVertexNormals();
    this.geom.attributes.position.needsUpdate = true;

    // pretty nice. Keep it son!
    // const sizes = this.geom.attributes.size.array;
    // for (let i = 0; i < this.nbParticles; i++) {
    //   sizes[ i ] = 1 + Math.sin(0.7 * i + time);
    // }
    // this.geom.attributes.size.needsUpdate = true;
  }
}
