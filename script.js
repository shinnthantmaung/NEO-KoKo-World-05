const CONFIG = {
    name: "Baby",
    startDate: "2019-12-12T00:00:00", // Start date of relationship
    anniversary: "12-12", // MM-DD
    birthday: "06-06",   // MM-DD
};

// Array of messages logic
const baseMessages = [
    "I love the way you smile.", "You make my world so much brighter.", "Every day with you is a gift.",
    "I'm so lucky to have you.", "You are my sunshine, even on cloudy days.", "Thinking about you always makes me smile.",
    "I love you more than words can say.", "You're the best thing that ever happened to me.", "I can't wait to see you again.",
    "You are my favorite notification.", "Whenever I see your name pop up, my heart skips a beat.", "Your voice is my favorite sound.",
    "I fall in love with you more every single day.", "You're not just my girlfriend, you're my best friend.",
    "I love how we can talk about anything and everything.", "You look beautiful today.", "You're the dream I never want to wake up from.",
    "No one else compares to you.", "You make my heart melt.", "Thank you for being you.",
];
const dailyMessages = [];
for (let i = 0; i < 365; i++) {
    const msg = baseMessages[i % baseMessages.length];
    dailyMessages.push(`${msg} (Day ${i+1} 💕)`);
}

const missYouMessages = [
    "I miss your hugs 🥺", "Wish you were here right now ❤️", "Counting down the minutes until I see you! ⏳",
    "Just looking at your pictures and missing you 🥰", "Sending a virtual kiss your way! 😘",
];

const sessionOffset = Math.floor(Math.random() * 50);

const duckSayings = [
    "Quack! I love you!", "You're cute! Quack!", "Give me bread?", "Quack around and find out... how much he loves you!", "Waddle waddle 💕",
];

// ====== SOUND EFFECTS ======
function ensureAudioContext() {
    if (typeof initAudio === 'function') initAudio();
    return window.audioContext;
}

function playNotificationSound() {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    let t = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t); 
    osc.frequency.setValueAtTime(1318.5, t + 0.1); 
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
    gain.gain.setValueAtTime(0.3, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    
    osc.start(t);
    osc.stop(t + 0.3);
}

function createNoiseBuffer(ctx, duration) {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

function playMoodSound(mood) {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    let t = ctx.currentTime;
    
    if (mood === 'sad') {
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = createNoiseBuffer(ctx, 1.2);
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(800, t);
        noiseFilter.frequency.linearRampToValueAtTime(300, t + 1.0);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, t);
        noiseGain.gain.linearRampToValueAtTime(0.2, t + 0.2);
        noiseGain.gain.linearRampToValueAtTime(0, t + 1.2);
        noiseSource.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
        noiseSource.start(t);
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + 1.0);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.2);
        gain.gain.linearRampToValueAtTime(0, t + 1.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.2);
        
    } else if (mood === 'angry') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.linearRampToValueAtTime(1500, t + 0.1);
        osc.frequency.linearRampToValueAtTime(1200, t + 0.8);
        
        const lfo = ctx.createOscillator();
        lfo.type = 'square';
        lfo.frequency.value = 50; 
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 200;
        lfo.connect(lfoGain).connect(osc.frequency);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
        osc.connect(gain).connect(ctx.destination);
        
        osc.start(t); osc.stop(t+0.8);
        lfo.start(t); lfo.stop(t+0.8);
        
    } else if (mood === 'sleepy') {
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = createNoiseBuffer(ctx, 2.0);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, t);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.8); 
        gain.gain.linearRampToValueAtTime(0.05, t + 1.0); 
        gain.gain.linearRampToValueAtTime(0.2, t + 1.2); 
        gain.gain.linearRampToValueAtTime(0, t + 2.0);
        
        noiseSource.connect(filter).connect(gain).connect(ctx.destination);
        noiseSource.start(t);
        
    } else if (mood === 'happy') {
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = createNoiseBuffer(ctx, 1.5);
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(500, t);
        noiseFilter.frequency.exponentialRampToValueAtTime(2000, t + 1);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, t);
        noiseGain.gain.linearRampToValueAtTime(0.3, t + 0.5);
        noiseGain.gain.linearRampToValueAtTime(0, t + 1.5);
        noiseSource.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
        noiseSource.start(t);
        
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.1, t + 0.1 + idx*0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
            osc.connect(gain).connect(ctx.destination);
            osc.start(t); osc.stop(t+1.5);
        });
        
    } else if (mood === 'stressed') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.linearRampToValueAtTime(60, t + 0.6);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, t);
        filter.frequency.linearRampToValueAtTime(100, t + 0.6);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
        gain.gain.linearRampToValueAtTime(0, t + 0.6);
        
        osc.connect(filter).connect(gain).connect(ctx.destination);
        osc.start(t); osc.stop(t+0.6);
        
    } else if (mood === 'hungry') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, t);
        osc.frequency.linearRampToValueAtTime(40, t + 1.0);
        
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(15, t); 
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 100;
        lfo.connect(lfoGain).connect(osc.frequency);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.2);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.5);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.7);
        gain.gain.linearRampToValueAtTime(0, t + 1.0);
        
        osc.connect(filter).connect(gain).connect(ctx.destination);
        osc.start(t); osc.stop(t+1.0);
        lfo.start(t); lfo.stop(t+1.0);
    }
}

function playFeedSound() {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    let t = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.start(t);
    osc.stop(t + 0.1);
}

function playMagicSparkle(isUserGesture = false) {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    if (window.hasPlayedSparkle) return;
    
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
    
    let t = ctx.currentTime;
    const notes = [2093.0, 2637.02, 3135.96, 4186.01]; 
    for (let i = 0; i < notes.length; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(notes[i], t + i * 0.06);
        
        gain.gain.setValueAtTime(0, t + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.08, t + i * 0.06 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.4);
        
        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.4);
    }
    
    setTimeout(() => {
        if (ctx.state === 'running' || isUserGesture) {
            window.hasPlayedSparkle = true;
        }
    }, 50);
}

// ====== INITIALIZATION ======
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("user-name").innerText = CONFIG.name;
    updateDayCounter();
    setInterval(updateDayCounter, 1000);
    setupFloatingHearts();
    
    setTimeout(() => playMagicSparkle(false), 300);
    document.body.addEventListener('click', () => playMagicSparkle(true));
    document.body.addEventListener('touchstart', () => playMagicSparkle(true), { passive: true });
    
    document.addEventListener("click", createSparkle);
    
    const mascot = document.querySelector(".mascot-duck");
    mascot.addEventListener("click", () => {
        const bubble = document.getElementById("mascot-bubble");
        bubble.innerText = duckSayings[Math.floor(Math.random() * duckSayings.length)];
        bubble.classList.remove("hidden");
        mascot.style.transform = "scale(1.3) rotate(15deg)";
        setTimeout(() => mascot.style.transform = "", 200);
        setTimeout(() => bubble.classList.add("hidden"), 3500);
    });
    
    initGame();
});

// ====== NAVIGATION ======
function navigate(pageId) {
    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
        p.classList.add("hidden");
    });
    
    const target = document.getElementById(pageId);
    target.classList.remove("hidden");
    setTimeout(() => target.classList.add("active"), 10);
    
    if (pageId === 'page-daily') {
        loadDailyMessage();
        playNotificationSound();
    }
    if (pageId === 'page-learn') showLearnHome();
    if (pageId === 'page-tuner') renderInstrumentNotes('practical_guitar');
}

// ====== HOME PAGE ======
function updateDayCounter() {
    const start = new Date(CONFIG.startDate);
    const now = new Date();
    
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    let hours = now.getHours() - start.getHours();
    let minutes = now.getMinutes() - start.getMinutes();
    let seconds = now.getSeconds() - start.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }

    if (days < 0) { 
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate(); 
        months--; 
    }
    if (months < 0) { months += 12; years--; }

    const timeString = `${years} Years, ${months} Months, ${days} Days<br><span style="font-size:1rem; color:#8a7a7a;">${hours}h ${minutes}m ${seconds}s</span>`;
    
    const timeEl = document.getElementById("time-counter");
    if(timeEl) timeEl.innerHTML = timeString;
    
    // total days for daily message logic
    const diffTime = Math.abs(now - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function showMissYou() {
    const msgBox = document.getElementById("miss-you-text");
    msgBox.innerText = missYouMessages[Math.floor(Math.random() * missYouMessages.length)];
    msgBox.classList.remove("hidden");
    
    // reset animation by re-adding class
    msgBox.style.animation = 'none';
    msgBox.offsetHeight; 
    msgBox.style.animation = null;
}

// ====== DAILY MESSAGE ======
function loadDailyMessage() {
    const day = updateDayCounter();
    const today = new Date();
    const mmdd = String(today.getMonth() + 1).padStart(2, '0') + "-" + String(today.getDate()).padStart(2, '0');
    
    let text = "";
    
    if (mmdd === CONFIG.anniversary) {
        text = "Happy Anniversary Baby! 🥂💕 I love you more than everything!";
    } else if (mmdd === CONFIG.birthday) {
        text = "Happy Birthday to my favorite person in the world! 🎂🎉 I love you!";
    } else {
        const msg = baseMessages[day % baseMessages.length];
        text = `${msg}`;
    }
    
    document.getElementById("daily-day-display").innerText = `Day ${day} with you ❤️`;
    typeWriterEffect(text, document.getElementById("daily-message-text"));
}

let typeTimeout;
function typeWriterEffect(text, element) {
    clearTimeout(typeTimeout);
    element.innerHTML = "";
    let i = 0;
    const speed = 40; 
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            typeTimeout = setTimeout(type, speed);
        }
    }
    type();
}

// ====== MOOD GENERATOR ======
function selectMood(mood) {
    const lastUsed = localStorage.getItem("moodLastUsed");
    const now = new Date().getTime();
    
    // 15 min cooldown
    if (lastUsed && now - lastUsed < 900000) { 
        const remaining = Math.ceil((900000 - (now - lastUsed)) / 60000);
        document.querySelector("#mood-cooldown-msg .cooldown-text").innerText = `Wait baby 😤 Come back in ${remaining} mins ❤️`;
        document.getElementById("mood-cooldown-msg").classList.remove("hidden");
        document.getElementById("mood-result").classList.add("hidden");
        
        document.querySelector("#mood-cooldown-msg .cooldown-text").style.animation = 'none';
        document.querySelector("#mood-cooldown-msg .cooldown-text").offsetHeight;
        document.querySelector("#mood-cooldown-msg .cooldown-text").style.animation = null;
        return;
    }
    
    localStorage.setItem("moodLastUsed", now);
    
    const resultBox = document.getElementById("mood-result");
    
    const dbEntry = MOOD_DATA_DB[mood];
    const msgs = dbEntry.messages;
    const msgIndex = (sessionOffset + Math.floor(now / 900000)) % 50;
    const selectedMsg = msgs[msgIndex];
    
    document.getElementById("mood-emoji").innerText = dbEntry.emoji;
    document.getElementById("mood-message").innerText = selectedMsg;
    
    playMoodSound(mood);
    
    document.getElementById("mood-cooldown-msg").classList.add("hidden");
    resultBox.classList.remove("hidden");
    
    // Pop effect
    document.getElementById("mood-emoji").style.animation = 'none';
    document.getElementById("mood-emoji").offsetHeight;
    document.getElementById("mood-emoji").style.animation = null;
}

// ====== DUCK GAME ======
let score = 0;
const gameDuck = document.getElementById("game-duck");
const foodContainer = document.getElementById("food-container");
const gameMessage = document.getElementById("game-message");
const foods = ["🍞", "🥖", "🥐", "🥬", "🌽", "🍎"];

function initGame() {
    score = parseInt(localStorage.getItem("duckScore") || "0");
    document.getElementById("game-score").innerText = score;
    checkRewards(score);
    setInterval(spawnFood, 1500);
}

function spawnFood() {
    if (!document.getElementById("page-game").classList.contains("active")) return;
    if (document.querySelectorAll('.food-item').length > 4) return;
    
    const food = document.createElement("div");
    food.className = "food-item";
    food.innerText = foods[Math.floor(Math.random() * foods.length)];
    
    const area = document.getElementById("game-area");
    const areaRect = area.getBoundingClientRect();
    
    // Spawn randomly in the top 30% of the game area
    const maxX = areaRect.width - 40; // ~ food width
    const xPos = 10 + Math.random() * (maxX - 20);
    
    food.style.left = `${xPos}px`;
    food.style.top = "10px";
    
    makeDraggableAndClickable(food, area);
    foodContainer.appendChild(food);
}

function makeDraggableAndClickable(food, area) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    let justClicked = true;

    food.addEventListener('mousedown', start);
    food.addEventListener('touchstart', start, {passive: false});

    food.onclick = (e) => {
        if (justClicked && document.body.contains(food)) {
            feedDuck(food);
        }
    };

    function start(e) {
        if (e.type === 'touchstart') e.preventDefault();
        isDragging = true;
        justClicked = true;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        initialLeft = food.offsetLeft;
        initialTop = food.offsetTop;

        document.addEventListener('mousemove', move);
        document.addEventListener('touchmove', move, {passive: false});
        document.addEventListener('mouseup', stop);
        document.addEventListener('touchend', stop);
        
        food.style.transition = 'none';
    }

    function move(e) {
        if (!isDragging) return;
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            justClicked = false;
        }

        if (!justClicked) {
            if (e.type === 'touchmove') e.preventDefault();
            
            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;
            
            food.style.left = `${newLeft}px`;
            food.style.top = `${newTop}px`;
            
            checkCollision();
        }
    }

    function stop() {
        isDragging = false;
        document.removeEventListener('mousemove', move);
        document.removeEventListener('touchmove', move);
        document.removeEventListener('mouseup', stop);
        document.removeEventListener('touchend', stop);
        
        if (!justClicked && document.body.contains(food)) {
            food.style.transition = 'top 3s linear';
            // make it slowly fall to bottom
            setTimeout(() => {
                if(document.body.contains(food)) {
                    food.style.top = `${area.clientHeight + 50}px`;
                }
            }, 50);
        }
    }

    function checkCollision() {
        const duckRect = gameDuck.getBoundingClientRect();
        const foodRect = food.getBoundingClientRect();

        // Shrink hitbox slightly for better feel
        if (!(foodRect.right < duckRect.left + 10 || 
              foodRect.left > duckRect.right - 10 || 
              foodRect.bottom < duckRect.top + 10 || 
              foodRect.top > duckRect.bottom - 10)) {
            feedDuck(food);
            stop();
        }
    }
    
    // Auto fall if not dragged
    setTimeout(() => {
        if (!isDragging && document.body.contains(food)) {
            food.style.transition = `top ${3 + Math.random()*2}s linear`;
            food.style.top = `${area.clientHeight + 50}px`;
        }
    }, 100);

    // Remove if it goes out of bounds
    setTimeout(() => {
        if (document.body.contains(food)) {
            food.remove();
        }
    }, 6000);
}

function feedDuck(foodElement) {
    if (!document.body.contains(foodElement)) return;
    foodElement.remove();
    
    playFeedSound();
    
    score++;
    document.getElementById("game-score").innerText = score;
    localStorage.setItem("duckScore", score);
    
    // Duck animation
    gameDuck.innerText = "🦆💖";
    gameDuck.style.transform = "translateX(-50%) scale(1.3) translateY(-10px)";
    setTimeout(() => {
        gameDuck.innerText = "🦆";
        gameDuck.style.transform = "translateX(-50%) scale(1) translateY(0)";
    }, 350);
    
    checkRewards(score);
}

function checkRewards(currentScore) {
    if (currentScore >= 30) {
        showGameMessage("You unlocked the hidden romantic message! 'I will love you forever, no matter what.' 💍💕");
    } else if (currentScore >= 20) {
        showGameMessage("You unlocked a secret message! 'Every moment with you is magic.' ✨");
    } else if (currentScore >= 10) {
        showGameMessage("You win a kiss! 😘 Come collect it!");
    } else {
        gameMessage.classList.add("hidden");
    }
}

function showGameMessage(msg) {
    gameMessage.innerText = msg;
    gameMessage.classList.remove("hidden");
}

// ====== EFFECTS ======
function setupFloatingHearts() {
    const bg = document.getElementById("floating-bg");
    setInterval(() => {
        if (document.querySelectorAll('.float-heart').length > 20) return;
        const heart = document.createElement("div");
        heart.className = "float-heart";
        // White daisies, pink flowers, sparkles
        heart.innerText = ["🌼", "🌸", "💮", "🌺", "✨", "🤍", "🩷"][Math.floor(Math.random() * 7)];
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.animationDuration = `${8 + Math.random() * 10}s`;
        const size = 0.6 + Math.random() * 0.8;
        heart.style.transform = `scale(${size})`;
        // Random horizontal sway
        heart.style.setProperty('--sway', `${-30 + Math.random() * 60}px`);
        bg.appendChild(heart);
        
        setTimeout(() => { if (document.body.contains(heart)) heart.remove() }, 18000);
    }, 600);
}

function createSparkle(e) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = `${e.clientX - 4}px`;
    sparkle.style.top = `${e.clientY - 4}px`;
    document.getElementById("sparkle-container").appendChild(sparkle);
    setTimeout(() => { if (document.body.contains(sparkle)) sparkle.remove() }, 700);
}

// ====== JOKE GENERATOR ======
let jqTypeTimeout;
function tellJoke() {
    const lastUsed = localStorage.getItem("jokeLastUsed");
    const now = new Date().getTime();
    
    // 1 hour cooldown - 3600000 ms
    const cooldownMs = 3600000;
    if (lastUsed && now - lastUsed < cooldownMs) { 
        const remaining = Math.ceil((cooldownMs - (now - lastUsed)) / 60000);
        let timeMsg = "";
        if (remaining >= 60) {
            const h = Math.floor(remaining / 60);
            const m = remaining % 60;
            timeMsg = `${h}h ${m}m`;
        } else {
            timeMsg = `${remaining}m`;
        }
        
        const cdMsgText = document.querySelector("#joke-cooldown-msg .cooldown-text");
        cdMsgText.innerText = `Wait baby 😤 Come back in ${timeMsg} ❤️`;
        document.getElementById("joke-cooldown-msg").classList.remove("hidden");
        document.getElementById("joke-display").classList.add("hidden");
        
        // Shake effect
        cdMsgText.style.animation = 'none';
        cdMsgText.offsetHeight;
        cdMsgText.style.animation = 'shake 0.5s';
        return;
    }
    
    // Check if jokes are loaded
    let jokeStr = "You're illegally cute! 😂 (Jokes array missing)";
    if (typeof NEO_JOKES !== 'undefined' && NEO_JOKES.length > 0) {
        jokeStr = NEO_JOKES[Math.floor(Math.random() * NEO_JOKES.length)];
    }
    
    localStorage.setItem("jokeLastUsed", now);
    
    document.getElementById("joke-cooldown-msg").classList.add("hidden");
    const display = document.getElementById("joke-display");
    display.classList.remove("hidden");
    
    const reaction = document.getElementById("joke-reaction");
    reaction.classList.add("hidden"); 
    
    const textEl = document.getElementById("joke-text");
    textEl.innerHTML = "";
    
    // Typing animation
    clearTimeout(jqTypeTimeout);
    let i = 0;
    const speed = 40; 
    function typeJ() {
        if (i < jokeStr.length) {
            textEl.innerHTML += jokeStr.charAt(i);
            i++;
            jqTypeTimeout = setTimeout(typeJ, speed);
        } else {
            reaction.classList.remove("hidden");
            reaction.style.animation = 'none';
            reaction.offsetHeight; // trigger reflow
            reaction.style.animation = "popIn 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)";
        }
    }
    typeJ();
}

// ====== LEARN WITH ME NEO BABY ======
let currentLanguage = "";
let currentSessionObj = null;
let currentSessionIndex = 0; 
let learnScore = 0;
let learnSession = []; 
let currentQuestionIndex = 0;

function showLearnHome() {
    document.getElementById("learn-home").classList.remove("hidden");
    document.getElementById("learn-map").classList.add("hidden");
    document.getElementById("learn-quiz").classList.add("hidden");
    document.getElementById("learn-result").classList.add("hidden");
    document.getElementById("learn-history").classList.add("hidden");
}

function loadLanguageMap(language) {
    currentLanguage = language;
    document.getElementById("learn-home").classList.add("hidden");
    document.getElementById("learn-result").classList.add("hidden");
    document.getElementById("learn-map").classList.remove("hidden");
    
    // Load progress
    const progressKey = `learn_${language}_progress`;
    let completedLevel = parseInt(localStorage.getItem(progressKey) || "0");
    
    document.getElementById("map-lang-title").innerText = `${language} Journey 📚`;
    document.getElementById("map-progress-text").innerText = `Progress: ${completedLevel}/365`;
    
    const scrollArea = document.getElementById("map-scroll-area");
    scrollArea.innerHTML = "";
    
    const sessions = KOKO_SESSIONS[language];
    
    let lastCompletedNode = null;
    let currentLevelBlock = "";
    
    sessions.forEach((sess, idx) => {
        if (currentLevelBlock !== sess.level) {
            currentLevelBlock = sess.level;
            const lbl = document.createElement("div");
            lbl.style.fontWeight = "bold";
            lbl.style.color = "#ff6b81";
            lbl.style.margin = "1.5rem 0 0.5rem 0";
            lbl.style.fontSize = "1.2rem";
            lbl.innerText = currentLevelBlock;
            scrollArea.appendChild(lbl);
        }
        
        const isCompleted = sess.id <= completedLevel;
        const isUnlocked = sess.id === completedLevel + 1;
        const isLocked = sess.id > completedLevel + 1;
        
        const row = document.createElement("div");
        row.className = "map-node-row";
        
        if (sess.id > 1) {
            const line = document.createElement("div");
            line.className = `map-line ${isCompleted || isUnlocked ? 'completed' : ''}`;
            row.appendChild(line);
        }
        
        const node = document.createElement("div");
        node.className = `map-node ${isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked'}`;
        node.innerText = isCompleted ? "✔" : sess.id;
        
        if (isUnlocked) lastCompletedNode = node; 
        
        node.onclick = () => {
            if (!isLocked) {
                startQuiz(sess);
            } else {
                // Show floating error or alert
                alert("Complete the previous sessions first baby! 💕");
            }
        };
        
        row.appendChild(node);
        scrollArea.appendChild(row);
    });
    
    if (lastCompletedNode) {
        setTimeout(() => {
            scrollArea.scrollTop = lastCompletedNode.offsetTop - 150;
        }, 100);
    }
}

function startQuiz(sessionObj) {
    currentSessionObj = sessionObj;
    learnSession = sessionObj.questions;
    currentQuestionIndex = 0;
    learnScore = 0;
    
    document.getElementById("learn-map").classList.add("hidden");
    document.getElementById("learn-quiz").classList.remove("hidden");
    
    renderLearnQuestion();
}

function renderLearnQuestion() {
    const q = learnSession[currentQuestionIndex];
    const flag = currentLanguage === "Japanese" ? "🇯🇵" : "🇨🇳";
    document.getElementById("learn-lang-label").innerText = `${flag} Session ${currentSessionObj.id}`;
    document.getElementById("learn-progress").innerText = `${currentQuestionIndex + 1}/${learnSession.length}`;
    
    const barFill = document.getElementById("quiz-bar-fill");
    const progressPercent = (currentQuestionIndex / learnSession.length) * 100;
    barFill.style.width = `${progressPercent}%`;
    
    document.getElementById("learn-question").innerText = q.question;
    
    const optionsContainer = document.getElementById("learn-options");
    optionsContainer.innerHTML = "";
    
    const options = [...q.options];
    
    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerText = opt;
        btn.onclick = () => checkLearnAnswer(btn, opt, q.answer);
        optionsContainer.appendChild(btn);
    });
    
    document.getElementById("learn-feedback").classList.add("hidden");
}

function checkLearnAnswer(btn, selected, correct) {
    const optionsBtns = document.querySelectorAll(".option-btn");
    optionsBtns.forEach(b => {
        b.classList.add("disabled");
        if (b.innerText === correct) b.classList.add("correct");
    });
    
    const feedback = document.getElementById("learn-feedback");
    const fbText = document.getElementById("learn-feedback-text");
    feedback.classList.remove("hidden");
    
    if (selected === correct) {
        learnScore++;
        const msgs = ["Good job NEO Baby 😤❤️", "You're so smart 💡", "Perfect cutie! 🥰", "That's exactly right! ✅"];
        fbText.innerText = msgs[Math.floor(Math.random() * msgs.length)];
        fbText.style.color = "#2e6627";
    } else {
        btn.classList.add("wrong");
        const msgs = ["It's okay baby, we learn together 🥺💕", "So close! Try again next time ❤️", "Nice try, don't give up! 🌱"];
        fbText.innerText = msgs[Math.floor(Math.random() * msgs.length)];
        fbText.style.color = "#a32a3d";
    }
    
    const nextBtn = document.getElementById("learn-next-btn");
    if (currentQuestionIndex >= learnSession.length - 1) {
        nextBtn.innerText = "Finish Session →";
    } else {
        nextBtn.innerText = "Next Question →";
    }
}

function nextLearnQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < learnSession.length) {
        renderLearnQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    document.getElementById("quiz-bar-fill").style.width = "100%";
    
    setTimeout(() => {
        document.getElementById("learn-quiz").classList.add("hidden");
        document.getElementById("learn-result").classList.remove("hidden");
        
        document.getElementById("learn-score").innerText = learnScore;
        document.getElementById("learn-total").innerText = learnSession.length;
        
        const header = document.getElementById("learn-result-header");
        const msgEl = document.getElementById("learn-result-msg");
        
        if (learnScore === learnSession.length) {
            header.innerText = "Perfect! 🎉";
            msgEl.innerText = "I'm so proud of you ❤️ You're improving every day!";
        } else if (learnScore >= learnSession.length / 2) {
            header.innerText = "Great Job! 🌟";
            msgEl.innerText = "You're getting so good at this baby! 💖";
        } else {
            header.innerText = "Session Complete! 🫂";
            msgEl.innerText = "It's okay baby, we learn together! 💕";
        }
        
        const progressKey = `learn_${currentLanguage}_progress`;
        let highestCompleted = parseInt(localStorage.getItem(progressKey) || "0");
        
        if (currentSessionObj.id > highestCompleted) {
            localStorage.setItem(progressKey, currentSessionObj.id);
        }
        
        let history = JSON.parse(localStorage.getItem("learn_history") || "[]");
        history.unshift({
            lang: currentLanguage,
            id: currentSessionObj.id,
            score: learnScore,
            total: learnSession.length,
            date: new Date().toLocaleDateString()
        });
        localStorage.setItem("learn_history", JSON.stringify(history));
    }, 400); 
}

function showLearnMap() {
    loadLanguageMap(currentLanguage);
}

function showLearnHistory() {
    document.getElementById("learn-home").classList.add("hidden");
    const histPage = document.getElementById("learn-history");
    histPage.classList.remove("hidden");
    
    const list = document.getElementById("history-list");
    list.innerHTML = "";
    
    let history = JSON.parse(localStorage.getItem("learn_history") || "[]");
    
    if (history.length === 0) {
        list.innerHTML = "<p style='color:#8a7a7a; font-weight:600;'>No sessions completed yet. Start learning baby! 🌱</p>";
        return;
    }
    
    history.forEach(h => {
        const item = document.createElement("div");
        item.className = "history-item";
        
        const flag = h.lang === "Japanese" ? "🇯🇵" : "🇨🇳";
        item.innerHTML = `
            <div>
                <div class="history-title">${flag} ${h.lang} - Session ${h.id}</div>
                <div class="history-meta">${h.date}</div>
            </div>
            <div class="history-score">${h.score}/${h.total}</div>
        `;
        list.appendChild(item);
    });
}
