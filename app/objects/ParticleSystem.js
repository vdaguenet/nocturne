/**
 * Result is not good enough.
 * Work is started and need to be continued. But not for this project :(
 */
import THREE from 'three';
const glslify = require('glslify');

const initialValues = {
  maxParticles: 100000,
  life: 2.0,
  size: 1.0,
  spawnRate: 1000,
  horizontalSpeed: 1.2,
  verticalSpeed: 1.6,
  xRadius: 80,
  yRadius: 74,
  zRadius: 80,
};

export default class ParticleSystem extends THREE.Object3D {
  constructor() {
    super();

    // Counters
    this.maxParticles = initialValues.maxParticles; // max 300000
    this.nbParticles = 0;
    this.count = 0;
    this.offset = 0;

    this.needUpdate = false;

    // Particle settings
    this.life = initialValues.life;
    this.size = initialValues.size;
    this.spawnRate = initialValues.spawnRate;
    this.horizontalSpeed = initialValues.horizontalSpeed;
    this.verticalSpeed = initialValues.verticalSpeed;
    this.xRadius = initialValues.xRadius;
    this.yRadius = initialValues.yRadius;
    this.zRadius = initialValues.zRadius;
    this.startTime = 0.0;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.pos = new THREE.Vector3(0, 0, 0);

    this.particleSpriteTex = THREE.ImageUtils.loadTexture('assets/textures/particle2.png');
    this.particleSpriteTex.wrapS = this.particleSpriteTex.wrapT = THREE.RepeatWrapping;

    this.uniforms = {
      time: { type: 'f', value: 0.0 },
      sound: { type: 'f', value: 0.0 },
      resolution: { type: 'v2', value: new THREE.Vector2() },
      tSprite: { type: 't', value: this.particleSprite },
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
    this.system.visible = false;
    this.add(this.system);
  }

  init() {
    this.positions = new Float32Array(this.maxParticles * 3);
    this.velocities = new Float32Array(this.maxParticles * 3);
    this.startTimes = new Float32Array(this.maxParticles);
    this.lifes = new Float32Array(this.maxParticles);
    this.sizes = new Float32Array(this.maxParticles);

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

    if (this.nbParticles >= this.maxParticles) {
      this.nbParticles = 0;
    }

    this.needUpdate = true;
  }

  resize(width, height) {
    this.mat.uniforms.resolution.value.x = width;
    this.mat.uniforms.resolution.value.y = height;
  }

  update(time, soundFactor) {
    if (soundFactor > 16) {
      this.system.visible = true;
    }

    if (!this.system.visible) { return; }

    const t = 0.1 * time;
    const s = 0.07 * soundFactor;

    this.pos.x = Math.cos(t * this.horizontalSpeed) * this.xRadius;
    this.pos.y = Math.sin(t * this.verticalSpeed) * this.yRadius;
    this.pos.z = Math.cos(t * (this.horizontalSpeed + this.verticalSpeed)) * this.zRadius;

    this.velocity.x = 1.5 * s * Math.sin(t * this.horizontalSpeed);
    this.velocity.y = 1.0 * s * Math.cos(t * this.verticalSpeed);
    this.velocity.z = 1.2 * s * (Math.sin(t * this.horizontalSpeed) + Math.cos(t * this.verticalSpeed));

    for (let x = 0; x < this.spawnRate; x++) {
      this.spawnParticle();
    }

    this.startTime = t;
    this.mat.uniforms.time.value = t;
    this.mat.uniforms.sound.value = s;

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
      this.geom.attributes.position.updateRange.count = this.maxParticles * 3;

      this.geom.attributes.velocity.updateRange.offset = 0;
      this.geom.attributes.velocity.updateRange.count = this.maxParticles * 3;

      this.geom.attributes.startTime.updateRange.offset = 0;
      this.geom.attributes.startTime.updateRange.count = this.maxParticles;

      this.geom.attributes.size.updateRange.offset = 0;
      this.geom.attributes.size.updateRange.count = this.maxParticles;

      this.geom.attributes.life.updateRange.offset = 0;
      this.geom.attributes.life.updateRange.count = this.maxParticles;
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
