/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()

function runProgram() {
    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////// SETUP /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // Constant Variables
    var FRAMES = 60;
    var framesPerSecondInterval = 1000 / FRAMES;
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
    var interval = setInterval(newFrame, framesPerSecondInterval);   // execute newFrame every 0.0166 seconds (60 frames per second)
    $(document).on("keydown", handleKeyDown);       // listen for keydown events
    $(document).on("keyup", handleKeyUp);           // listen for keyup events
    $("#cheatIcon").on("click", activateCheatMode); // listen for click events
    $("#cheatIcon").hide();

    var pause = false;
    var spaceIsDown = false
    var firstTimeCheat = true;
    var firstTimeBounced = true;
    var firstTimePaused = true;;
    var cheatMode = false;
    var freePlay = false;
    var autoPlay = false;
    var gameWon = false;
    var varSpeedX = 5;
    var varSpeedY = 5;

    // alert("Welcome to Pong!\nP1 Controls: W A S D\nP2 Controls: Up Down Left Right\nPause: Space");

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
        changeColors()
        handleCollisions();
        if (!gameWon) {
            redrawAllGameItems();
            if (!pause) {
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

        if (!autoPlay) {
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
            if (cheatMode) {
                if (firstTimeCheat) {
                    ball.speed.up = 0;
                    ball.speed.left = 0;
                    ball.speed.down = 0;
                    ball.speed.right = 0;
                }
                firstTimeCheat = false;
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
                firstTimeCheat = true;
            }
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

        if (!autoPlay) {
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
            if (cheatMode) {
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

    function restartTimer() {
        framesPerSecondInterval = 1000 / (FRAMES + score.bounced * 2);
        interval = setInterval(newFrame, framesPerSecondInterval);
    }


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    //////////////// Speed \\\\\\\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function updateTemporarySpeed() {
        if (!pause && !cheatMode) {
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

    function increaseBallSpeedX() {
        clearInterval(interval);
        setTimeout(restartTimer, 0);
    }

    function randBallSpeedY() {
        var randNum = 0;
        while (randNum >= 5 || randNum <= 1) {
            randNum = Math.floor(Math.random() * 10);
        }
        varSpeedY = randNum;
        if (ball.speedY > 0) {
            ball.speed.up = varSpeedY;
            ball.speed.down = 0;
        } else if (ball.speedY < 0) {
            ball.speed.up = 0;
            ball.speed.down = varSpeedY;
        }
        console.log("changed ball speedY to " + varSpeedY);
    }


    ///////////////////\\\\\\\\\\\\\\\\\\\
    ////////// Pause and Cheats \\\\\\\\\\
    ///////////////////\\\\\\\\\\\\\\\\\\\

    function pauseGame() {
        if (spaceIsDown) {
            if (firstTimePaused) {
                if (pause) {
                    pause = false;
                    $("#cheatIcon").hide();
                    console.log("unpause");
                } else {
                    pause = true;
                    $("#cheatIcon").show();
                    console.log("pause");
                }
            }
            firstTimePaused = false;
        } else {
            firstTimePaused = true;
        }
    }

    function activateCheatMode() {
        var answer = prompt("Password:");

        // Cheat Mode Activation
        if (answer === "^^vv<><>ba") {
            if (autoPlay) {
                alert("Cannot activate Cheat Mode because AutoPlay is activated.\nType 'noAuto' to deactivate it.");
                cheatMode = false;
            } else if (cheatMode) {
                alert("Cheat Mode is already activated.\nType 'noCheat' to deactivate it.");
                cheatMode = true;
            } else {
                alert("Cheat Mode Activated!\nUse these controls to move the ball:\nU: Up\nH: Left\nJ: Down\nK: Right\nType 'noCheat' to deactivate Cheat Mode.");
                cheatMode = true;
            }
        }

        // FreePlay Activation
        else if (answer === "freePlay") {
            if (freePlay) {
                alert("FreePlay is already activated.\nType 'noFree' to deactivate it.");
            } else {
                alert("FreePlay Activated!\nType 'noFree' to deactivate FreePlay.");
            }
            freePlay = true;
        }

        // AutoPlay Activation
        else if (answer === "autoPlay") {
            if (cheatMode) {
                alert("Cannot activate AutoPlay because Cheat Mode is activated.\nType 'noCheat' to deactivate it.");
                autoPlay = false;
            } else if (autoPlay) {
                alert("AutoPlay is already activated.\nType 'noAuto' to deactivate it.");
                autoPlay = true;
            } else {
                alert("AutoPlay Activated!\nType 'noAuto' to deactivate AutoPlay.");
                autoPlay = true;
            }
        }

        // Cheat Mode Deactivation
        else if (answer === "noCheat") {
            if (cheatMode) {
                alert("Cheat Mode Deactivated.\nType the password to activate Cheat Mode.");
            } else {
                alert("Cheat Mode is already deactivated.\nType the password to activate it.");
            }
            cheatMode = false;
        }

        // FreePlay Deactivation
        else if (answer === "noFree") {
            if (freePlay) {
                alert("FreePlay Deactivated.\nType 'freePlay' to activate FreePlay.");
            } else {
                alert("FreePlay is already deactivated.\nType 'freePlay' to activate it.");
            }
            freePlay = false;
        }

        // Autoplay Deactivation
        else if (answer === "noAuto") {
            if (autoPlay) {
                alert("AutoPlay Deactivated.\nType 'autoPlay' to activate Cheat Mode.");
            } else {
                alert("AutoPlay is already deactivated.\nType 'autoPlay' to activate it.");
            }
            autoPlay = false;
        }

        // Wrong Password
        else {
            alert("Wrong Password.");
            autoPlay = false;
        }

    }

    function changeColors() {
        if (pause) {
            $("#ball").css("background-color", "lime");
        } else {
            $("#ball").css("background-color", "fuchsia");
        }

        if (cheatMode) {
            if (pause) {
                $("#ball").css("background-color", "palegreen");
                $("#ball").css("box-shadow", "0px 0px 0px 5px lime inset");
            } else {
                $("#ball").css("background-color", "lightpink");
                $("#ball").css("box-shadow", "0px 0px 0px 5px fuchsia inset");
            }
        } else {
            $("#ball").css("box-shadow", "none");
        }

        if (freePlay) {
            $("#board").css("border-color", "orange");
        } else {
            $("#board").css("border-color", "white");
        }

        if (autoPlay) {
            $("#paddleLeft").css("background-color", "cyan");
            $("#paddleLeft").css("box-shadow", "0px 0px 0px 3px teal inset");
            $("#paddleRight").css("background-color", "hotpink");
            $("#paddleRight").css("box-shadow", "0px 0px 0px 3px maroon inset");
        } else {
            $("#paddleLeft").css("background-color", "teal");
            $("#paddleLeft").css("box-shadow", "none");
            $("#paddleRight").css("background-color", "maroon");
            $("#paddleRight").css("box-shadow", "none");
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
        if (cheatMode) {
            enforceNoNoZone(ball);
        } else {
            bounceBall(ball);
        }

        // check if the ball is touching the paddles
        if (doCollide(ball, paddleLeft)) {
            handlePaddleCollisions(paddleLeft);     // left paddle
        } else if (doCollide(ball, paddleRight)) {
            handlePaddleCollisions(paddleRight);    // right paddle
        } else {
            // tell us we still have yet to bounce
            firstTimeBounced = true;
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
            if (obj === ball && !cheatMode) {
                obj.x -= -varSpeedX;
            } else {
                obj.x -= -5;
            }
            console.log(obj.id + " passed left border")
        }
        if (obj.topY < BORDERS.TOP) {
            if (obj === ball && !cheatMode) {
                obj.y -= -varSpeedY;
            } else if (autoPlay) {
                obj.y = BORDERS.TOP;
            } else {
                obj.y -= -5;
            }
            console.log(obj.id + " passed top border")
        }
        if (obj.rightX > BORDERS.RIGHT) {
            if (obj === ball && !cheatMode) {
                obj.x -= varSpeedX;
            } else {
                obj.x -= 5;
            }
            console.log(obj.id + " passed right border")
        }
        if (obj.bottomY > BORDERS.BOTTOM) {
            if (obj === ball && !cheatMode) {
                obj.y -= varSpeedY;
            } else if (autoPlay) {
                obj.y = BORDERS.BOTTOM - $(obj.id).height();
            } else {
                obj.y -= 5;
            }
            console.log(obj.id + " passed bottom border")

        }
    }

    function bounceBall() {
        if (ball.leftX < BORDERS.LEFT) {
            if (freePlay) {
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
            if (freePlay) {
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

    function handlePaddleCollisions(paddle) {
        // if it is the first time bouncing on one
        if (firstTimeBounced) {
            // if it bounced off the paddle's left border
            if (whichBorder(ball, paddle) === "left") {
                // bounce the ball left
                ball.speed.left = varSpeedX;
                ball.speed.right = 0;
                ball.x -= 1;
                // increase the score
                if (paddle === paddleRight) {
                    score.bounced++;
                    if (!cheatMode) {
                        increaseBallSpeedX();
                    }
                }
                console.log("ball bounced " + tellPaddle(paddle) + " paddle's left border");
            }
            // if it bounced off the paddle's right border
            else if (whichBorder(ball, paddle) === "right") {
                // bounce the ball right
                ball.speed.left = 0;
                ball.speed.right = varSpeedX;
                ball.x += 1;
                // increase the score
                if (paddle === paddleLeft) {
                    score.bounced++;
                    if (!cheatMode) {
                        increaseBallSpeedX();
                    }
                }
                console.log("ball bounced " + tellPaddle(paddle) + " paddle's right border");
            }
        }
        // tell us it isn't the first time bouncing anymore
        firstTimeBounced = false;
    }

    function whichBorder(obj1, obj2) {
        if ((obj1.rightX > obj2.leftX && obj1.leftX < (obj2.rightX - $(obj2.id).width() / 2)) &&    // right border is in the left border
            (obj1.topY < obj2.bottomY && obj1.bottomY > obj2.topY)) {                               // and the top and bottom borders are between the other's top and bottom borders
            return "left";
        }
        if ((obj1.leftX < obj2.rightX && obj1.rightX > (obj2.leftX + $(obj2.id).width() / 2)) &&    // left border is in the right border and the right border in halfway in the left border
            (obj1.topY < obj2.bottomY && obj1.bottomY > obj2.topY)) {                               // and the top and bottom borders are between the other's top and bottom borders
            return "right";
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
            console.log('boing')

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
        if (!freePlay) {
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
        }
        if (score.p2 >= 10) {
            $("#paddleRight").css("background-color", "lime");
            alert(text.p2 + "\n" + text.restart);
            gameWon = true;
            endGame();
        }
    }

    function restartGame(player) {
        score.bounced = 0;
        restartTimer();
        $("#ball").css("background-color", "fuchsia");
        ball.x = 340;
        ball.y = 210;
        varSpeedX = 5;
        randBallSpeedY();
        if (player === p1.id) {
            ball.speed.left = 0;
            ball.speed.right = varSpeedX;
        } else if (player === p2.id) {
            ball.speed.left = varSpeedX;
            ball.speed.right = 0;
        } else {
            alert(text.error + " in restartGame " + player);
        }
        paddleLeft.y = 180;
        paddleRight.y = 180;
    }


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    //////////// Repositioning \\\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function repositionGameItem(gameItem) {
        gameItem.x += gameItem.speedX;
        gameItem.y += gameItem.speedY;
    }

    function repositionAllGameItems() {
        if (autoPlay) {
            paddleLeft.y = ball.y - $(paddleLeft.id).height() / 2 + $(ball.id).height() / 2;
            paddleRight.y = ball.y - $(paddleRight.id).height() / 2 + $(ball.id).height() / 2;
        } else {
            repositionGameItem(paddleLeft);
            repositionGameItem(paddleRight);
        }
        repositionGameItem(ball);
    }


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    ////////////// Redrawing \\\\\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function redrawGameItem(gameItem) {
        $(gameItem.id).css("left", gameItem.x);
        $(gameItem.id).css("top", gameItem.y);
    }

    function redrawScores() {
        $("#bouncedLeft").text(score.bounced);
        $("#bouncedRight").text(score.bounced);
    }

    function redrawAllGameItems() {
        redrawGameItem(paddleLeft);
        redrawGameItem(paddleRight);
        redrawGameItem(ball);
        redrawScores();
    }

    function endGame() {
        // stop the interval timer
        clearInterval(interval);

        // turn off event handlers
        $(document).off();
    }
}
