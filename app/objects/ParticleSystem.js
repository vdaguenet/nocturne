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
    this.life = 2.0;
    this.startTime = 0.0;
    this.size = 1.2;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.pos = new THREE.Vector3(0, 0, 0);
    this.spawnRate = 1500;

    this.animation = {
      horizontalSpeed: 1.7,
      verticalSpeed: 1.6,
      xRadius: 70,
      yRadius: 70,
      zRadius: 70,
    };

    this.particleSpriteTex = THREE.ImageUtils.loadTexture('assets/textures/particle2.png');
    this.particleSpriteTex.wrapS = this.particleSpriteTex.wrapT = THREE.RepeatWrapping;

    this.uniforms = {
      time: { type: 'f', value: 0.0 },
      resolution: { type: 'v2', value: new THREE.Vector2() },
      'tSprite': { type: 't', value: this.particleSprite },
    };

    this.geom = new THREE.BufferGeometry();
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: glslify('../shaders/system.vert'),
      fragmentShader: glslify('../shaders/system.frag'),
      depthTest: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
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

    this.geom.addAttribute('position', new THREE.BufferAttribute(this.positions, 3).setDynamic(true));
    this.geom.addAttribute('velocity', new THREE.BufferAttribute(this.velocities, 3).setDynamic(true));
    this.geom.addAttribute('startTime', new THREE.BufferAttribute(this.startTimes, 1).setDynamic(true));
    this.geom.addAttribute('size', new THREE.BufferAttribute(this.sizes, 1).setDynamic(true));
    this.geom.addAttribute('life', new THREE.BufferAttribute(this.lifes, 1).setDynamic(true));
  }

  spawnParticle() {
    let i = this.nbParticles;

    this.positions[i * 3 + 0] = this.pos.x + (Math.random() - 0.5) * 0.07;  // x
    this.positions[i * 3 + 1] = this.pos.y + (Math.random() - 0.5) * 0.07;  // y
    this.positions[i * 3 + 2] = this.pos.z + (Math.random() - 0.5) * 0.07;  // z

    this.velocities[i * 3 + 0] = this.velocity.x + (Math.random() - 0.5) * 0.55; // x
    this.velocities[i * 3 + 1] = this.velocity.y + (Math.random() - 0.5) * 0.55; // y
    this.velocities[i * 3 + 2] = this.velocity.z + (Math.random() - 0.5) * 0.55; // z

    this.startTimes[i] = this.startTime;        // startTime
    this.sizes[ i ] = this.size;
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

  update(time, delta) {
    let t = 0.1 * time;

    this.pos.x = Math.sin(t * this.animation.horizontalSpeed) * this.animation.xRadius;
    this.pos.y = Math.sin(t * this.animation.verticalSpeed) * this.animation.yRadius;
    this.pos.z = Math.sin(t * (this.animation.horizontalSpeed + this.animation.verticalSpeed)) * this.animation.zRadius;

    this.velocity.x = Math.abs(Math.sin(t * this.animation.horizontalSpeed));
    this.velocity.y = Math.abs(Math.cos(t * this.animation.verticalSpeed));
    this.velocity.z = Math.abs(Math.sin(t * (this.animation.horizontalSpeed + this.animation.verticalSpeed)) + Math.cos(t));

    for (let x = 0; x < this.spawnRate; x++) {
      this.spawnParticle();
    }

    this.startTime = t;
    this.mat.uniforms.time.value = t;

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
