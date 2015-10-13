/**
 * Result is not good enough.
 * Work is started and need to be continued. But not for this project :(
 */
import THREE from 'three';
const glslify = require('glslify');

export default class ParticleSystem extends THREE.Object3D {
  constructor() {
    super();

    // Counters
    this.MAX_PARTICLES = 300000; // max 300000
    this.nbParticles = 0; // max 300000
    this.count = 0;
    this.offset = 0;

    this.needUpdate = false;

    // Particle settings
    this.life = 1.0;
    this.time = 0.0;
    this.size = 1.0;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.pos = new THREE.Vector3(0, 0, 0);
    this.horizontalSpeed = 1.5;
    this.verticalSpeed = 1.33;
    this.spawnRate = 15000;

    this.uniforms = {
      time: { type: 'f', value: 0.0 },
      resolution: { type: 'v2', value: new THREE.Vector2() },
    };

    this.geom = new THREE.BufferGeometry();
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: glslify('../shaders/system.vert'),
      fragmentShader: glslify('../shaders/system.frag'),
      depthTest: false,
      transparent: true,
    });

    this.init();

    this.system = new THREE.Points(this.geom, this.mat);
    this.system.position.set(0, 0, 0);
    this.add(this.system);
  }

  init() {
    this.positions = new Float32Array(this.MAX_PARTICLES * 3);
    this.velocities = new Float32Array(this.MAX_PARTICLES * 3);
    this.startTimes = new Float32Array(this.MAX_PARTICLES);
    this.lifes = new Float32Array(this.MAX_PARTICLES);
    this.sizes = new Float32Array(this.MAX_PARTICLES);

    for (let i = 0; i < this.MAX_PARTICLES; i ++) {
      this.positions[i * 3 + 0] = this.pos.x;  // x
      this.positions[i * 3 + 1] = this.pos.y;  // y
      this.positions[i * 3 + 2] = this.pos.z;  // z

      this.velocities[i * 3 + 0] = this.velocity.x; // x
      this.velocities[i * 3 + 1] = this.velocity.y; // y
      this.velocities[i * 3 + 2] = this.velocity.z; // z

      this.startTimes[i] = this.time;        // startTime
      this.sizes[ i ] = this.size;
      this.lifes[ i ] = 0.0;
    }

    this.geom.addAttribute('position', new THREE.BufferAttribute(this.positions, 3).setDynamic(true));
    this.geom.addAttribute('velocity', new THREE.BufferAttribute(this.velocities, 3).setDynamic(true));
    this.geom.addAttribute('startTime', new THREE.BufferAttribute(this.startTimes, 1).setDynamic(true));
    this.geom.addAttribute('size', new THREE.BufferAttribute(this.sizes, 1).setDynamic(true));
    this.geom.addAttribute('life', new THREE.BufferAttribute(this.lifes, 1).setDynamic(true));
    this.geom.computeVertexNormals();
  }

  spawnParticle() {
    let i = this.nbParticles;

    this.positions[i * 3 + 0] = this.pos.x + (Math.random() - 0.5) * 0.07;  // x
    this.positions[i * 3 + 1] = this.pos.y + (Math.random() - 0.5) * 0.07;  // y
    this.positions[i * 3 + 2] = this.pos.z + (Math.random() - 0.5) * 0.07;  // z

    this.velocities[i * 3 + 0] = this.velocity.x; // x
    this.velocities[i * 3 + 1] = this.velocity.y; // y
    this.velocities[i * 3 + 2] = this.velocity.z; // z

    this.startTimes[i] = this.time + (Math.random() - 0.5) * 2e-2;        // startTime
    this.sizes[ i ] = this.size + (Math.random() - 0.5) * 1.0;
    this.lifes[ i ] = this.life;

    if (this.offset === 0) {
      this.offset = this.nbParticles;
    }

    this.count++;
    this.nbParticles++;

    if (this.nbParticles >= this.MAX_PARTICLES) {
      this.nbParticles = 0;
    }

    this.needUpdate = true;
  }

  resize(width, height) {
    this.mat.uniforms.resolution.value.x = width;
    this.mat.uniforms.resolution.value.y = height;
  }

  populate(delta) {
    for (let x = 0; x < this.spawnRate * delta; x++) {
      this.spawnParticle();
    }
  }

  update(time, delta) {
    this.pos.x = Math.sin(time * this.horizontalSpeed) * 20;
    this.pos.y = Math.sin(time * this.verticalSpeed) * 10;
    this.pos.z = Math.sin(time * this.horizontalSpeed + this.verticalSpeed) * 5;

    if (delta > 0) {
      this.populate(delta);
    }

    this.time = time;
    this.mat.uniforms.time.value = time;

    if (this.needUpdate) {
      this.updateGeometry();
    }
  }

  updateGeometry() {
    this.needUpdate = false;

    if (self.offset + self.count < self.PARTICLE_COUNT) {
      this.geom.attributes.position.updateRange.offset = 0;
      this.geom.attributes.position.updateRange.count = self.count * 3;

      this.geom.attributes.velocity.updateRange.offset = self.offset * 3;
      this.geom.attributes.velocity.updateRange.count = self.count * 3;

      this.geom.attributes.startTime.updateRange.offset = self.offset * 3;
      this.geom.attributes.startTime.updateRange.count = self.count;

      this.geom.attributes.size.updateRange.offset = self.offset * 3;
      this.geom.attributes.size.updateRange.count = self.count;

      this.geom.attributes.life.updateRange.offset = self.offset * 3;
      this.geom.attributes.life.updateRange.count = self.count;

    } else {

      this.geom.attributes.position.updateRange.offset = 0;
      this.geom.attributes.position.updateRange.count = this.MAX_PARTICLES * 3;

      this.geom.attributes.velocity.updateRange.offset = 0;
      this.geom.attributes.velocity.updateRange.count = this.MAX_PARTICLES * 3;

      this.geom.attributes.startTime.updateRange.offset = 0;
      this.geom.attributes.startTime.updateRange.count = this.MAX_PARTICLES;

      this.geom.attributes.size.updateRange.offset = 0;
      this.geom.attributes.size.updateRange.count = this.MAX_PARTICLES;

      this.geom.attributes.life.updateRange.offset = 0;
      this.geom.attributes.life.updateRange.count = this.MAX_PARTICLES;
    }

    this.geom.attributes.position.needsUpdate = true;
    this.geom.attributes.velocity.needsUpdate = true;
    this.geom.attributes.startTime.needsUpdate = true;
    this.geom.attributes.size.needsUpdate = true;
    this.geom.attributes.life.needsUpdate = true;

    this.offset = 0;
    this.count = 0;
  }
}
