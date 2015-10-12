import Particles from './objects/Particles';
import Line from './objects/Line';
import THREE from 'three';
import WAGNER from '@superguigui/wagner';
import FXAAPass from '@superguigui/wagner/src/passes/fxaa/FXAAPass';
import BloomPass from '@superguigui/wagner/src/passes/bloom/MultiPassBloomPass';
import OrbitControls from 'orbit-controls';

export default class Webgl {
  constructor(width, height) {
    this.scene = new THREE.Scene();

    this.params = {
      postprocessing: true,
    };

    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    this.camera.position.z = 200;
    this.target = new THREE.Vector3();
    this.camera.lookAt(this.target);

    this.controls = new OrbitControls({
      distance: 200,
    });

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x262626);

    this.composer = new WAGNER.Composer(this.renderer);
    this.composer.setSize(width, height);

    this.container = new THREE.Object3D();

    this.particles = new Particles();
    this.particles.position.set(0, 0, 0);
    this.container.add(this.particles);

    this.line1 = new Line();
    this.line1.position.set(0, -10, 0);
    this.container.add(this.line1);

    this.line2 = new Line();
    this.line2.line.scale.set(2, 2, 2);
    this.line2.line.position.set(-25, 0, 40);
    this.line2.position.set(0, 20, 0);
    this.container.add(this.line2);

    this.container.rotation.x = 0.25 * Math.PI;
    this.container.rotation.z = 0.1 * Math.PI;
    this.scene.add(this.container);

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

    this.particles.resize(width, height);

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

    this.updateControls();

    let factor = this.average(soundData);

    // let highAverage = this.rangeAverage(soundData, 0, 150);
    // if (highAverage > 100) {
    //   console.log('AIGUE', highAverage);
    // }

    this.time += 0.1;
    this.particles.update(this.time, factor);
    this.line1.rotation.y += 0.08;
    this.line2.rotation.y -= 0.12;
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