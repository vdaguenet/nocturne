import domready from 'domready';
import Webgl from './Webgl';
import raf from 'raf';
import dat from 'dat-gui';
import SoundAnalyser from './SoundAnalyser';
import Mediator from './utils/Mediator';

let webglReady = false;
let soundReady = false;
let started = false;
let webgl;
let gui;
let soundAnalyser;
let freq = 0;
let time = 0;
let refRaf;
let $play;
let $home;

function resizeHandler() {
  webgl.resize(window.innerWidth, window.innerHeight);
}

function animate() {
  refRaf = raf(animate);

  const analyse = soundAnalyser.analyse();
  if (analyse) {
    freq = analyse.data;
    time = analyse.time;
  }

  webgl.render(freq, time);
}

function start() {
  if (!webglReady || !soundReady || started) { return; }

  console.debug('[App] start');
  started = true;

  soundAnalyser.play();
  webgl.start();
  animate();

  $home.style.opacity = 0;
  $home.style.visibility = 'hidden';
}

function onSoundReady() {
  soundReady = true;
  console.debug('[App] sound ready');

  if (webglReady) {
    $play.innerHTML = 'Start';
  }
}

function onWebglReady() {
  webglReady = true;
  console.debug('[App] webgl ready');

  if (soundReady) {
    $play.innerHTML = 'Start';
  }
}

function end() {
  console.debug('[App] end');
  // raf.cancel(refRaf);
  webgl.end();
}

domready(() => {
  Mediator.once('sound:ready', onSoundReady);
  Mediator.once('sound:end', end);
  Mediator.once('webgl:ready', onWebglReady);

  $play = document.querySelector('#play');
  $play.addEventListener('click', start);

  $home = document.querySelector('.home');
  // webgl settings
  webgl = new Webgl(window.innerWidth, window.innerHeight);
  document.body.appendChild(webgl.renderer.domElement);

  // Sound analyser
  soundAnalyser = new SoundAnalyser('assets/sounds/chopin_nocturne.mp3');

  // GUI settings
  gui = new dat.GUI();
  const fPostProc = gui.addFolder('Postprocessing');
  fPostProc.add(webgl.params, 'postprocessing').name('active');
  fPostProc.add(webgl.params, 'vignette');
  fPostProc.add(webgl.params, 'noise');
  fPostProc.add(webgl.noisePass.params, 'amount').min(0).max(1).name('noise amount');
  fPostProc.add(webgl.noisePass.params, 'speed').min(0).max(1).name('noise speed');
  // fPostProc.add(webgl.lineScene.params, 'bloom');
  // fPostProc.add(webgl.lineScene.bloomPass.params, 'blurAmount');
  // fPostProc.add(webgl.lineScene.bloomPass.params, 'applyZoomBlur');
  // fPostProc.add(webgl.lineScene.bloomPass.params, 'zoomBlurStrength');
  // fPostProc.add(webgl.lineScene.bloomPass.params, 'useTexture');
  const fSystem = gui.addFolder('Particle system');
  fSystem.add(webgl.particleSystem, 'spawnRate');
  fSystem.add(webgl.particleSystem, 'horizontalSpeed').min(0).max(3);
  fSystem.add(webgl.particleSystem, 'verticalSpeed').min(0).max(3);
  fSystem.add(webgl.particleSystem, 'maxVelocityX').min(0).max(3);
  fSystem.add(webgl.particleSystem, 'maxVelocityY').min(0).max(3);
  fSystem.add(webgl.particleSystem, 'xRadius').min(40).max(200);
  fSystem.add(webgl.particleSystem, 'yRadius').min(40).max(200);
  fSystem.add(webgl.particleSystem, 'zRadius').min(40).max(200);
  const fSound = gui.addFolder('Sound');
  fSound.add(soundAnalyser.gainNode.gain, 'value', 0, 20).name('volume');
  gui.add(webgl.params, 'controls');
  gui.close();

  // handle resize
  window.addEventListener('resize', resizeHandler);
});
