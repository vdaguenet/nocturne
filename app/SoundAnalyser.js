import bindAll from 'lodash.bindAll';
import Mediator from './utils/Mediator';

export default class SoundAnalyser {
  constructor(filePath) {
    bindAll(this, 'onDecode', 'onError');

    this.context = new AudioContext();
    this.audioBuffer;

    this.source = this.context.createBufferSource();
    this.duration = 0;
    this.analyser = this.context.createAnalyser();
    this.freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
    this.dataTimeArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.fftSize = 2048;

    this.gainNode = this.context.createGain();
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.context.destination);

    this.gainNode.gain.value = 0;//5;

    this.start = 0;

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
    this.duration = this.audioBuffer.duration;
    this.start = Date.now();
  }

  analyse() {
    this.analyser.smoothingTimeConstant = 0.1;
    this.analyser.getByteFrequencyData(this.freqByteData);
    this.analyser.getByteTimeDomainData(this.dataTimeArray);

    if(this.context.currentTime >= this.duration) {
      Mediator.emit('sound:end');
      return;
    }

    return {
      data: this.freqByteData,
      time: this.dataTimeArray,
    };
  }
}