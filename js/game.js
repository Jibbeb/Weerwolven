const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let width, height;
const worldWidth = 2000;
const camera = { x: 0, y: 0 };

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

// Level Objects
const platforms = [
    { x: 300, y: 0, width: 200, height: 20, color: '#ff0055' },
    { x: 600, y: 0, width: 200, height: 20, color: '#ff0055' },
    { x: 900, y: 0, width: 200, height: 20, color: '#ff0055' },
    { x: 1200, y: 0, width: 200, height: 20, color: '#ff0055' },
    { x: 1600, y: 0, width: 100, height: 20, color: '#ff0055' }
];

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

    // Position platforms relative to bottom
    // Max jump is roughly 180px with jumpPower -17
    platforms[0].y = height - 120;
    platforms[1].y = height - 240;
    platforms[2].y = height - 360;
    platforms[3].y = height - 240;
    platforms[4].y = height - 120;

    // Position goal on the ground
    goal.y = height - goal.height;
}
window.addEventListener('resize', resize);
resize();

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
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); touchControls[controlKey] = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); touchControls[controlKey] = false; });
    btn.addEventListener('mousedown', (e) => { touchControls[controlKey] = true; });
    btn.addEventListener('mouseup', (e) => { touchControls[controlKey] = false; });
    btn.addEventListener('mouseleave', (e) => { touchControls[controlKey] = false; });
};

addTouchListeners(btnLeft, 'left');
addTouchListeners(btnRight, 'right');
addTouchListeners(btnJump, 'jump');

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
    // Camera follows player if they move past 30% of the screen width
    if (player.x > camera.x + width * 0.3) {
        camera.x = player.x - width * 0.3;
    }

    // Clamp Camera (Don't show past world end)
    if (camera.x > worldWidth - width) {
        camera.x = worldWidth - width;
    }
    // Clamp Camera (Don't show before 0)
    if (camera.x < 0) camera.x = 0;

    // Player World Boundaries
    // Prevent moving left of camera (Mario style)
    if (player.x < camera.x) {
        player.x = camera.x;
        player.vx = 0;
    }
    // Prevent moving past world end
    if (player.x + player.width > worldWidth) {
        player.x = worldWidth - player.width;
    }

    // Apply Vertical Movement
    player.y += player.vy;

    // Ground Collision (Floor)
    player.grounded = false; // Assume falling unless collision found
    if (player.y + player.height > height) {
        player.y = height - player.height;
        player.vy = 0;
        player.grounded = true;
    }

    // Platform Collision
    platforms.forEach(platform => {
        // Check if player is within horizontal bounds of platform
        if (player.x + player.width > platform.x && player.x < platform.x + platform.width) {
            // Check if player is falling (vy >= 0)
            if (player.vy >= 0) {
                const platformTop = platform.y;
                const playerBottom = player.y + player.height;

                // If we are overlapping the platform vertically
                // We check if the player's bottom is close to the platform top
                // The tolerance allows for high speed falling to still catch the platform
                if (playerBottom >= platformTop && playerBottom <= platformTop + player.vy + 10) {
                    player.y = platformTop - player.height;
                    player.vy = 0;
                    player.grounded = true;
                }
            }
        }
    });

    // Goal Collision
    if (checkCollision(player, goal)) {
        console.log("LEVEL GEHAALD");
    }
}

function draw() {
    // Clear screen
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(-camera.x, 0);

    // Draw Platforms
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw Goal
    ctx.fillStyle = goal.color;
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.restore();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start Game
loop();
