/**
 * Created by ZhiyuLiu on 2017/8/29.
 */

var topScore = 0,                   // variable to record Player1's score
    bottomScore = 0,                // variable to record Player2's score
    keyNum,                         // variable to get keyCode
    topLeft = false,                // variable to record whether the corresponding button is pressed
    topRight = false,               // variable to record whether the corresponding button is pressed
    bottomLeft = false,             // variable to record whether the corresponding button is pressed
    bottomRight = false;            // variable to record whether the corresponding button is pressed

// Set the variable when the corresponding button is pressed
window.document.onkeydown = function (ev) {
    var event = ev || window.event;
    keyNum = event.keyCode;
    if (keyNum === 65) {
        topLeft = true;
    } else if (keyNum === 68) {
        topRight = true;
    } else if (keyNum === 37) {
        bottomLeft = true;
    } else if (keyNum === 39) {
        bottomRight = true;
    }
};

// Set the variable when the corresponding button to bounce up
window.document.onkeyup = function (ev) {
    var event = ev || window.event;
    keyNum = event.keyCode;
    if (keyNum === 65) {
        topLeft = false;
    } else if (keyNum === 68) {
        topRight = false;
    } else if (keyNum === 37) {
        bottomLeft = false;
    } else if (keyNum === 39) {
        bottomRight = false;
    }
};

function paint() {
    paintCanvas();

    // Draw the top paddle
    ctx.fillStyle = "#ff4949";
    ctx.fillRect(paddles[2].x, paddles[2].y, paddles[2].w, paddles[2].h);

    // Draw the bottom paddle
    ctx.fillStyle = "white";
    ctx.fillRect(paddles[1].x, paddles[1].y, paddles[1].w, paddles[1].h);

    ball.draw();
    Update();
}

function Update() {
    // Update the score
    updateGrade();

    // Use the relevant variables to record whether
    // or not the two keys on the keyboard are pressed
    if (topLeft) {
        if (paddles[2].x >= -16) {
            paddles[2].x -= paddles[2].vx;
        }
    }
    if (topRight) {
        if (paddles[2].x <= W - paddles[2].w + 16) {
            paddles[2].x += paddles[2].vx;
        }
    }
    if (bottomLeft) {
        if (paddles[1].x >= -16) {
            paddles[1].x -= paddles[1].vx;
        }
    }
    if (bottomRight) {
        if (paddles[1].x <= W - paddles[1].w + 16) {
            paddles[1].x += paddles[1].vx;
        }
    }


    ball.x += ball.vx;
    ball.y += ball.vy;

    // Collision with paddles
    pa1 = paddles[1];
    pa2 = paddles[2];

    if (collides(ball, pa1)) {
        collideAction(ball, pa1);
    } else if (collides(ball, pa2)) {
        collideAction(ball, pa2);
    } else {
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

    if (flag == 1) {
        for (var k = 0; k < particlesCount; k++) {
            particles.push(new Particles(particlePos.x, particlePos.y, multiplier));
        }
    }

    emitParticles();

    flag = 0;
}

function updateGrade() {
    ctx.fillStyle = "#ff4949";
    ctx.font = "16px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Player1 Score: " + topScore, 20, 40);

    ctx.fillStyle = "white";
    ctx.textBaseline = "bottom";
    ctx.fillText("Player2 Score: " + bottomScore, 20, H - 40);
}