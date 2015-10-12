import bindAll from 'lodash.bindAll';
import Mediator from './utils/Mediator';

export default class SoundAnalyser {
  constructor(filePath) {
    bindAll(this, 'onDecode', 'onError');

    this.context = new AudioContext();
    this.audioBuffer;

    this.source = this.context.createBufferSource();
    this.analyser = this.context.createAnalyser();
    this.freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.fftSize = 2048;

    this.gainNode = this.context.createGain();
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.context.destination);

    this.gainNode.gain.value = 5;

    this.loadAudioBuffer(filePath);
  }

  loadAudioBuffer(url) {
    // Load asynchronously
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = () => {
      this.context.decodeAudioData(request.response, this.onDecode, this.onError);
    };
    request.send();
  }

  onDecode(buffer) {
    this.audioBuffer = buffer;
    this.source.buffer = buffer;

    Mediator.emit('sound:ready');
  }

  onError() {
    console.error('Error decoding audio');
  }

  play() {
    this.source.start(0.0);
  }

  analyse() {
    this.analyser.smoothingTimeConstant = 0.1;
    this.analyser.getByteFrequencyData(this.freqByteData);

    return this.freqByteData;
  }
}