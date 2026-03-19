const RUNNER_CHARS = ["🪿", "🐥", "🦆", "🦕", "🦑", "🐆", "🦒", "🐘", "🦓", "🦘", "🫏", "🐿️"];
const OBSTACLE_EMOJIS = ["🌵", "🌲", "🪨", "☄️"];
const RUN_GROUND_Y = 30; // matches css bottom: 30px
const GRAVITY = 0.6;
const JUMP_POWER = 12;

let runnerState = {
    isPlaying: false,
    isGameOver: false,
    score: 0,
    hiScore: 0,
    speed: 5,
    charY: 0,
    velocityY: 0,
    obstacles: [],
    animationFrameId: null,
    lastObstacleTime: 0,
    dayMode: true
};

function showGameTab(tab) {
    if (tab === 'feed') {
        document.getElementById('game-run-view').classList.add('hidden');
        document.getElementById('game-feed-view').classList.remove('hidden');
        document.getElementById('game-feed-btn').classList.add('active-tab');
        document.getElementById('game-run-btn').classList.remove('active-tab');
        if (typeof stopRunner === 'function') stopRunner();
    } else {
        document.getElementById('game-feed-view').classList.add('hidden');
        document.getElementById('game-run-view').classList.remove('hidden');
        document.getElementById('game-run-btn').classList.add('active-tab');
        document.getElementById('game-feed-btn').classList.remove('active-tab');
        initRunnerGame();
    }
}

function initRunnerGame() {
    stopRunner();
    runnerState.isPlaying = false;
    runnerState.isGameOver = false;
    runnerState.score = 0;
    runnerState.speed = 4;
    runnerState.charY = 0;
    runnerState.velocityY = 0;
    runnerState.obstacles = [];
    runnerState.lastObstacleTime = 0;
    
    // Load high score
    runnerState.hiScore = parseInt(localStorage.getItem('duckRunnerHiScore') || '0');
    document.getElementById('run-hi-score').innerText = runnerState.hiScore;
    document.getElementById('run-score').innerText = "0";
    
    // UI Reset
    document.getElementById('run-game-over').classList.add('hidden');
    document.getElementById('run-start-overlay').classList.remove('hidden');
    document.getElementById('run-obstacles-container').innerHTML = '';
    
    const charEl = document.getElementById('run-char');
    charEl.style.bottom = `${RUN_GROUND_Y}px`;
    
    // Pick random character
    document.getElementById('run-char-body').innerText = RUNNER_CHARS[Math.floor(Math.random() * RUNNER_CHARS.length)];
    
    // Day mode reset
    runnerState.dayMode = true;
    document.getElementById('run-game-area').className = 'run-area day-mode';
    
    // Bind touch on the game area explicitly
    const area = document.getElementById('run-game-area');
    area.onpointerdown = (e) => {
        // prevent default if it's touch to avoid accidental scrolling
        if(e.pointerType === 'touch') e.preventDefault();
        handleRunnerJump();
    };
}

function startRunner() {
    if (runnerState.isPlaying || runnerState.isGameOver) return;
    
    runnerState.isPlaying = true;
    document.getElementById('run-start-overlay').classList.add('hidden');
    
    runnerState.lastObstacleTime = performance.now();
    runnerState.animationFrameId = requestAnimationFrame(updateRunner);
}

function stopRunner() {
    runnerState.isPlaying = false;
    if (runnerState.animationFrameId) {
        cancelAnimationFrame(runnerState.animationFrameId);
    }
}

function handleRunnerJump() {
    if (runnerState.isGameOver) {
        // If game over, tap restarts
        initRunnerGame();
        startRunner();
        return;
    }
    if (!runnerState.isPlaying) {
        startRunner();
    }
    
    // Can only jump if on ground
    if (runnerState.charY === 0) {
        runnerState.velocityY = JUMP_POWER;
        playCharSound(document.getElementById('run-char-body').innerText);
    }
}

// Global keydown
document.addEventListener('keydown', (e) => {
    // Only capture if run view is active
    const runView = document.getElementById('game-run-view');
    if (runView && !runView.classList.contains('hidden')) {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            handleRunnerJump();
        }
    }
});

function updateRunner(timestamp) {
    if (!runnerState.isPlaying) return;
    
    // -- Score & Speed --
    runnerState.score += (runnerState.speed / 10);
    document.getElementById('run-score').innerText = Math.floor(runnerState.score);
    
    // Increase speed slightly
    runnerState.speed += 0.0015;
    
    // Day night cycle every 400 score
    if (Math.floor(runnerState.score) % 800 > 400) {
        if (runnerState.dayMode) {
            runnerState.dayMode = false;
            document.getElementById('run-game-area').className = 'run-area night-mode';
        }
    } else {
        if (!runnerState.dayMode) {
            runnerState.dayMode = true;
            document.getElementById('run-game-area').className = 'run-area day-mode';
        }
    }

    // -- Physics --
    runnerState.charY += runnerState.velocityY;
    runnerState.velocityY -= GRAVITY;
    
    if (runnerState.charY <= 0) {
        runnerState.charY = 0;
        runnerState.velocityY = 0;
    }
    
    const charEl = document.getElementById('run-char');
    charEl.style.bottom = `${RUN_GROUND_Y + runnerState.charY}px`;
    
    // -- Obstacles --
    // Spawn
    if (timestamp - runnerState.lastObstacleTime > (1000 + Math.random() * 1500) / (runnerState.speed / 4)) {
        spawnObstacle();
        runnerState.lastObstacleTime = timestamp;
    }
    
    // Move
    const obstaclesContainer = document.getElementById('run-obstacles-container');
    const areaWidth = document.getElementById('run-game-area').clientWidth;
    
    for (let i = runnerState.obstacles.length - 1; i >= 0; i--) {
        let obs = runnerState.obstacles[i];
        obs.x -= runnerState.speed;
        obs.element.style.left = `${obs.x}px`;
        
        // Remove offscreen
        if (obs.x < -60) {
            obs.element.remove();
            runnerState.obstacles.splice(i, 1);
            continue;
        }
        
        // Collision AABB
        const charHitX = 45; 
        const charHitW = 20; 
        const charHitY = runnerState.charY;
        const obsW = 20; 
        
        if (obs.x < charHitX + charHitW && obs.x + obsW > charHitX) {
            if (charHitY < 30) {
                gameOver();
                return; // exit loop
            }
        }
    }
    
    runnerState.animationFrameId = requestAnimationFrame(updateRunner);
}

function spawnObstacle() {
    const container = document.getElementById('run-obstacles-container');
    const areaWidth = document.getElementById('run-game-area').clientWidth;
    const spawnX = areaWidth > 0 ? areaWidth : 400;
    
    const el = document.createElement('div');
    el.className = 'run-obstacle';
    el.innerText = OBSTACLE_EMOJIS[Math.floor(Math.random() * OBSTACLE_EMOJIS.length)];
    el.style.left = `${spawnX}px`;
    
    container.appendChild(el);
    
    runnerState.obstacles.push({
        x: spawnX,
        element: el
    });
}

function gameOver() {
    runnerState.isPlaying = false;
    runnerState.isGameOver = true;
    
    const finalScore = Math.floor(runnerState.score);
    if (finalScore > runnerState.hiScore) {
        runnerState.hiScore = finalScore;
        localStorage.setItem('duckRunnerHiScore', runnerState.hiScore);
        document.getElementById('run-hi-score').innerText = runnerState.hiScore;
    }
    
    document.getElementById('run-final-score').innerText = `You ran ${finalScore}m!`;
    document.getElementById('run-game-over').classList.remove('hidden');
}

function playCharSound(charEmoji) {
    if (typeof initAudio === 'function') initAudio();
    if (!audioContext) return;
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    let t = audioContext.currentTime;
    
    if (['🦆', '🪿', '🐥'].includes(charEmoji)) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.15);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
    } else if (['🦕', '🐘'].includes(charEmoji)) {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
    } else if (charEmoji === '🦑') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(800, t + 0.15);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
    } else if (['🦘', '🐿️'].includes(charEmoji)) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(900, t + 0.1);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
    } else {
        // Default jump
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
    }
}
