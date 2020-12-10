/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()

function runProgram() {
    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////// SETUP /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // Constant Variables
    var FRAMES_PER_SECOND_INTERVAL = 1000 / 60;
    var BORDERS = {
        TOP: 0,
        LEFT: 0,
        BOTTOM: $("#board").height(),
        RIGHT: $("#board").width(),
    }
    var KEY = {
        /* general controls */
        ENTER: 16,  // ???
        SPACE: 32,  // pause
        R: 82,      // restart

        /* P1 controls */
        W: 87,      // up
        A: 65,      // left
        S: 83,      // down
        D: 68,      // right

        /* P2 controls */
        UP: 38,     // up
        LEFT: 37,   // left
        DOWN: 40,   // down
        RIGHT: 39,  // right

        /* ball controls */
        U: 85,      // up
        H: 72,      // left
        J: 74,      // down
        K: 75,      // right
    }

    // Game Item Objects

    var paddleLeft = createGameObject(50, 180, 0, 0, "#paddleLeft");    // player 1
    var p1 = paddleLeft;

    var paddleRight = createGameObject(630, 180, 0, 0, "#paddleRight"); // player 2
    var p2 = paddleRight;

    var ball = createGameObject(340, 210, -5, -2.5, "#ball");           // ball

    var pause = createGameObject(10, 10, 0, 0, "#cheatIcon");           // cheat icon

    var score = {
        bounced: 0,
        p1: 0,
        p2: 0,
    }

    var text = {
        p1: "P1 WINS!",
        p2: "P2 WINS!",
        restart: "Reload the page to play again",
        pause: "PAUSED",
        error: "ERROR",
    }

    // one-time setup
    var interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL);   // execute newFrame every 0.0166 seconds (60 Frames per second)
    $(document).on("keydown", handleKeyDown);       // listen for keydown events
    $(document).on("keyup", handleKeyUp);           // listen for keyup events
    $("#cheatIcon").on("click", activateCheatMode); // listen for click events
    $("#cheatIcon").hide();

    var isPaused = false;
    var spaceIsDown = false;
    var cheatModeActivated = false;
    var firstTime = true;
    var freeplay = false;
    var gameWon = false;

    alert("Welcome to Pong!\nP1 Controls: W A S D\nP2 Controls: Up Down Left Right\nPause: Space");

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////// CORE LOGIC ///////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /* 
    On each "tick" of the timer, a new frame is dynamically drawn using JavaScript
    by calling this function and executing the code inside.
    */
    function newFrame() {
        updateTemporarySpeed();
        pauseGame();
        handleCollisions();
        if (!gameWon) {
            redrawAllGameItems();
            if (!isPaused) {
                handleSpeed();
                repositionAllGameItems();
            }
        }
    }

    /* 
    Called in response to events.
    */
    function handleKeyDown(event) {
        var keycode = event.which;
        console.log(keycode);

        /* general controls */
        if (keycode === KEY.ENTER) {        // ???
            console.log("enter pressed");
        } if (keycode === KEY.SPACE) {      // pause
            spaceIsDown = true;
            console.log("space pressed");
        } if (keycode === KEY.R) {          // restart
            console.log("r pressed");
        }

        /* P1 controls */
        if (keycode === KEY.W) {            // up
            paddleLeft.speed.up = 5;
            console.log("w pressed");
        } if (keycode === KEY.A) {          // left
            console.log("a pressed");
        } if (keycode === KEY.S) {          // down
            paddleLeft.speed.down = 5;
            console.log("s pressed");
        } if (keycode === KEY.D) {          // right
            console.log("d pressed");
        }

        /* P2 controls */
        if (keycode === KEY.UP) {           // up
            paddleRight.speed.up = 5;
            console.log("up pressed");
        } if (keycode === KEY.LEFT) {       // left
            console.log("left pressed");
        } if (keycode === KEY.DOWN) {       // down
            paddleRight.speed.down = 5;
            console.log("down pressed");
        } if (keycode === KEY.RIGHT) {      // right
            console.log("right pressed");
        }

        /* ball controls */
        if (cheatModeActivated) {
            if (firstTime) {
                ball.speed.up = 0;
                ball.speed.left = 0;
                ball.speed.down = 0;
                ball.speed.right = 0;
            }
            firstTime = false;
            if (keycode === KEY.U) {        // up
                ball.speed.up = 5;
                console.log("u pressed");
            } if (keycode === KEY.H) {      // left
                ball.speed.left = 5;
                console.log("h pressed");
            } if (keycode === KEY.J) {      // down
                ball.speed.down = 5;
                console.log("j pressed");
            } if (keycode === KEY.K) {      // right
                ball.speed.right = 5;
                console.log("k pressed");
            }
        } else {
            ball.speed.up = ball.temporarySpeed.up;
            ball.speed.left = ball.temporarySpeed.left;
            ball.speed.down = ball.temporarySpeed.down;
            ball.speed.right = ball.temporarySpeed.right;
            firstTime = true;
        }
    }

    function handleKeyUp(event) {
        var keycode = event.which;
        console.log(keycode);

        /* general controls */
        if (keycode === KEY.ENTER) {
            console.log("enter released");
        } if (keycode === KEY.SPACE) {
            spaceIsDown = false;
            console.log("space released");
        } if (keycode === KEY.R) {
            console.log("r released");
        }

        /* P1 controls */
        if (event.which === KEY.W) {
            paddleLeft.speed.up = 0;
            console.log("w released");
        } if (keycode === KEY.A) {
            paddleLeft.speed.left = 0;
            console.log("a released");
        } if (keycode === KEY.S) {
            paddleLeft.speed.down = 0;
            console.log("s released");
        } if (keycode === KEY.D) {
            paddleLeft.speed.right = 0;
            console.log("d released");
        }

        /* P2 controls */
        if (keycode === KEY.UP) {
            paddleRight.speed.up = 0;
            console.log("up released");
        } if (keycode === KEY.LEFT) {
            paddleRight.speed.left = 0;
            console.log("left released");
        } if (keycode === KEY.DOWN) {
            paddleRight.speed.down = 0;
            console.log("down released");
        } if (keycode === KEY.RIGHT) {
            paddleRight.speed.right = 0;
            console.log("right released");
        }

        /* ball controls */
        if (cheatModeActivated) {
            if (keycode === KEY.U) {
                ball.speed.up = 0;
                console.log("u released");
            } if (keycode === KEY.H) {
                ball.speed.left = 0;
                console.log("h released");
            } if (keycode === KEY.J) {
                ball.speed.down = 0;
                console.log("j released");
            } if (keycode === KEY.K) {
                ball.speed.right = 0;
                console.log("k released");
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    function createGameObject(x, y, speedX, speedY, id) {
        var gameObject = {};
        gameObject.x = x;
        gameObject.y = y;
        gameObject.speed = {}
        if (speedX < 0) {
            gameObject.speed.left = -speedX;
            gameObject.speed.right = 0;
        } else {
            gameObject.speed.left = 0;
            gameObject.speed.right = speedX;
        }
        if (speedY < 0) {
            gameObject.speed.up = -speedY;
            gameObject.speed.down = 0;
        } else {
            gameObject.speed.up = 0;
            gameObject.speed.down = speedY;
        }
        gameObject.speedX = gameObject.speed.left + gameObject.speed.right;
        gameObject.speedY = gameObject.speed.up + gameObject.speed.down;
        gameObject.id = id;
        if (gameObject.id === "#ball") {
            gameObject.temporarySpeed = {}
            gameObject.temporarySpeed.up = gameObject.speed.up;
            gameObject.temporarySpeed.left = gameObject.speed.left;
            gameObject.temporarySpeed.down = gameObject.speed.down;
            gameObject.temporarySpeed.right = gameObject.speed.right;
        }
        return gameObject;
    }


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    //////////////// Speed \\\\\\\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function updateTemporarySpeed() {
        if (!isPaused && !cheatModeActivated) {
            ball.temporarySpeed.up = ball.speed.up;
            ball.temporarySpeed.left = ball.speed.left;
            ball.temporarySpeed.down = ball.speed.down;
            ball.temporarySpeed.right = ball.speed.right;
        }
    }

    function handleSpeed() {
        // p1 speed
        paddleLeft.speedX = paddleLeft.speed.right - paddleLeft.speed.left;
        paddleLeft.speedY = paddleLeft.speed.down - paddleLeft.speed.up;

        // p2 speed
        paddleRight.speedX = paddleRight.speed.right - paddleRight.speed.left;
        paddleRight.speedY = paddleRight.speed.down - paddleRight.speed.up;

        // ball speed
        ball.speedX = ball.speed.right - ball.speed.left;
        ball.speedY = ball.speed.down - ball.speed.up;
    }


    ///////////////////\\\\\\\\\\\\\\\\\\\
    ////////// Pause and Cheats \\\\\\\\\\
    ///////////////////\\\\\\\\\\\\\\\\\\\

    var num = 1;
    function pauseGame() {
        if (spaceIsDown) {
            if (num < 2) {
                if (isPaused) {
                    isPaused = false;
                    $("#ball").css("background-color", "fuchsia");
                    $("#cheatIcon").hide();
                    console.log("unpause");
                } else {
                    isPaused = true;
                    $("#ball").css("background-color", "lime");
                    $("#cheatIcon").show();
                    console.log("pause");
                }
            }
            num += 1;
        } else {
            num = 1;
        }
    }

    function activateCheatMode() {
        var answer = prompt("Password:");
        if (answer === "^^vv<><>ba") {
            if (cheatModeActivated) {
                alert("Cheat Mode is already activated.\nType anything but the password to deactivate it.");
            } else {
                alert("Cheat Mode Activated!\nUse these controls to move the ball:\nU: Up\nH: Left\nJ: Down\nK: Right\nType anything but the password to deactivate Cheat Mode.");
            }
            cheatModeActivated = true;
        } else if (cheatModeActivated) {
            alert("Cheat Mode Deactivated");
            cheatModeActivated = false;
        } else {
            alert("Wrong Password.");
            cheatModeActivated = false;
        }
    }


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    ///////////// Collissions \\\\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function handleCollisions() {
        // update object borders
        updateObjectBorders(paddleLeft);
        updateObjectBorders(paddleRight);
        updateObjectBorders(ball);

        // keep the objects in the borders
        enforceNoNoZone(paddleLeft);
        enforceNoNoZone(paddleRight);
        if (cheatModeActivated) {
            enforceNoNoZone(ball);
        } else {
            bounceBall(ball);
        }

        // check if the ball is touching the paddles
        handlePaddleCollisions(paddleLeft);     // left paddle
        handlePaddleCollisions(paddleRight);    // right paddle
    }

    function updateObjectBorders(obj) {
        obj.leftX = obj.x;
        obj.topY = obj.y;
        obj.rightX = obj.x + $(obj.id).width();
        obj.bottomY = obj.y + $(obj.id).height();
    }

    function enforceNoNoZone(obj) {
        if (obj.leftX < BORDERS.LEFT) {
            obj.x -= -5;
            console.log(obj.id + " passed left border")
        }
        if (obj.topY < BORDERS.TOP) {
            obj.y -= -5;
            console.log(obj.id + " passed top border")
        }
        if (obj.rightX > BORDERS.RIGHT) {
            obj.x -= 5;
            console.log(obj.id + " passed right border")
        }
        if (obj.bottomY > BORDERS.BOTTOM) {
            obj.y -= 5;
            console.log(obj.id + " passed bottom border")
        }
    }

    function bounceBall() {
        if (ball.leftX < BORDERS.LEFT) {
            if (freeplay) {
                ball.speed.right = ball.speed.left;
                ball.speed.left = 0;
            }
            playerLose(p1.id);
            console.log("ball bounced left border");
        }
        if (ball.topY < BORDERS.TOP) {
            ball.speed.down = ball.speed.up;
            ball.speed.up = 0;
            console.log("ball bounced top border");
        }
        if (ball.rightX > BORDERS.RIGHT) {
            if (freeplay) {
                ball.speed.left = ball.speed.right;
                ball.speed.right = 0;
            }
            playerLose(p2.id);
            console.log("ball bounced right border");
        }
        if (ball.bottomY > BORDERS.BOTTOM) {
            ball.speed.up = ball.speed.down;
            ball.speed.down = 0;
            console.log("ball bounced bottom border");
        }
    }

    var newSomething = 0;
    function handlePaddleCollisions(paddle) {
        if (whichBorder(ball, paddle) === "left") {
            ball.speed.left = 5;
            ball.speed.right = 0;
            score.bounced++;
            console.log("ball bounced " + tellPaddle(paddle) + " paddle's left border");
        }
        if (whichBorder(ball, paddle) === "right") {
            ball.speed.left = 0;
            ball.speed.right = 5;
            score.bounced++;
            console.log("ball bounced " + tellPaddle(paddle) + " paddle's right border");
        }

        $("#bouncedLeft").text(score.bounced);
        $("#bouncedRight").text(score.bounced);
    }

    function whichBorder(obj1, obj2) {
        if ((obj1.leftX < obj2.rightX && obj1.rightX > (obj2.leftX + $(obj2.id).width() / 2)) &&    // left border is in the right border and the right border in halfway in the left border
            (obj1.topY < obj2.bottomY && obj1.bottomY > obj2.topY)) {                               // and the top and bottom borders are between the other's top and bottom borders
            return "right";
        }
        if ((obj1.rightX > obj2.leftX && obj1.leftX < (obj2.rightX - $(obj2.id).width() / 2)) &&    // right border is in the left border
            (obj1.topY < obj2.bottomY && obj1.bottomY > obj2.topY)) {                               // and the top and bottom borders are between the other's top and bottom borders
            return "left";
        }
    }

    function tellPaddle(paddle) {
        if (paddle === paddleLeft) {
            return "left";
        }
        if (paddle === paddleRight) {
            return "right";
        }
    }

    function doCollide(obj1, obj2) {
        // return true if colliding, else, return false
        if ((obj1.leftX < obj2.rightX &&
            obj1.topY < obj2.bottomY) &&
            (obj1.rightX > obj2.leftX &&
                obj1.bottomY > obj2.topY)) {
            return true;
        } else {
            return false;
        }
    }


    ///////////////////\\\\\\\\\\\\\\\\\\\
    /////////////// Points \\\\\\\\\\\\\\\
    ///////////////////\\\\\\\\\\\\\\\\\\\

    function playerLose(player) {
        if (player === p1.id) {             // player 1's side
            score.p2++;
            $("#p2").text(score.p2);
        } else if (player === p2.id) {      // player 2's side
            score.p1++;
            $("#p1").text(score.p1);
        } else {
            console.log(text.error);
        }
        if (!freeplay) {
            whoWon();
            if (!gameWon) {
                $("#ball").css("background-color", "red");
                clearInterval(interval);
                setTimeout(restartGame.bind(null, player), 500);
            }
        }
    }

    function whoWon() {
        if (score.p1 >= 10) {
            $("#paddleLeft").css("background-color", "lime");
            alert(text.p1 + "\n" + text.restart);
            gameWon = true;
            endGame();
        } if (score.p2 >= 10) {
            $("#paddleRight").css("background-color", "lime");
            alert(text.p2 + "\n" + text.restart);
            gameWon = true;
            endGame();
        }
    }

    function restartGame(player) {
        interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL)
        $("#ball").css("background-color", "fuchsia");
        ball.x = 340;
        ball.y = 210;
        if (player === p1.id) {
            ball.speed.left = 0;
            ball.speed.right = 5;
        } else if (player === p2.id) {
            ball.speed.left = 5;
            ball.speed.right = 0;
        } else {
            alert(text.error + " in restartGame " + player);
        }
        paddleLeft.y = 180;
        paddleRight.y = 180;
        score.bounced = 0;
    }


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    //////////// Repositioning \\\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function repositionGameItem(gameItem) {
        gameItem.x += gameItem.speedX;
        gameItem.y += gameItem.speedY;
    }

    function repositionAllGameItems() {
        repositionGameItem(paddleLeft);
        repositionGameItem(paddleRight);
        repositionGameItem(ball);
    }


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    ////////////// Redrawing \\\\\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function redrawGameItem(gameItem) {
        $(gameItem.id).css("left", gameItem.x);
        $(gameItem.id).css("top", gameItem.y);
    }

    function redrawAllGameItems() {
        redrawGameItem(paddleLeft);
        redrawGameItem(paddleRight);
        redrawGameItem(ball);
    }


    function resetGame() {
        // paddleLeft.x = x;
        // paddleLeft.y = y;
        // paddleLeft.speedX = speedX;
        // paddleLeft.speedY = speedY;
        // paddleLeft.score = score;
        // paddleLeft.id = id;

        // paddleRight.x = x;
        // paddleRight.y = y;
        // paddleRight.speedX = speedX;
        // paddleRight.speedY = speedY;
        // paddleRight.score = score;
        // paddleRight.id = id;

        // ball.x = x;
        // ball.y = y;
        // ball.speedX = speedX;
        // ball.speedY = speedY;
        // ball.score = score;
        // ball.id = id;
    }

    function endGame() {
        // stop the interval timer
        clearInterval(interval);

        // turn off event handlers
        $(document).off();
    }
}
