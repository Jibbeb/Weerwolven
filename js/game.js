const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let width, height;
let worldWidth = 2000;
const camera = { x: 0, y: 0 };

const images = {};
let assetsLoaded = false;

let gameState = 'PLAYING'; // 'PLAYING', 'LOCKED'
let currentLevel = 1;

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false
};

const touchControls = {
    left: false,
    right: false,
    jump: false
};

// UI Elements
const cageScreen = document.getElementById('cage-screen');
const levelTitle = document.getElementById('level-title');
const storyText = document.getElementById('story-text');
const cageCodeInput = document.getElementById('cage-code');
const btnOpen = document.getElementById('btn-open');

// Level Configuration
const levels = [
    {
        id: 1,
        platforms: [
            { x: 300, y: 0, width: 200, height: 20, color: '#ff0055' },
            { x: 600, y: 0, width: 200, height: 20, color: '#ff0055' },
            { x: 900, y: 0, width: 200, height: 20, color: '#ff0055' },
            { x: 1200, y: 0, width: 200, height: 20, color: '#ff0055' },
            { x: 1600, y: 0, width: 100, height: 20, color: '#ff0055' }
        ],
        finishX: 1900,
        chaserSpeed: 2.0,
        password: 'WOLF',
        story: "De nacht valt over Wakkerdam. Je voelt een hete adem in je nek. REN!"
    },
    {
        id: 2,
        platforms: [
            { x: 200, y: 0, width: 150, height: 20, color: '#0055ff' },
            { x: 500, y: 0, width: 150, height: 20, color: '#0055ff' },
            { x: 800, y: 0, width: 150, height: 20, color: '#0055ff' },
            { x: 1100, y: 0, width: 150, height: 20, color: '#0055ff' },
            { x: 1500, y: 0, width: 150, height: 20, color: '#0055ff' },
            { x: 1800, y: 0, width: 150, height: 20, color: '#0055ff' }
        ],
        finishX: 2200,
        chaserSpeed: 2.5,
        password: 'MOON',
        story: "Je bent even veilig, maar de geur van het bos is onheilspellend. Hij komt dichterbij."
    },
    {
        id: 3,
        platforms: [
            { x: 250, y: 0, width: 100, height: 20, color: '#55ff00' },
            { x: 500, y: 0, width: 100, height: 20, color: '#55ff00' },
            { x: 750, y: 0, width: 100, height: 20, color: '#55ff00' },
            { x: 1000, y: 0, width: 100, height: 20, color: '#55ff00' },
            { x: 1300, y: 0, width: 100, height: 20, color: '#55ff00' },
            { x: 1600, y: 0, width: 100, height: 20, color: '#55ff00' },
            { x: 2000, y: 0, width: 100, height: 20, color: '#55ff00' }
        ],
        finishX: 2500,
        chaserSpeed: 3.0,
        password: 'HOWL',
        story: "Het hol van het beest. Dit is je laatste kans om de waarheid te onthullen. Overleef."
    }
];

// Player Object
const player = {
    x: 100,
    y: 100,
    width: 40,
    height: 40,
    color: '#00ffcc',
    vx: 0,
    vy: 0,
    speed: 5,
    jumpPower: -17,
    gravity: 0.8,
    grounded: false
};

// Chaser Object (Wall of Death)
const chaser = {
    x: -200,
    width: 40, // Visual width of the leading edge
    color: 'rgba(255, 0, 0, 0.3)',
    speed: 2.0
};

// Current Level Data
let platforms = [];
const goal = {
    x: 1900,
    y: 0,
    width: 50,
    height: 50,
    color: 'gold'
};

// Resize handling
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    updateLevelLayout();
}
window.addEventListener('resize', resize);

function updateLevelLayout() {
    const levelData = levels[currentLevel - 1];
    if (!levelData) return;

    // Update World Width based on finish line
    worldWidth = levelData.finishX + 500;

    // Load Platforms
    platforms = levelData.platforms.map(p => ({ ...p })); // Copy

    // Position platforms relative to bottom (simple procedural height for now)
    platforms.forEach((p, i) => {
        // Alternating heights for variety
        const offset = (i % 3 + 1) * 120;
        p.y = height - offset;
    });

    // Position goal
    goal.x = levelData.finishX;
    goal.y = height - goal.height;
}

// Input Handling
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});

// Touch Controls
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnJump = document.getElementById('btn-jump');

const addTouchListeners = (btn, controlKey) => {
    if (!btn) return;
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); touchControls[controlKey] = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); touchControls[controlKey] = false; });
    btn.addEventListener('mousedown', (e) => { touchControls[controlKey] = true; });
    btn.addEventListener('mouseup', (e) => { touchControls[controlKey] = false; });
    btn.addEventListener('mouseleave', (e) => { touchControls[controlKey] = false; });
};

addTouchListeners(btnLeft, 'left');
addTouchListeners(btnRight, 'right');
addTouchListeners(btnJump, 'jump');

// Cage Puzzle Logic
btnOpen.addEventListener('click', () => {
    const code = cageCodeInput.value.toUpperCase();
    const levelData = levels[currentLevel - 1]; // Current level is already incremented

    if (levelData && code === levelData.password) {
        unlockLevel();
    } else {
        alert("Foute code!");
    }
});

function unlockLevel() {
    gameState = 'PLAYING';
    cageScreen.classList.add('hidden');
    cageCodeInput.value = '';
    resetLevel(false);
}

function nextLevel() {
    if (currentLevel >= levels.length) {
        alert("GEFELICITEERD! JE HEBT HET SPEL UITGESPEELD!");
        currentLevel = 1; // Loop back to 1 or end game
    } else {
        currentLevel++;
    }

    gameState = 'LOCKED';

    // Show Cage UI
    levelTitle.innerText = `Level ${currentLevel} - Kooi`;

    // Update Story Text
    const levelData = levels[currentLevel - 1];
    if (levelData && levelData.story) {
        storyText.innerText = levelData.story;
    } else {
        storyText.innerText = "";
    }

    cageScreen.classList.remove('hidden');
}

function resetLevel(fullReset = true) {
    const levelData = levels[currentLevel - 1];
    if (!levelData) return;

    // Update Chaser Speed
    chaser.speed = levelData.chaserSpeed;

    // Reset Player
    player.x = 100;
    player.y = height - 150;
    player.vx = 0;
    player.vy = 0;

    // Reset Camera
    camera.x = 0;

    // Reset Chaser
    chaser.x = -200;

    // Update Layout
    updateLevelLayout();
}

// Collision Detection (AABB)
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Game Loop
function update() {
    if (gameState === 'LOCKED') return;

    // Movement
    if (keys.ArrowLeft || touchControls.left) {
        player.vx = -player.speed;
    } else if (keys.ArrowRight || touchControls.right) {
        player.vx = player.speed;
    } else {
        player.vx = 0;
    }

    // Jumping
    if ((keys.ArrowUp || touchControls.jump) && player.grounded) {
        player.vy = player.jumpPower;
        player.grounded = false;
    }

    // Apply Gravity
    player.vy += player.gravity;

    // Apply Horizontal Movement
    player.x += player.vx;

    // Camera Logic (Follow Player)
    if (player.x > camera.x + width * 0.3) {
        camera.x = player.x - width * 0.3;
    }

    // Clamp Camera
    if (camera.x > worldWidth - width) {
        camera.x = worldWidth - width;
    }
    if (camera.x < 0) camera.x = 0;

    // Player World Boundaries
    if (player.x < camera.x) {
        player.x = camera.x;
        player.vx = 0;
    }
    if (player.x + player.width > worldWidth) {
        player.x = worldWidth - player.width;
    }

    // Apply Vertical Movement
    player.y += player.vy;

    // Ground Collision (Floor)
    player.grounded = false;
    if (player.y + player.height > height) {
        player.y = height - player.height;
        player.vy = 0;
        player.grounded = true;
    }

    // Platform Collision
    platforms.forEach(platform => {
        if (player.x + player.width > platform.x && player.x < platform.x + platform.width) {
            if (player.vy >= 0) {
                const platformTop = platform.y;
                const playerBottom = player.y + player.height;

                if (playerBottom >= platformTop && playerBottom <= platformTop + player.vy + 10) {
                    player.y = platformTop - player.height;
                    player.vy = 0;
                    player.grounded = true;
                }
            }
        }
    });

    // Chaser Logic (Wall of Death)
    chaser.x += chaser.speed;

    // Wall Collision (Left of Chaser Edge)
    if (player.x < chaser.x + chaser.width) {
        console.log("GEPAKT!");
        resetLevel();
    }

    // Goal Collision
    if (checkCollision(player, goal)) {
        console.log("LEVEL GEHAALD");
        nextLevel();
    }
}

function draw() {
    // Clear screen
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, width, height);

    if (assetsLoaded && images.background) {
        ctx.drawImage(images.background, 0, 0, width, height);
    }

    ctx.save();
    ctx.translate(-camera.x, 0);

    // Draw Platforms
    platforms.forEach(platform => {
        if (assetsLoaded && images.ground) {
            const ptrn = ctx.createPattern(images.ground, 'repeat');
            ctx.fillStyle = ptrn;
            ctx.save();
            ctx.translate(platform.x, platform.y);
            ctx.fillRect(0, 0, platform.width, platform.height);
            ctx.restore();
        } else {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
    });

    // Draw Goal
    if (assetsLoaded && images.goal) {
        ctx.drawImage(images.goal, goal.x, goal.y, goal.width, goal.height);
    } else {
        ctx.fillStyle = goal.color;
        ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
    }

    // Draw Player
    if (assetsLoaded && images.player) {
        ctx.drawImage(images.player, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // Draw Chaser (Wall of Death)
    if (assetsLoaded && images.chaser) {
        ctx.drawImage(images.chaser, chaser.x, 0, chaser.width, height);
        ctx.fillStyle = 'rgba(50, 0, 0, 0.8)';
        ctx.fillRect(camera.x - 100, 0, (chaser.x) - (camera.x - 100), height);
    } else {
        ctx.fillStyle = chaser.color;
        ctx.fillRect(camera.x - 100, 0, (chaser.x + chaser.width) - (camera.x - 100), height);
        ctx.fillStyle = 'red';
        ctx.fillRect(chaser.x, 0, chaser.width, height);
    }

    ctx.restore();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Initial Setup
// Asset Loading
function loadAssets(callback) {
    const assetNames = ['player', 'ground', 'background', 'chaser', 'goal'];
    let loadedCount = 0;

    assetNames.forEach(name => {
        const img = new Image();
        img.src = `assets/${name}.png`;
        img.onload = () => {
            loadedCount++;
            if (loadedCount === assetNames.length) {
                assetsLoaded = true;
                console.log("All assets loaded");
                if (callback) callback();
            }
        };
        img.onerror = () => {
            console.error(`Failed to load asset: ${name}`);
            // Even if assets fail, we start the game (will use fallback colors)
            loadedCount++;
            if (loadedCount === assetNames.length) {
                console.log("Assets loaded with errors");
                if (callback) callback();
            }
        };
        images[name] = img;
    });
}

// Initial Setup
resize();
resetLevel(); // Load Level 1

// Start game after assets load
loadAssets(() => {
    loop();
});
