const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let width, height;
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
    jumpPower: -15,
    gravity: 0.8,
    grounded: false
};

// Resize handling
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
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

    // Physics
    player.vy += player.gravity;
    player.x += player.vx;
    player.y += player.vy;

    // Boundaries & Collision
    // Floor
    if (player.y + player.height > height) {
        player.y = height - player.height;
        player.vy = 0;
        player.grounded = true;
    } else {
        player.grounded = false;
    }

    // Walls (Optional, keep inside screen)
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > width) player.x = width - player.width;
}

function draw() {
    // Clear screen
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, width, height);

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start Game
loop();
