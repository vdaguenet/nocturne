import Sphere from './objects/Sphere';
import THREE from 'three';
import WAGNER from '@superguigui/wagner';
import FXAAPass from '@superguigui/wagner/src/passes/fxaa/FXAAPass';
import BloomPass from '@superguigui/wagner/src/passes/bloom/MultiPassBloomPass';

export default class Webgl {
  constructor(width, height) {
    this.scene = new THREE.Scene();

    this.params = {
      postprocessing: true,
    };

    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    this.camera.position.z = 100;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xEAFDE6);

    this.composer = new WAGNER.Composer(this.renderer);
    this.composer.setSize(width, height);

    this.sphere = new Sphere();
    this.sphere.position.set(0, 0, 0);
    this.scene.add(this.sphere);

    this.resize(width, height);
    this.initPostprocessing();

    this.time = 0;
  }

  initPostprocessing() {
    if (!this.params.postprocessing) { return; }

    this.fxaaPass = new FXAAPass();
    this.bloomPass = new BloomPass({
      blurAmount: 2,
      applyZoomBlur: true,
    });
  }

  resize(width, height) {
    if (this.params.postprocessing) {
      this.composer.setSize(width, height);
    }

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.sphere.resize(width, height);

    this.renderer.setSize(width, height);
  }

  render(soundData) {
    if (this.params.postprocessings) {
      this.composer.reset();
      this.composer.renderer.clear();
      this.composer.render(this.scene, this.camera);
      this.composer.pass(this.fxaaPass);
      this.composer.pass(this.bloomPass);
      this.composer.toScreen();
    } else {
      this.renderer.autoClear = false;
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    }

    let factor = this.average(soundData);

    let highAverage = this.rangeAverage(soundData, 0, 150);
    if (highAverage > 100) {
      console.log('AIGUE', highAverage);
    }

    this.time += 0.1;
    this.sphere.update(this.time, factor);
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