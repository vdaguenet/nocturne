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
  gui.add(webgl.params, 'postprocessing');

  // handle resize
  window.onresize = resizeHandler;
});
