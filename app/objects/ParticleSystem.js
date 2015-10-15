import THREE from 'three';
const glslify = require('glslify');

export default class ParticleSystem extends THREE.Object3D {
  constructor() {
    super();

    // Counters
    this.maxParticles = 250000;
    this.nbParticles = 0;

    // Particle settings
    this.life = 2.0;
    this.size = 1.0;
    this.spawnRate = 400;
    this.horizontalSpeed = 0.8;
    this.verticalSpeed = 0.8;
    this.maxVelocityX = 0.3;
    this.maxVelocityY = 0.6;
    this.xRadius = 80;
    this.yRadius = 40;
    this.zRadius = 120;
    this.startTime = 0.0;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.pos = new THREE.Vector3(0, 0, 0);

    this.particleSpriteTex = THREE.ImageUtils.loadTexture('assets/textures/particle2.png');
    this.particleSpriteTex.wrapS = this.particleSpriteTex.wrapT = THREE.RepeatWrapping;

    this.uniforms = {
      time: { type: 'f', value: 0.0 },
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

    this.positions[i * 3 + 0] = this.pos.x + (Math.random() - 0.5) * 0.07;
    this.positions[i * 3 + 1] = this.pos.y + (Math.random() - 0.5) * 0.07;
    this.positions[i * 3 + 2] = this.pos.z + (Math.random() - 0.5) * 0.07;

    this.velocities[i * 3 + 0] = this.velocity.x + (Math.random() - 0.5) * 0.55;
    this.velocities[i * 3 + 1] = this.velocity.y + (Math.random() - 0.5) * 0.55;
    this.velocities[i * 3 + 2] = this.velocity.z + (Math.random() - 0.5) * 0.55;

    this.startTimes[i] = this.startTime;
    this.sizes[ i ] = this.size;
    this.lifes[ i ] = this.life;

    this.nbParticles++;

    if (this.nbParticles >= this.maxParticles) {
      this.nbParticles = 0;
    }
  }

  resize(width, height) {}

  update(time, soundFactor) {
    if (soundFactor > 16) {
      this.system.visible = true;
    }

    if (!this.system.visible) { return; }

    const t = 0.1 * time;
    const s = 0.07 * soundFactor;

    this.pos.x = Math.cos(t) * this.xRadius;
    this.pos.y = Math.sin(t * this.verticalSpeed) * (this.yRadius + s);
    this.pos.z = Math.sin(t) * this.zRadius;

    this.velocity.x = Math.sin((t + s) * this.maxVelocityX);
    this.velocity.y = Math.cos((t + s) * this.maxVelocityY);
    this.velocity.z = (Math.sin((t + s) * this.maxVelocityX) + Math.cos((t + s) * this.maxVelocityY));

    for (let x = 0; x < this.spawnRate * s; x++) {
      this.spawnParticle();
    }

    this.startTime = t;
    this.mat.uniforms.time.value = t;

    this.geom.attributes.position.needsUpdate = true;
    this.geom.attributes.velocity.needsUpdate = true;
    this.geom.attributes.startTime.needsUpdate = true;
    this.geom.attributes.size.needsUpdate = true;
    this.geom.attributes.life.needsUpdate = true;
  }
}
