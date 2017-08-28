/**
 * Created by ZhiyuLiu on 2017/8/28.
 */



// RequestAnimFrame(): a browser API for getting smooth animations
requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };
})();

cancelRequestAnimFrame = (function () {
    return window.cancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        clearTimeout
})();


// Initialize canvas and required variables
var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),      // Create canvas context
    W = window.innerWidth,              // Window's width
    H = window.innerHeight,             // Window's height
    particles = [],                     // Array containing particles
    ball = {},                          // Ball object
    paddles = [2],                      // Array containing two paddles
    mouse = {},                         // Mouse object to store it's current position
    points = 0,                         // variable to store points
    particlesCount = 20,                // Number of sparks when ball strikes the paddle
    flag = 0,                           // Flag variable which is changed on collision
    particlePos = {},                   // Object to contain the position of collision
    multiplier = 0,                     // variable to control the direction of sparks
    startBtn = {},                      // Start button object
    restartBtn = {},                    // Restart button object
    over = 0,                           // flag variable, changed when the game is over
    init,                               // variable to initialize animation
    paddleHit;                          // variable to which paddle was hit

// Add mousemove and mousedown events to the canvas
canvas.addEventListener("mousemove", trackPosition, true);
canvas.addEventListener("mousedown", btnClick, true);

// Initialise the collision sound
collision = document.getElementById("collide");

// Set the canvas's height and width to full screen
canvas.width = W;
canvas.height = H;

// Function to paint canvas
function paintCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, W, H);
}

// Function for creating paddles
function Paddle(pos) {
    // Height and width
    this.h = 8;
    this.w = 150;

    // Paddle's position
    this.x = W / 2 - this.w / 2;
    this.y = (pos == "top") ? 0 : H - this.h;

}

// Push two new paddles into the paddles[] array
paddles.push(new Paddle("bottom"));
paddles.push(new Paddle("top"));

// Ball object
ball = {
    x: 50,
    y: 50,
    r: 9,
    c: "white",
    vx: 4,
    vy: 8,

    // Function for drawing ball on canvas
    draw: function () {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        ctx.fill();
    }
};


// Start Button object
startBtn = {
    w: 100,
    h: 50,
    x: W / 2 - 50,
    y: H / 2 - 25,

    draw: function () {
        ctx.strokeStyle = "white";
        ctx.lineWidth = "2";
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        ctx.font = "18px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStlye = "white";
        ctx.fillText("Start", W / 2, H / 2);
    }
};

// Restart Button object
restartBtn = {
    w: 100,
    h: 50,
    x: W / 2 - 50,
    y: H / 2 - 50,

    draw: function () {
        ctx.strokeStyle = "white";
        ctx.lineWidth = "2";
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        ctx.font = "18px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStlye = "white";
        ctx.fillText("Restart", W / 2, H / 2 - 25);
    }
};

// Function for creating particles object
function Particles(x, y, m) {
    this.x = x;
    this.y = y;

    this.radius = 1.2;

    this.vx = -1.5 + Math.random() * 3;
    this.vy = m * Math.random() * 1.5;
}

// Draw everything on canvas
function draw() {
    paintCanvas();
    //draw Paddles on canvas
    for (var i = 1; i < paddles.length; i++) {
        p = paddles[i];

        ctx.fillStyle = "white";
        ctx.fillRect(p.x, p.y, p.w, p.h);
    }

    ball.draw();
    update();
}

// Function to increase speed after every 5 points
function increaseSpd() {
    if (points % 4 == 0) {
        if (Math.abs(ball.vx) < 15) {
            ball.vx += (ball.vx < 0) ? -1 : 1;
            ball.vy += (ball.vy < 0) ? -2 : 2;
        }
    }
}

// Track the position of mouse cursor
function trackPosition(e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
}

// Function to update positions, score and everything.
// Basically, the main game logic is defined here
function update() {

    // Update scores
    updateScore();

    // Move the paddles on mouse move
    if (mouse.x && mouse.y) {
        for (var i = 1; i < paddles.length; i++) {
            p = paddles[i];
            p.x = mouse.x - p.w / 2;
        }
    }

    // Move the ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Collision with paddles
    p1 = paddles[1];
    p2 = paddles[2];

    // If the ball strikes with paddles,
    // invert the y-velocity vector of ball,
    // increment the points, play the collision sound,
    // save collision's position so that sparks can be
    // emitted from that position, set the flag variable,
    // and change the multiplier
    if (collides(ball, p1)) {
        collideAction(ball, p1);
    }


    else if (collides(ball, p2)) {
        collideAction(ball, p2);
    }

    else {
        // Collide with walls, If the ball hits the top/bottom walls, run gameOver() function
        if (ball.y + ball.r > H) {
            ball.y = H - ball.r;
            gameOver();
        }

        else if (ball.y < 0) {
            ball.y = ball.r;
            gameOver();
        }

        // If ball strikes the vertical walls, invert the
        // x-velocity vector of ball
        if (ball.x + ball.r >= W) {
            ball.vx = -ball.vx;
            ball.x = W - ball.r;
        }

        else if (ball.x - ball.r < 0) {
            ball.vx = -ball.vx;
            ball.x = 0 + ball.r;
        }
    }


    // If flag is set, push the particles
    if (flag == 1) {
        for (var k = 0; k < particlesCount; k++) {
            particles.push(new Particles(particlePos.x, particlePos.y, multiplier));
        }
    }

    // Emit particles/sparks
    emitParticles();

    // reset flag
    flag = 0;
}

//Function to check collision between ball and one of
//the paddles
function collides(b, p) {
    if (b.x >= p.x && b.x <= p.x + p.w) {
        if (b.y >= (p.y - ball.r) && p.y > 0) {
            paddleHit = 1;
            return true;
        }

        else if (b.y <= p.h + ball.r && p.y == 0) {
            paddleHit = 2;
            return true;
        }

        else return false;
    }
}

//Do this when collides == true
function collideAction(ball, p) {
    ball.vy = -ball.vy;

    if (paddleHit == 1) {
        ball.y = p.y - ball.r;
        particlePos.y = ball.y + ball.r;
        multiplier = -1;
    }

    else if (paddleHit == 2) {
        ball.y = p.h + ball.r;
        particlePos.y = ball.y - ball.r;
        multiplier = 1;
    }

    points++;
    increaseSpd();

    //碰撞音效发出
    if (collision) {
        if (points > 0)
            collision.pause();

        collision.currentTime = 0;
        collision.play();
    }

    particlePos.x = ball.x;
    flag = 1;
}

// Function for emitting particles
function emitParticles() {
    for (var j = 0; j < particles.length; j++) {
        var par = particles[j];

        ctx.beginPath();
        ctx.fillStyle = "white";
        if (par.radius > 0) {
            ctx.arc(par.x, par.y, par.radius, 0, Math.PI * 2, false);
        }
        ctx.fill();

        par.x += par.vx;
        par.y += par.vy;

        // Reduce radius so that the particles die after a few seconds
        par.radius = Math.max(par.radius - 0.05, 0.0);

    }
}

// Function for updating score
function updateScore() {
    ctx.fillStlye = "white";
    ctx.font = "16px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + points, 20, 20);
}

// Function to run when the game overs
function gameOver() {
    ctx.fillStlye = "white";
    ctx.font = "20px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game Over - You scored " + points + " points!", W / 2, H / 2 + 25);

    // Stop the Animation
    cancelRequestAnimFrame(init);

    // Set the over flag
    over = 1;

    // Show the restart button
    restartBtn.draw();
}

// Function for running the whole animation
function animloop() {
    init = requestAnimFrame(animloop);
    draw();
}

// Function to execute at startup
function startScreen() {
    draw();
    startBtn.draw();
}

// On button click (Restart and start)
function btnClick(e) {

    // Variables for storing mouse position on click
    var mx = e.pageX,
        my = e.pageY;

    // Click start button
    if (mx >= startBtn.x && mx <= startBtn.x + startBtn.w) {
        animloop();

        // Delete the start button after clicking it
        startBtn = {};
    }

    // If the game is over, and the restart button is clicked
    if (over == 1) {
        if (mx >= restartBtn.x && mx <= restartBtn.x + restartBtn.w) {
            ball.x = 20;
            ball.y = 20;
            points = 0;
            ball.vx = 4;
            ball.vy = 8;
            animloop();

            over = 0;
        }
    }
}

// Show the start screen
startScreen();