let mic, fft, ready=false;
let inputNote="C0", inputLevel=0;
let polySynth;

function setup() {
  let cnv = createCanvas(640, 640);
  inputSetup(cnv);
  outputSetup();
}

function inputSetup(canvas) {
  canvas.mousePressed(() => {
    userStartAudio(null, () => { ready=true; })
    if (ready) {
      if (blobIdx == 0) {
        blobIdx = 1;
        blobMessage = [ 'Hello!', 3.0 ];
      } else {
        blobIdx = 0;
        blobMessage = [ 'Hiya.', 3.0 ];
      }
    }
  });
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0, 16384); // No smoothing, max # of bins
  fft.setInput(mic);
}

function outputSetup() {
  polySynth = new p5.PolySynth();
}

function draw() {
  background('#c37fc7');
  fill('#3e2540');
  textAlign(CENTER);
  textFont('Sans', 60);
  text('Singing Grape!', width/2, 80);
  textFont('Sans', 48);
  if (ready) {
    //text(noteToName(inputNote) + " @ " + inputLevel, width/2, height/2);
    drawBlob();
    fill('#3e2540');
    textFont('Sans', 20);
    text('Click to change singer', width/2, height-80);
  } else {
    text('Click here to start!', width/2, height/2);
  }
  handleInput();
  handleOutput();
}

let blobTime = 0;
let blobVolume = 0;
let blobIdx = 1;
let blobVersions = [
  {
    c1: '#442ebf',
    c2: '#120363',
    eye: [40, 40, 30, 20],
    mouth: [70, 15, 10],
    ofs: 0,
  },
  {
    c1: '#e3a909',
    c2: '#9e7606',
    eye: [50, -10, 20, 40],
    mouth: [40, 20, 40],
    ofs: 12,
  },
];
let blobMessage = [ 'Hello!', 3.0 ];
function drawBlob() {
  blobTime += deltaTime*0.001;
  breath = Math.sin(blobTime);
  if (blobVolume > 0) {
    blobVolume -= deltaTime*0.001;
  } else { blobVolume = 0; }
  vibration = blobVolume * Math.sin(blobTime*20);
  let x = width/2 + vibration;
  let y = height/2 + breath*5;
  let b = blobVersions[blobIdx];
  let mouth = b.mouth[1] + b.mouth[2] * blobVolume;
  fill(b.c1);
  strokeWeight(0);
  ellipse(x, y, 180, 200);
  fill(b.c2);
  ellipse(x-b.eye[0], y+b.eye[1], b.eye[2], b.eye[3]);
  ellipse(x+b.eye[0], y+b.eye[1], b.eye[2], b.eye[3]);
  ellipse(x, y+b.mouth[0], mouth, mouth);
  if (blobMessage[1] > 0) {
    fill(62, 37, 64, 255 * blobMessage[1]);
    textFont('Sans', 30);
    text(blobMessage[0], width/2, y - 120);
  }
  blobMessage[1] -= deltaTime*0.001;
}
let messageIdx = [0, 0];
let messages = [
  [
    'La la la...',
    'I\'m trying my best!',
    'Oo oo oo...',
    'Lo lo lo...',
    'Aaaa....',
    'Hmmmm....',
  ],
  [
    'Dum dum dum...',
    'Dee dee dee...',
    'Hi ho, hi ho...',
    'Da da da....',
    '...do I sound okay?',
  ]
]
function blobTalk() {
  if (blobMessage[1] > -4) return;
  blobMessage = [messages[blobIdx][messageIdx[blobIdx]], 3.0];
  messageIdx[blobIdx]++;
  if (messageIdx[blobIdx] >= messages[blobIdx].length) {
    messageIdx[blobIdx] = 0;
  }
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
function getOctave( note ) {
  return (Math.floor(note/12) - 1);
}

function handleOutput() {
  if (inputLevel > 0.6 && getOctave(inputNote) > 1) {
    const note = inputNote;
    setTimeout(() => {
      const ofs = blobVersions[blobIdx].ofs;
      polySynth.play(midiToFreq(note + ofs), 0.5, 0, 0.2);
      blobVolume = 1;
      blobTalk();
    }, 2000);
  }
}
