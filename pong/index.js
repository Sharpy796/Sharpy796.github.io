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
        P: 80,      // pause
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

    var paddleLeft = createGameObject(50, 180, 0, 0, 0, "#paddleLeft");     // player 1

    var paddleRight = createGameObject(630, 180, 0, 0, 0, "#paddleRight");  // player 2

    var ball = createGameObject(340, 210, -5, -2.5, 0, "#ball");            // ball
    ball.temporarySpeedX = ball.speedX;
    ball.temporarySpeedY = ball.speedY;

    var pause = createGameObject(10, 10, 0, 0, null, "#cheatIcon");               // cheat icon

    var score = {
        bounced: 0,
    }

    var text = {
        p1: "P1 WINS!",
        p2: "P2 WINS!",
        restart: "Press R to Restart",
        pause: "PAUSED",
        error: "ERROR",
    }

    var isPaused = false;
    var pIsDown = false;
    var cheatModeActivated = false;
    var firstTime = true;

    // one-time setup
    var interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL);   // execute newFrame every 0.0166 seconds (60 Frames per second)
    $(document).on("keydown", handleKeyDown);       // listen for keydown events
    $(document).on("keyup", handleKeyUp);           // listen for keyup events
    $("#cheatIcon").on("click", activateCheatMode); // listen for click events
    $("#cheatIcon").hide();

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
        redrawAllGameItems();
        if (isPaused) {
        } else {
            repositionAllGameItems();
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
        } if (keycode === KEY.P) {          // pause
            pIsDown = true;
            console.log("p pressed");
        } if (keycode === KEY.R) {          // restart
            console.log("r pressed");
        }

        /* P1 controls */
        if (keycode === KEY.W) {            // up
            paddleLeft.speedY = -5;
            console.log("w pressed");
        } if (keycode === KEY.A) {          // left
            console.log("a pressed");
        } if (keycode === KEY.S) {          // down
            paddleLeft.speedY = 5;
            console.log("s pressed");
        } if (keycode === KEY.D) {          // right
            console.log("d pressed");
        }

        /* P2 controls */
        if (keycode === KEY.UP) {           // up
            paddleRight.speedY = -5;
            console.log("up pressed");
        } if (keycode === KEY.LEFT) {       // left
            console.log("left pressed");
        } if (keycode === KEY.DOWN) {       // down
            paddleRight.speedY = 5;
            console.log("down pressed");
        } if (keycode === KEY.RIGHT) {      // right
            console.log("right pressed");
        }

        /* ball controls */
        if (cheatModeActivated) {
            if (firstTime) {
                ball.speedX = 0;
                ball.speedY = 0;
            }
            firstTime = false;
            if (keycode === KEY.U) {        // up
                ball.speedY = -5;
                console.log("u pressed");
            } if (keycode === KEY.H) {      // left
                ball.speedX = -5;
                console.log("h pressed");
            } if (keycode === KEY.J) {      // down
                ball.speedY = 5;
                console.log("j pressed");
            } if (keycode === KEY.K) {      // right
                ball.speedX = 5;
                console.log("k pressed");
            }
        } else {
            ball.speedX = ball.temporarySpeedX;
            ball.speedY = ball.temporarySpeedY;
            firstTime = true;
        }
    }

    function handleKeyUp(event) {
        var keycode = event.which;
        console.log(keycode);

        /* general controls */
        if (keycode === KEY.ENTER) {
            console.log("enter released");
        } if (keycode === KEY.P) {
            pIsDown = false;
            console.log("p released");
        } if (keycode === KEY.R) {
            console.log("r released");
        }

        /* P1 controls */
        if (event.which === KEY.W) {
            paddleLeft.speedY = 0;
            console.log("w released");
        } if (keycode === KEY.A) {
            paddleLeft.speedX = 0;
            console.log("a released");
        } if (keycode === KEY.S) {
            paddleLeft.speedY = 0;
            console.log("s released");
        } if (keycode === KEY.D) {
            paddleLeft.speedX = 0;
            console.log("d released");
        }

        /* P2 controls */
        if (keycode === KEY.UP) {
            paddleRight.speedY = 0;
            console.log("up released");
        } if (keycode === KEY.LEFT) {
            paddleRight.speedX = 0;
            console.log("left released");
        } if (keycode === KEY.DOWN) {
            paddleRight.speedY = 0;
            console.log("down released");
        } if (keycode === KEY.RIGHT) {
            paddleRight.speedX = 0;
            console.log("right released");
        }

        /* ball controls */
        if (cheatModeActivated) {
            if (keycode === KEY.U) {
                ball.speedY = 0;
                console.log("u released");
            } if (keycode === KEY.H) {
                ball.speedX = 0;
                console.log("h released");
            } if (keycode === KEY.J) {
                ball.speedY = 0;
                console.log("j released");
            } if (keycode === KEY.K) {
                ball.speedX = 0;
                console.log("k released");
            }
        }
    }

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

        // check if the ball is touching the left paddle
        if (doCollide(ball, paddleLeft)) {
            ball.speedX *= -1;
            score.bounced += 1;
            console.log("bounced p1");
        }

        // check if the ball is touching the right paddle
        if (doCollide(ball, paddleRight)) {
            ball.speedX *= -1;
            score.bounced += 1;
            console.log("bounced p2");
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    function createGameObject(x, y, speedX, speedY, score, id) {
        var gameObject = {};
        gameObject.x = x;
        gameObject.y = y;
        gameObject.speedX = speedX;
        gameObject.speedY = speedY;
        gameObject.score = score;
        gameObject.id = id;
        return gameObject;
    }

    function updateTemporarySpeed() {
        if (!isPaused && !cheatModeActivated) {
            ball.temporarySpeedX = ball.speedX;
            ball.temporarySpeedY = ball.speedY;
        }
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
            ball.speedX *= -1;
            console.log("ball bounced left border")
        }
        if (ball.topY < BORDERS.TOP) {
            ball.speedY *= -1;
            console.log("ball bounced top border")
        }
        if (ball.rightX > BORDERS.RIGHT) {
            ball.speedX *= -1;
            console.log("ball bounced right border")
        }
        if (ball.bottomY > BORDERS.BOTTOM) {
            ball.speedY *= -1;
            console.log("ball bounced bottom border")
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

    function repositionGameItem(gameItem) {
        gameItem.x += gameItem.speedX;
        gameItem.y += gameItem.speedY;
    }

    function redrawGameItem(id, gameItem) {
        $(id).css("left", gameItem.x);
        $(id).css("top", gameItem.y);
    }

    function repositionAllGameItems() {
        repositionGameItem(paddleLeft);
        repositionGameItem(paddleRight);
        repositionGameItem(ball);
    }

    function redrawAllGameItems() {
        redrawGameItem("#paddleLeft", paddleLeft);
        redrawGameItem("#paddleRight", paddleRight);
        redrawGameItem("#ball", ball);
    }

    var i = 1;
    function pauseGame() {
        if (pIsDown) {
            if (i < 2) {
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
            i += 1;
        } else {
            i = 1;
        }
    }

    function activateCheatMode() {
        var answer = prompt("Password:");
        if (answer === "^^vv<><>ba") {
            cheatModeActivated = true;
            alert("Cheat Mode Activated!");
        } else {
            alert("Wrong Password.");
            cheatModeActivated = false;
        }
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
