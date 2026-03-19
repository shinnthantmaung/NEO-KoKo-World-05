const TUNER_NOTES = {
    practical_guitar: [
        { name: "E2", freq: 82.41 },
        { name: "A2", freq: 110.00 },
        { name: "D3", freq: 146.83 },
        { name: "G3", freq: 196.00 },
        { name: "B3", freq: 246.94 },
        { name: "E4", freq: 329.63 },
        { name: "D2", freq: 73.42 }
    ],
    kalimba: [
        { name: "C4", freq: 261.63 },
        { name: "D4", freq: 293.66 },
        { name: "E4", freq: 329.63 },
        { name: "F4", freq: 349.23 },
        { name: "G4", freq: 392.00 },
        { name: "A4", freq: 440.00 },
        { name: "B4", freq: 493.88 },
        { name: "C5", freq: 523.25 },
        { name: "D5", freq: 587.33 },
        { name: "E5", freq: 659.25 },
        { name: "F5", freq: 698.46 },
        { name: "G5", freq: 783.99 },
        { name: "A5", freq: 880.00 },
        { name: "B5", freq: 987.77 },
        { name: "C6", freq: 1046.50 },
        { name: "D6", freq: 1174.66 },
        { name: "E6", freq: 1318.51 }
    ]
};

let audioContext = null;
let currentInstrument = "practical_guitar";
let isAutoPlaying = false;
let autoPlayInterval = null;
let analyser = null;
let micStream = null;
let isMicActive = false;
let pitchUpdateFrame = null;

// Ensure audio context starts on user interaction
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function playNoteFreq(freq, type = 'sine') {
    initAudio();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    
    // Envelope to make it cute
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2.0);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 2.0);
}

function stopAutoPlay() {
    isAutoPlaying = false;
    clearInterval(autoPlayInterval);
    document.getElementById("btn-autoplay").innerText = "▶ Auto Play All";
}

function toggleAutoPlay() {
    if (isAutoPlaying) {
        stopAutoPlay();
        return;
    }
    
    stopMic(); // Turn off mic if auto playing
    initAudio();
    isAutoPlaying = true;
    document.getElementById("btn-autoplay").innerText = "⏹ Stop Auto";
    
    const notes = TUNER_NOTES[currentInstrument];
    let idx = 0;
    
    const playNext = () => {
        if (!isAutoPlaying) return;
        const note = notes[idx];
        
        // Visual feedback
        updateTunerDisplay(`Playing ${note.name}`, "perfect");
        document.querySelectorAll(".tuner-note-btn").forEach(b => b.classList.remove("active"));
        const btn = Array.from(document.querySelectorAll(".tuner-note-btn")).find(b => b.innerText.includes(note.name));
        if (btn) btn.classList.add("active");
        
        // Audio
        let type = currentInstrument === "practical_guitar" ? "triangle" : "sine";
        playNoteFreq(note.freq, type);
        
        idx++;
        if (idx >= notes.length) idx = 0; // loop
    };
    
    playNext();
    autoPlayInterval = setInterval(playNext, 2500);
}

function playSingleNote(noteName, freq) {
    stopAutoPlay();
    stopMic(); // Switch to manual playback
    
    let type = currentInstrument === "practical_guitar" ? "triangle" : "sine";
    playNoteFreq(freq, type);
    
    updateTunerDisplay(`Playing ${noteName}`, "perfect");
    
    document.querySelectorAll(".tuner-note-btn").forEach(b => b.classList.remove("active"));
    const btn = Array.from(document.querySelectorAll(".tuner-note-btn")).find(b => b.innerText.includes(noteName));
    if (btn) btn.classList.add("active");
}

function renderInstrumentNotes(instrument) {
    currentInstrument = instrument;
    stopAutoPlay();
    stopMic();
    
    if(document.getElementById("tuner-practical_guitar-btn")) document.getElementById("tuner-practical_guitar-btn").classList.remove("active-tab");
    document.getElementById("tuner-kalimba-btn").classList.remove("active-tab");
    if(document.getElementById(`tuner-${instrument}-btn`)) document.getElementById(`tuner-${instrument}-btn`).classList.add("active-tab");
    
    const container = document.getElementById("tuner-notes-container");
    container.innerHTML = "";
    
    if (instrument === "practical_guitar") {
        container.style.gridTemplateColumns = "repeat(3, 1fr)";
    } else {
        container.style.gridTemplateColumns = "repeat(4, 1fr)";
    }
    
    TUNER_NOTES[instrument].forEach(n => {
        const btn = document.createElement("button");
        btn.className = "tuner-note-btn";
        btn.innerText = n.name;
        btn.onclick = () => playSingleNote(n.name, n.freq);
        container.appendChild(btn);
    });
    
    updateTunerDisplay("Ready to tune! 🎵", "normal");
}

// ====== MIC PITCH DETECTION ======
async function toggleMic() {
    if (isMicActive) {
        stopMic();
        return;
    }
    
    stopAutoPlay();
    initAudio();
    
    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        isMicActive = true;
        document.getElementById("btn-tuner-mic").innerText = "🎤 Stop Mic";
        document.getElementById("btn-tuner-mic").classList.add("active-mic");
        
        const source = audioContext.createMediaStreamSource(micStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        
        document.getElementById("tuner-meter-container").style.display = "block";
        updateTunerDisplay("Listening...", "normal");
        updatePitch();
    } catch (err) {
        alert("Microphone access denied or not supported. 🥺");
        console.error(err);
    }
}

function stopMic() {
    isMicActive = false;
    if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
        micStream = null;
    }
    if (pitchUpdateFrame) cancelAnimationFrame(pitchUpdateFrame);
    
    const micBtn = document.getElementById("btn-tuner-mic");
    if(micBtn) {
        micBtn.innerText = "🎤 Auto Detect Pitch";
        micBtn.classList.remove("active-mic");
    }
    document.querySelectorAll(".tuner-note-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("tuner-meter-container").style.display = "none";
    updateTunerDisplay("Ready to tune! 🎵", "normal");
}

function updatePitch() {
    if (!isMicActive) return;
    
    const buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);
    
    const ac = autoCorrelate(buf, audioContext.sampleRate);
    if (ac !== -1) {
        processDetectedFrequency(ac);
    } else {
        updateTunerDisplay("Listening...", "normal", "🦆🪕", 0);
    }
    
    pitchUpdateFrame = requestAnimationFrame(updatePitch);
}

function autoCorrelate(buf, sampleRate) {
    let SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
        let val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++)
        if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++)
        if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++)
        for (let j = 0; j < SIZE - i; j++)
            c[i] = c[i] + buf[j] * buf[j + i];

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    let T0 = maxpos;
    let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);
    return sampleRate / T0;
}

function processDetectedFrequency(freq) {
    const notes = TUNER_NOTES[currentInstrument];
    if (!notes) return;
    
    let closestNote = notes[0];
    let minDiffCents = Math.abs(1200 * Math.log2(freq / notes[0].freq));
    for (let i = 1; i < notes.length; i++) {
        let diffCents = Math.abs(1200 * Math.log2(freq / notes[i].freq));
        if (diffCents < minDiffCents) {
            minDiffCents = diffCents;
            closestNote = notes[i];
        }
    }
    
    const cents = 1200 * Math.log2(freq / closestNote.freq);
    
    let statusPhrase = "";
    let state = "normal";
    
    if (Math.abs(cents) <= 2) {
        statusPhrase = `Perfect bae 😘`;
        state = "perfect";
    } else if (cents > 2 && cents <= 15) {
        statusPhrase = `Almost there (high) 😤`;
        state = "high";
    } else if (cents > 15) {
        statusPhrase = `Too high 😡`;
        state = "high";
    } else if (cents < -2 && cents >= -15) {
        statusPhrase = `Almost there (low) 😤`;
        state = "low";
    } else {
        statusPhrase = `Too low 😤`;
        state = "low";
    }
    
    updateTunerDisplay(statusPhrase, state, closestNote.name, cents);
    
    document.querySelectorAll(".tuner-note-btn").forEach(b => b.classList.remove("active"));
    const btn = Array.from(document.querySelectorAll(".tuner-note-btn")).find(b => b.innerText.trim() === closestNote.name);
    if (btn) btn.classList.add("active");
}

function updateTunerDisplay(text, state, noteName = "🦆🪕", cents = 0) {
    const statusText = document.getElementById("tuner-status-text");
    const reaction = document.getElementById("tuner-reaction");
    const needle = document.getElementById("tuner-needle");
    
    statusText.innerText = text;
    statusText.className = ""; // reset
    
    if (noteName !== "🦆🪕") {
        reaction.innerText = noteName;
    } else {
        reaction.innerText = "🦆🪕";
    }
    
    if (needle) {
        let displayCents = Math.max(-50, Math.min(50, cents));
        let percent = ((displayCents + 50) / 100) * 100;
        needle.style.left = `${percent}%`;
        
        if (state === "perfect") {
            needle.style.backgroundColor = "#2e6627";
        } else if (state === "low") {
            needle.style.backgroundColor = "#8a6c4c";
        } else if (state === "high") {
            needle.style.backgroundColor = "#a32a3d";
        } else {
            needle.style.backgroundColor = "#a32a3d";
            needle.style.left = "50%";
        }
    }
    
    if (state === "perfect") {
        statusText.style.color = "#2e6627";
        reaction.style.color = "#2e6627";
        reaction.style.animation = "pulseFloat 1s infinite";
    } else if (state === "low") {
        statusText.style.color = "#8a6c4c"; 
        reaction.style.color = "#ff6b81";
        reaction.style.animation = "none";
    } else if (state === "high") {
        statusText.style.color = "#a32a3d";
        reaction.style.color = "#ff6b81";
        reaction.style.animation = "none";
    } else {
        statusText.style.color = "var(--color-primary-dark)";
        reaction.style.color = "#ff6b81";
        reaction.style.animation = "none";
    }
}

// Auto init on page load if needed, but best hooked in main logic
window.addEventListener('DOMContentLoaded', () => {
    // Initial setup if we navigate to it later
});
