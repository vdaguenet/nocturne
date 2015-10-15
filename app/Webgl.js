import THREE from 'three';
window.THREE = THREE;
import ParticleSphere from './objects/ParticleSphere';
import ParticleSystem from './objects/ParticleSystem';
// import LineScene from './LineScene';
import OrbitControls from 'orbit-controls';
import Mediator from './utils/Mediator';

export default class Webgl {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.scene = new THREE.Scene();

    this.params = {
      postprocessing: true,
      vignette: true,
      noise: true,
      controls: false,
    };

    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    this.camera.position.z = 200;
    this.target = new THREE.Vector3();
    this.camera.lookAt(this.target);

    this.controls = new OrbitControls({
      distance: 200,
    });

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x262626);

    // this.lineScene = new LineScene(width, height, this.renderer);

    this.composer = new WAGNER.Composer(this.renderer, { useRGBA: false });
    this.composer.setSize(width, height);

    this.particleSphere = new ParticleSphere();
    this.particleSphere.position.set(0, 0, 0);
    this.particleSphere.rotation.x = 0.25 * Math.PI;
    this.particleSphere.rotation.z = 0.1 * Math.PI;
    this.scene.add(this.particleSphere);

    this.particleSystem = new ParticleSystem();
    this.particleSystem.position.set(0, 0, 0);
    this.scene.add(this.particleSystem);

    this.initPostprocessing();
    this.resize(width, height);

    this.tick = 0;

    Mediator.emit('webgl:ready');
  }

  initPostprocessing() {
    if (!this.params.postprocessing) { return; }

    // FXAA
    this.fxaaPass = new WAGNER.FXAAPass();
    // Vignette
    this.vignette2Pass = new WAGNER.Vignette2Pass();
    // Noise
    this.noisePass = new WAGNER.NoisePass();
    this.noisePass.params.amout = 0.05;
    this.noisePass.params.speed = 0.2;
    // Blend
    // this.blendPass = new WAGNER.BlendPass();
    // this.blendPass.params.mode = WAGNER.BlendMode.ColorDodge; // Normal, Lighten, Screen, ColorDodge+++,
    // this.blendPass.params.resolution2.x = this.width;
    // this.blendPass.params.resolution2.y = this.height;
    // this.blendPass.params.aspectRatio = this.width / this.height;
    // this.blendPass.params.aspectRatio2 = this.width / this.height;
    // this.blendPass.params.tInput2 = this.lineScene.renderTarget;
  }

  start() {
    this.particleSphere.start();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;

    if (this.params.postprocessing) {
      this.composer.setSize(width, height);
    }

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // this.blendPass.params.resolution2.x = this.width;
    // this.blendPass.params.resolution2.y = this.height;
    // this.blendPass.params.aspectRatio = this.width / this.height;
    // this.blendPass.params.aspectRatio2 = this.width / this.height;

    this.particleSphere.resize(width, height);
    this.particleSystem.resize(width, height);
    // this.lineScene.resize(width, height);
    this.renderer.setSize(width, height);
  }

  render(freq, time) {
    //
    // Get sound data
    //
    const averageFreq = this.average(freq);
    const averageTime = this.average(time);

    //
    // Update all the things
    //
    this.tick += 0.1;
    // if (this.camera.position.z > 200) {
    //   this.transitionIn(600, 200, 0.5 * this.tick, 5);
    // }

    if (this.params.controls) {
      this.updateControls();
    }

    this.particleSphere.update(this.tick, averageFreq);
    this.particleSystem.update(this.tick, averageFreq);

    //
    // Render
    //
    if (this.params.postprocessing) {
      // this.lineScene.render(this.camera, averageFreq);

      this.composer.reset();
      this.composer.render(this.scene, this.camera);
      // this.composer.pass(this.blendPass);
      if (this.params.vignette) { this.composer.pass(this.vignette2Pass); }
      if (this.params.noise) { this.composer.pass(this.noisePass); }
      this.composer.pass(this.fxaaPass);
      this.composer.toScreen();
    } else {
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      // this.renderer.clearDepth();
      // this.renderer.render(this.lineScene.scene, this.camera);
    }
  }

  updateControls() {
    const position = this.camera.position.toArray();
    const direction = this.target.toArray();
    this.controls.update(position, direction);
    this.camera.position.fromArray(position);
    this.camera.lookAt(this.target.fromArray(direction));
  }

  average(data) {
    let sum = 0;
    const l = data.length;

    for (let i = 0; i < l; i++) {
      sum += data[i];
    }

    return sum / l;
  }

  rangeAverage(data, rangeStart, rangeEnd) {
    let sum = 0;

    for (let i = rangeStart; i < rangeEnd; i++) {
      sum += data[i];
    }

    return sum / (rangeEnd - rangeStart);
  }
}