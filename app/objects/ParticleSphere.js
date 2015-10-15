import THREE from 'three';
const glslify = require('glslify');

export default class ParticleSphere extends THREE.Object3D {
  constructor() {
    super();

    this.nbParticles;
    this.positions;
    this.colors;
    this.sizes;
    this.alpha = 1;
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
    this.hiddenSphere = new THREE.SphereGeometry(40, 80, 80);
    this.nbParticles = this.hiddenSphere.vertices.length;
    this.positions = new Float32Array(this.nbParticles * 3);
    this.destPositions = new Float32Array(this.nbParticles * 3);
    this.sizes = new Float32Array(this.nbParticles);
    this.alphas = new Float32Array(this.nbParticles);

    for (let i = 0, i3 = 0; i < this.nbParticles; i ++, i3 += 3) {
      this.positions[ i3 + 0 ] = this.hiddenSphere.vertices[ i ].x;
      this.positions[ i3 + 1 ] = this.hiddenSphere.vertices[ i ].y;
      this.positions[ i3 + 2 ] = this.hiddenSphere.vertices[ i ].z;

      this.sizes[ i ] = 1.0;
      this.alphas[ i ] = this.alpha;
    }

    this.geom.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geom.addAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    this.geom.addAttribute('alpha', new THREE.BufferAttribute(this.alphas, 1));
    this.geom.computeVertexNormals();
  }

  resize(width, height) {
    this.mat.uniforms.resolution.value.x = width;
    this.mat.uniforms.resolution.value.y = height;
  }

  start() {
    this.mustTransitioning = true;

    for (let i = 0, i3 = 0; i < this.nbParticles; i ++, i3 += 3) {
      this.destPositions[ i3 + 0 ] = this.positions[ i3 + 0 ];
      this.destPositions[ i3 + 1 ] = this.positions[ i3 + 1 ];
      this.destPositions[ i3 + 2 ] = this.positions[ i3 + 2 ];

      this.positions[ i3 + 0 ] = THREE.Math.randInt(-100, 100);
      this.positions[ i3 + 1 ] = THREE.Math.randInt(-100, 100);
      this.positions[ i3 + 2 ] = THREE.Math.randInt(-100, 100);
    }

    this.geom.attributes.position.needsUpdate = true;
  }

  transitionIn(time) {

    const positions = this.geom.attributes.position.array;

    const t = 0.01 * time;
    for (let i = 0, i3 = 0; i < this.nbParticles; i++, i3 += 3) {
      positions[i3 + 0] = (1 - t) * positions[i3 + 0] + t * this.destPositions[i3 + 0];
      positions[i3 + 1] = (1 - t) * positions[i3 + 1] + t * this.destPositions[i3 + 1];
      positions[i3 + 2] = (1 - t) * positions[i3 + 2] + t * this.destPositions[i3 + 2];
    }

    this.geom.attributes.position.needsUpdate = true;

    if (Math.sign(positions[0]) === 1) {
      this.mustTransitioning = positions[0] > 0.005;
    } else {
      this.mustTransitioning = positions[0] < -0.005;
    }
  }

  update(time, soundFactor) {
    if (this.mustTransitioning) {
      this.transitionIn(time);
      this.mat.uniforms.scale.value = 0;
    } else {
      this.mat.uniforms.scale.value = 0.07 * soundFactor;
    }

    this.mat.uniforms.time.value = 0.2 * time;

    // this.geom.computeVertexNormals();
    // this.geom.attributes.position.needsUpdate = true;


    // pretty nice. Keep it son!
    // const sizes = this.geom.attributes.size.array;
    // for (let i = 0; i < this.nbParticles; i++) {
    //   sizes[ i ] = 1 + Math.sin(0.7 * i + time);
    // }
    // this.geom.attributes.size.needsUpdate = true;
  }
}
