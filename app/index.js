import domready from 'domready';
import Webgl from './Webgl';
import raf from 'raf';
import dat from 'dat-gui';
import SoundAnalyser from './SoundAnalyser';
import Mediator from './utils/Mediator';

let webgl;
let gui;
let soundAnalyser;
let freq;
let time;
let webglReady = false;
let soundReady = false;
let refRaf;

function resizeHandler() {
  webgl.resize(window.innerWidth, window.innerHeight);
}

function animate() {
  refRaf = raf(animate);

  const analyse = soundAnalyser.analyse();
  freq = analyse.data;
  time = analyse.time;

  webgl.render(freq, time);
}

function start() {
  console.debug('[App] start');
  soundAnalyser.play();
  animate();
}

function onSoundReady() {
  soundReady = true;
  console.debug('[App] sound ready');

  if (webglReady) {
    start();
  }
}

function onWebglReady() {
  webglReady = true;
  console.debug('[App] webgl ready');

  if (soundReady) {
    start();
  }
}

function end() {
  console.debug('[App] end');
  raf.cancel(refRaf);
}

domready(() => {
  Mediator.once('sound:ready', onSoundReady);
  Mediator.once('sound:end', end);
  Mediator.once('webgl:ready', onWebglReady);

  // Sound analyser
  soundAnalyser = new SoundAnalyser('../assets/sounds/chopin_nocturne.mp3');

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
  gui.add(webgl.params, 'controls');

  // handle resize
  window.onresize = resizeHandler;
});
