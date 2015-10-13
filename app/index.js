import domready from 'domready';
import Webgl from './Webgl';
import raf from 'raf';
import dat from 'dat-gui';
import SoundAnalyser from './SoundAnalyser';
import Mediator from './utils/Mediator';

let webgl;
let gui;
let soundAnalyser;
let soundData;

function resizeHandler() {
  webgl.resize(window.innerWidth, window.innerHeight);
}

function animate() {
  raf(animate);

  soundData = soundAnalyser.analyse();
  webgl.render(soundData);
}

function start() {
  soundAnalyser.play();
  animate();
  console.log('ANIMATE');
}

domready(() => {
  // Sound analyser
  soundAnalyser = new SoundAnalyser('../assets/sounds/chopin_nocturne.mp3');
  Mediator.once('sound:ready', start);

  // webgl settings
  webgl = new Webgl(window.innerWidth, window.innerHeight);
  document.body.appendChild(webgl.renderer.domElement);

  // GUI settings
  gui = new dat.GUI();
  const fPostProc = gui.addFolder('Postprocessing');
  fPostProc.add(webgl.params, 'postprocessing').name('active');
  fPostProc.add(webgl.params, 'vignette');
  fPostProc.add(webgl.params, 'noise');
  fPostProc.add(webgl.noisePass.params, 'amount').name('noise amount');
  fPostProc.add(webgl.noisePass.params, 'speed').name('noise speed');
  fPostProc.add(webgl.lineScene.params, 'bloom');
  fPostProc.add(webgl.lineScene.bloomPass.params, 'blurAmount');
  fPostProc.add(webgl.lineScene.bloomPass.params, 'applyZoomBlur');
  fPostProc.add(webgl.lineScene.bloomPass.params, 'zoomBlurStrength');
  fPostProc.add(webgl.lineScene.bloomPass.params, 'useTexture');
  const fSound = gui.addFolder('Sound');
  fSound.add(soundAnalyser.gainNode.gain, 'value', 0, 20).name('volume');

  // handle resize
  window.onresize = resizeHandler;
});
