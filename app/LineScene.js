import THREE from 'three';
import Line from './objects/Line';

export default class LineScene {
  constructor(width, height, renderer) {
    this.width = width;
    this.height = height;

    this.scene = new THREE.Scene();

    this.params = {
      bloom: true,
    };

    this.renderer = renderer;
    this.composer = new WAGNER.Composer(this.renderer, { useRGBA: false });
    this.composer.setSize(width, height);

    this.renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: true,
    });

    this.line1 = new Line();
    this.line1.position.set(0, -10, 0);

    this.line2 = new Line();
    this.line2.line.scale.set(2, 2, 2);
    this.line2.line.position.set(-25, 0, 40);
    this.line2.position.set(0, 20, 0);

    this.lineContainer = new THREE.Object3D();
    this.lineContainer.add(this.line1);
    this.lineContainer.add(this.line2);

    this.lineContainer.rotation.x = 0.25 * Math.PI;
    this.lineContainer.rotation.z = 0.1 * Math.PI;
    this.scene.add(this.lineContainer);

    this.composer;
    this.renderer;

    this.init();
  }

  resize(width, height) {
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }

  init() {
    this.fxaaPass = new WAGNER.FXAAPass();

    this.bloomPass = new WAGNER.MultiPassBloomPass();
    this.bloomPass.params.blurAmount = 1;
    this.bloomPass.params.applyZoomBlur = false;
    this.bloomPass.params.zoomBlurStrength = 0.2;
    this.bloomPass.params.useTexture = true;
  }

  render(camera) {
    this.line1.rotation.y += 0.08;
    this.line2.rotation.y -= 0.12;

    this.composer.reset();
    this.composer.renderer.clear();
    this.composer.render(this.scene, camera);
    this.composer.pass(this.fxaaPass);
    if (this.params.bloom) { this.composer.pass(this.bloomPass); }
    this.composer.toTexture(this.renderTarget);
  }
}