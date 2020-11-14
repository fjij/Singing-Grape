let mic, fft, ready=false;
let inputNote="C0", inputLevel=0;
let polySynth;

function setup() {
  let cnv = createCanvas(640, 480);
  inputSetup(cnv);
  outputSetup();
}

function inputSetup(canvas) {
  canvas.mousePressed(() => userStartAudio(null, () => { ready=true; }));
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0, 16384); // No smoothing, max # of bins
  fft.setInput(mic);
}

function outputSetup() {
  polySynth = new p5.PolySynth();
}

function draw() {
  background(220);
  textAlign(CENTER);
  if (ready) {
    text(noteToName(inputNote) + " @ " + inputLevel, width/2, height/2);
  } else {
    text('Click to start!', width/2, height/2);
  }
  handleInput();
  handleOutput();
}

function handleInput() {
  if (!ready) return;
  // Find the most energetic frequency
  fft.analyze();
  let maxEnergy = 0;
  let maxFreq = 0;
  for (let i = 16; i < 1024; i ++) {
    const freq = i;
    const energy = fft.getEnergy(i);
    if (energy > maxEnergy) {
      maxEnergy = energy;
      maxFreq = freq;
    }
  }
  // If a frequency was detected, set out inputNote device to store this
  if (maxFreq > 0) {
    inputNote = freqToMidi(maxFreq);
    inputLevel = maxEnergy / 255;
  } else {
    inputLevel = 0;
  }
}

function noteToName( note ) {
  const names = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
  ]
  return names[note%12] + (Math.floor(note/12) - 1);
}

function handleOutput() {
  if (inputLevel > 0.6) {
    polySynth.play(midiToFreq(inputNote), 0.5, 2, 0.2);
  }
}
