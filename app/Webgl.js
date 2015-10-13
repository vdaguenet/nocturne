import THREE from 'three';
window.THREE = THREE;
import Particles from './objects/Particles';
import LineScene from './LineScene';
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
    this.renderer.setClearColor(0x181818);

    this.lineScene = new LineScene(width, height, this.renderer);

    this.composer = new WAGNER.Composer(this.renderer, { useRGBA: false });
    this.composer.setSize(width, height);

    this.particles = new Particles();
    this.particles.position.set(0, 0, 0);
    this.particles.rotation.x = 0.25 * Math.PI;
    this.particles.rotation.z = 0.1 * Math.PI;
    this.scene.add(this.particles);

    this.initPostprocessing();
    this.resize(width, height);

    this.time = 0;

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
    this.blendPass = new WAGNER.BlendPass();
    this.blendPass.params.mode = WAGNER.BlendMode.ColorDodge; // Normal, Lighten, Screen, ColorDodge+++,
    this.blendPass.params.resolution2.x = this.width;
    this.blendPass.params.resolution2.y = this.height;
    this.blendPass.params.aspectRatio = this.width / this.height;
    this.blendPass.params.aspectRatio2 = this.width / this.height;
    this.blendPass.params.tInput2 = this.lineScene.renderTarget;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;

    if (this.params.postprocessing) {
      this.composer.setSize(width, height);
    }

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.blendPass.params.resolution2.x = this.width;
    this.blendPass.params.resolution2.y = this.height;
    this.blendPass.params.aspectRatio = this.width / this.height;
    this.blendPass.params.aspectRatio2 = this.width / this.height;

    this.particles.resize(width, height);
    this.renderer.setSize(width, height);
    this.lineScene.resize(width, height);
  }

  render(freq, time) {
    const averageFreq = this.average(freq);
    const averageTime = this.average(time);

    if (this.params.controls) {
      this.updateControls();
    } else {
      // TODO: Rotate all the scene slowly.
    }

    this.time += 0.1;
    this.particles.update(this.time, averageFreq);


    if (this.params.postprocessing) {
      this.lineScene.render(this.camera, averageFreq);

      this.composer.reset();
      this.composer.render(this.scene, this.camera);
      this.composer.pass(this.blendPass);
      if (this.params.vignette) { this.composer.pass(this.vignette2Pass); }
      if (this.params.noise) { this.composer.pass(this.noisePass); }
      this.composer.pass(this.fxaaPass);
      this.composer.toScreen();
    } else {
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      this.renderer.clearDepth();
      this.renderer.render(this.lineScene.scene, this.camera);
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