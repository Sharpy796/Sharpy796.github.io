/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()

function runProgram() {
    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////// SETUP /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // Constant Variables
    var FRAMES = 60; // default is 60
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

    var ball0 = createGameObject(340, 210, -5, -2.5, "#ball0");         // ball

    var ballNullLeft = createGameObject(99999, 210, 0, 0, "#ballNull");
    var ballNullRight = createGameObject(-99999, 210, 0, 0, "#ballNull");

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
    var firstTimeBouncedPaddle = true;
    var firstTimeBouncedWall = true;
    var firstTimePaused = true;;
    var cheatMode = false;
    var freePlay = false;
    var autoPlay = true;
    var multiBall = true;
    var slowDown = false;
    var ballPit = [];
    ballPit.push(ball0);
    var targetedBallLeft = ballNullLeft;
    var targetedBallRight = ballNullRight;
    var debug = false;
    var gameWon = false;
    var ppfStop = 0; // Pixels Per Frame at rest
    var ppf = 5;     // Pixels Per Frame
    var xDirection = -1;
    var varVelocityY = 5;
    var varPredictedPositionY = 0;

    function join(delimiter, arg1, arg2, arg3) {
        return arg1.concat(delimiter, arg2, delimiter, arg3)
    }

    alert(  "Welcome to Pong!\n" +
            "P1 Controls: W S\n" +
            "P2 Controls: Up Down\n" +
            "Pause: Space");

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////// CORE LOGIC ///////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /* 
    On each "tick" of the timer, a new frame is dynamically drawn using JavaScript
    by calling this function and executing the code inside.
    */
    var ballCount = 15;
    var ticksPerBall = 50;
    var ticks = 0;
    function newFrame() {
        if (ticks == 0) {
            alert(ballCount + " balls\n interval of 1 ball per " + ticksPerBall + " frames");
        }
        if (!pause) {
            ticks++;
            targetBall();
            if (debug) {
                // console.log(ticks);
            }
        }
        if (slowDown) {
            if (ticks > 160) {FRAMES = 1;}
            if (ticks > 170) {FRAMES = 60;}
            if (ticks > 265) {FRAMES = 1;}
            if (ticks > 280) {FRAMES = 60;}
            if (ticks > 370) {FRAMES = 1;}
            modifyGameSpeed();
        }
        if (multiBall) {
            if (ticks%ticksPerBall == 0 && ticks <= ticksPerBall*(ballCount-1)) {
                createNewBall();
                // getBallPitTelemetry();
            }
        }
        updateTemporaryVelocity(ball0);
        pauseGame();
        changeColors()
        if (debug) {
            showTelemetries();
            // getCollisionTelemetry(ball0, paddleLeft);
        }
        handleCollisions();
        if (!gameWon) {
            redrawAllGameItems();
            if (!pause) {
                handleVelocity();
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
                paddleLeft.speed.up = ppf;
                console.log("w pressed");
            } if (keycode === KEY.A) {          // left
                console.log("a pressed");
            } if (keycode === KEY.S) {          // down
                paddleLeft.speed.down = ppf;
                console.log("s pressed");
            } if (keycode === KEY.D) {          // right
                console.log("d pressed");
            }

            /* P2 controls */
            if (keycode === KEY.UP) {           // up
                paddleRight.speed.up = ppf;
                console.log("up pressed");
            } if (keycode === KEY.LEFT) {       // left
                console.log("left pressed");
            } if (keycode === KEY.DOWN) {       // down
                paddleRight.speed.down = ppf;
                console.log("down pressed");
            } if (keycode === KEY.RIGHT) {      // right
                console.log("right pressed");
            }

        }
        /* ball controls */
        if (cheatMode) {
            if (firstTimeCheat) {
                ball0.speed.up = 0;
                ball0.speed.left = 0;
                ball0.speed.down = 0;
                ball0.speed.right = 0;
            }
            firstTimeCheat = false;
            if (keycode === KEY.U) {        // up
                ball0.speed.up = ppf;
                console.log("u pressed");
            } if (keycode === KEY.H) {      // left
                ball0.speed.left = ppf;
                console.log("h pressed");
            } if (keycode === KEY.J) {      // down
                ball0.speed.down = ppf;
                console.log("j pressed");
            } if (keycode === KEY.K) {      // right
                ball0.speed.right = ppf;
                console.log("k pressed");
            }
        } else {
            ball0.speed.up = ball0.temporaryVelocity.up;
            ball0.speed.left = ball0.temporaryVelocity.left;
            ball0.speed.down = ball0.temporaryVelocity.down;
            ball0.speed.right = ball0.temporaryVelocity.right;
            firstTimeCheat = true;
        }

    }

    function handleKeyUp(event) { // TODO: Create a global ppf (pixels per frame) speed
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
                paddleLeft.speed.up = ppfStop;
                console.log("w released");
            } if (keycode === KEY.A) {
                paddleLeft.speed.left = ppfStop;
                console.log("a released");
            } if (keycode === KEY.S) {
                paddleLeft.speed.down = ppfStop;
                console.log("s released");
            } if (keycode === KEY.D) {
                paddleLeft.speed.right = ppfStop;
                console.log("d released");
            }

            /* P2 controls */
            if (keycode === KEY.UP) {
                paddleRight.speed.up = ppfStop;
                console.log("up released");
            } if (keycode === KEY.LEFT) {
                paddleRight.speed.left = ppfStop;
                console.log("left released");
            } if (keycode === KEY.DOWN) {
                paddleRight.speed.down = ppfStop;
                console.log("down released");
            } if (keycode === KEY.RIGHT) {
                paddleRight.speed.right = ppfStop;
                console.log("right released");
            }

            /* ball controls */
            if (cheatMode) {
                if (keycode === KEY.U) {
                    ball0.speed.up = ppfStop;
                    console.log("u released");
                } if (keycode === KEY.H) {
                    ball0.speed.left = ppfStop;
                    console.log("h released");
                } if (keycode === KEY.J) {
                    ball0.speed.down = ppfStop;
                    console.log("j released");
                } if (keycode === KEY.K) {
                    ball0.speed.right = ppfStop;
                    console.log("k released");
                }
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    function createGameObject(x, y, velocityX, velocityY, id) {
        var gameObject = {};
        gameObject.id = id;
        gameObject.x = x;
        gameObject.y = y;
        gameObject.speed = {}
        if (velocityX < 0) {
            gameObject.speed.left = -velocityX;
            gameObject.speed.right = 0;
        } else {
            gameObject.speed.left = 0;
            gameObject.speed.right = velocityX;
        }
        if (velocityY < 0) {
            gameObject.speed.up = -velocityY;
            gameObject.speed.down = 0;
        } else {
            gameObject.speed.up = 0;
            gameObject.speed.down = velocityY;
        }
        gameObject.velocityX = gameObject.speed.left + gameObject.speed.right;
        gameObject.velocityY = gameObject.speed.up + gameObject.speed.down;
        if (gameObject.id.includes("#ball")) {
            gameObject.temporaryVelocity = {}
            gameObject.temporaryVelocity.up = gameObject.speed.up;
            gameObject.temporaryVelocity.left = gameObject.speed.left;
            gameObject.temporaryVelocity.down = gameObject.speed.down;
            gameObject.temporaryVelocity.right = gameObject.speed.right;
        }
        return gameObject;
    }

    function restartTimer() {
        framesPerSecondInterval = 1000 / (FRAMES + score.bounced * 2);
        interval = setInterval(newFrame, framesPerSecondInterval);
    }

    function modifyTimer() {
        framesPerSecondInterval = 1000 / FRAMES;
        interval = setInterval(newFrame, framesPerSecondInterval);
    }


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    /////////////// Velocity \\\\\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function showTelemetries() {
        var signLeft = 1;
        var signRight = 1;
        if (targetedBallLeft.id == "#ballNull") {signLeft=-1;}
        if (targetedBallRight.id == "#ballNull") {signRight=-1;}

        // Targeted Left Telemetries
        $("#speeds b").text("Targeted Left: " + targetedBallLeft.id + " (SignLeft " + signLeft + ")");
        $("#up span").text("PaddleLeft X: " + paddleLeft.x + " | PaddleLeft Y: " + paddleLeft.y);
        $("#left span").text("Targeted X: " + targetedBallLeft.x);
        $("#down span").text("VelocityX: " + targetedBallLeft.velocityX);
        $("#right span").text("Target Calc Time: " + calculateTime(paddleLeft, targetedBallLeft, targetedBallLeft)*signLeft);

        // Targeted Right Telemetries
        $("#tempSpeeds b").text("Targeted Right: " + targetedBallRight.id + " (SignRight " + signRight + ")");
        $("#tempUp span").text("PaddleRight X: " + paddleRight.x + " | PaddleRight Y: " + paddleRight.y);
        $("#tempLeft span").text("Targeted X: " + targetedBallRight.x);
        $("#tempDown span").text("VelocityX: " + targetedBallRight.velocityX);
        $("#tempRight span").text("Target Calc Time: " + calculateTime(paddleRight, targetedBallRight, targetedBallRight)*signRight);

        // Ball0 Telemetries
        $("#0Speeds b").text("Ball0: " + ball0.id);
        $("#0Up span").text("Ball0 X: " + ball0.x + " | Ball0 Y: " + ball0.y);
        $("#0Left span").text("VelocityX: " + ball0.velocityX);
        $("#0Left2 span").text("VelocityY: " + ball0.velocityY);
        $("#0Down span").text("Left Pred Position: " + predictBallPosition(paddleLeft, ball0, ball0));
        $("#0Right span").text("Right Pred Position: " + predictBallPosition(paddleRight, ball0, ball0));
    }

    function tellVelocities(ballObj) {
        console.log("Velocities:" +
            "\nUp:    " + ballObj.speed.up +
            "\nLeft:  " + ballObj.speed.left +
            "\nDown:  " + ballObj.speed.down +
            "\nRight: " + ballObj.speed.right +
            "\nTemp Velocities:" +
            "\nUp:    " + ballObj.temporaryVelocity.up +
            "\nLeft:  " + ballObj.temporaryVelocity.left +
            "\nDown:  " + ballObj.temporaryVelocity.down +
            "\nRight: " + ballObj.temporaryVelocity.right);
    }

    function updateTemporaryVelocity(ballObj) {
        if (!pause && !cheatMode) {
            ballObj.temporaryVelocity.up = ballObj.speed.up;
            ballObj.temporaryVelocity.left = ballObj.speed.left;
            ballObj.temporaryVelocity.down = ballObj.speed.down;
            ballObj.temporaryVelocity.right = ballObj.speed.right;
        }
    }

    function handleVelocity() {
        // p1 Velocity
        paddleLeft.velocityX = paddleLeft.speed.right - paddleLeft.speed.left;
        paddleLeft.velocityY = paddleLeft.speed.down - paddleLeft.speed.up;

        // p2 Velocity
        paddleRight.velocityX = paddleRight.speed.right - paddleRight.speed.left;
        paddleRight.velocityY = paddleRight.speed.down - paddleRight.speed.up;

        // ballPit Velocity
        for (let ball of ballPit) {
            ball.velocityX = ball.speed.right - ball.speed.left;
            ball.velocityY = ball.speed.down - ball.speed.up;
        }
    }

    function increaseGameSpeed() {
        clearInterval(interval);
        setTimeout(restartTimer, 0);
    }

    function modifyGameSpeed() {
        clearInterval(interval);
        setTimeout(modifyTimer, 0);
    }

    function randBallVelocityY(ballObj) {
        var randNum = -999;
        while (randNum >= 5 || randNum <= -5) {
            randNum = Math.random() * 10;
        }
        varVelocityY = randNum;
        if (ballObj.velocityY > 0) {
            ballObj.speed.up = varVelocityY;
            ballObj.speed.down = 0;
        } else if (ballObj.velocityY < 0) {
            ballObj.speed.up = 0;
            ballObj.speed.down = varVelocityY;
        }
        console.log("changed " + ballObj.id + " velocityY to " + varVelocityY);
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
            } else if (multiBall) {
                alert("Cannot activate Cheat Mode because MultiBall is activated.\nType 'noMulti' to deactivate it.");
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

        // MultiBall Activation 
        // TODO: Add a prompt to input an amount of balls
        // TODO: Figure out how to restart the game without reloading the page
        // TODO: Figure out which modes need to accompany MultiBall for it to work properly
        else if (answer === "multiBall") {
            if (cheatMode) {
                alert("Cannot activate MultiBall because Cheat Mode is activated.\nType 'noCheat' to deactivate it.");
                multiBall = false;
            } else if (multiBall) {
                alert("MultiBall is already activated.\nType 'noMulti' to deactivate it.");
                multiBall = true;
            } else {
                alert("MultiBall Activated!\nType 'noMulti' to deactivate MultiBall.");
                multiBall = true;
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

        // AutoPlay Deactivation TODO: have paddles snap to a multiple of fo the current ppf (5)
        else if (answer === "noAuto") {
            if (autoPlay) {
                alert("AutoPlay Deactivated.\nType 'autoPlay' to activate AutoPlay.");
            } else {
                alert("AutoPlay is already deactivated.\nType 'autoPlay' to activate it.");
            }
            autoPlay = false;
        }

        // MultiBall Deactivation
        else if (answer === "noMulti") {
            if (multiBall) {
                alert("MultiBall Deactivated.\nType 'multiBall' to activate MultiBall.");
            } else {
                alert("MultiBall is already deactivated.\nType 'multiBall' to activate it.");
            }
            multiBall = false;
        }

        // Wrong Password
        else {
            alert("Wrong Password.");
        }

    }

    function createNewBall() {
        // create a new id for the ball
        var ballId = 'ball' + (ballPit.length);
        // create a new div for the ball
        var $newBall = $("<div>")
            .appendTo('#ballPit')
            .addClass('gameItem balls')
            // .addClass('balls')
            .attr("id", ballId)
            .css("left", 340)
            .css("top", 210)
            // .css("width", 20)
            // .css("height", 20)
            .css("background-color", "orange");
        // store the new div in a variable
        xDirection *= -1;
        $newBall = createGameObject(340, 210, 5*xDirection, -2.5, "#"+ballId)
        randBallVelocityY($newBall)
        // push the new body into the ballPit
        ballPit.push($newBall);
        console.log("#"+ballId+" created!")
    }

    function targetBall() {
        for (let ball of ballPit) {

            if (targetedBallLeft.velocityX >= 0 ||
                targetedBallLeft.x <= (paddleLeft.x)
                ) {
                    targetedBallLeft = ballNullLeft;
            }
            if (targetedBallRight.velocityX <= 0 ||
                targetedBallRight.x >= (paddleRight.x)
                ) {
                    targetedBallRight = ballNullRight;
            }

            var signLeft = 1;
            var signRight = 1;
            if (targetedBallLeft.id == "#ballNull") {signLeft=-1;}
            if (targetedBallRight.id == "#ballNull") {signRight=-1;}


            if (ball.velocityX < 0 && 
                ball.x > (paddleLeft.x) && 
                ball.x < targetedBallLeft.x
                ) {
                targetedBallLeft = ball;
                console.log(targetedBallLeft.id + " is being targeted by LeftPaddle!");
            }
            else if (ball.velocityX > 0 && 
                ball.x < paddleRight.x && 
                ball.x > targetedBallRight.x
                ) {
                targetedBallRight = ball;
                // console.log(targetedBallRight.id + " is being targeted by RightPaddle!");
            }
            // console.log("Calculated Time Left: " + calculateTime(paddleLeft, each, each));
            // console.log(calculateTime(paddleLeft, each, each));
        }
        // console.log("Left Target: "+targetedBallLeft.id+"\nRight Target: "+targetedBallRight.id);
    }

    function changeColors() {

        if (pause) {
            // $(".balls").css("background-color", "lime");
        } else {
            
            for (let ball of ballPit) {
                if (ball != targetedBallLeft && ball != targetedBallRight) {$(ball.id).css("background-color", "fuchsia");}
                if (ball.velocityX < 0) {$(ball.id).css("background-color", "blue");}
                if (ball.velocityX > 0) {$(ball.id).css("background-color", "maroon");}
                if (ball == targetedBallLeft) {$(ball.id).css("background-color", "cyan");}
                if (ball == targetedBallRight) {$(ball.id).css("background-color", "hotpink");}
                
                $(ball.id).text(ball.id.replace(/\D/g, '')).css("text-align", "center");
            }
        }

        if (cheatMode) {
            if (pause) {
                $("#ball0").css("background-color", "palegreen");
                $("#ball0").css("box-shadow", "0px 0px 0px 5px lime inset");
            } else {
                $("#ball0").css("background-color", "lightpink");
                $("#ball0").css("box-shadow", "0px 0px 0px 5px fuchsia inset");
            }
        } else {
            $("#ball0").css("box-shadow", "none");
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
        for (let ball of ballPit) {
            updateObjectBorders(ball);
        }

        // keep the objects in the borders
        enforceNoNoZone(paddleLeft);
        enforceNoNoZone(paddleRight);
        if (cheatMode) {
            for (let ball of ballPit) {
                enforceNoNoZone(ball);
            }
        } else {
            for (let ball of ballPit) {
                bounceBall(ball);
                enforceNoNoZone(ball);
            }
        }

        // check if the ball is touching the paddles
        for (let ball of ballPit){
            if (doCollide(ball, paddleLeft)) {
                console.log("ping");
                handlePaddleCollisions(paddleLeft);     // left paddle
            } else if (doCollide(ball, paddleRight)) {
                console.log("pong");
                handlePaddleCollisions(paddleRight);    // right paddle
            } else {
                // tell us we still have yet to bounce
                firstTimeBouncedPaddle = true;
            }
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
            // obj.x -= obj.velocityX;
            console.log(obj.id + " passed left border")
        }
        if (obj.topY < BORDERS.TOP) {
            if (ballPit.includes(obj)) {
                obj.y -= -5;
            } else if (autoPlay) {
                obj.y = BORDERS.TOP;
            } else {
                obj.y -= -5;
            }
            // obj.y -= obj.velocityY;
            console.log(obj.id + " passed top border")
        }
        if (obj.rightX > BORDERS.RIGHT) {
            obj.x -= 5;
            // obj.x -= obj.velocityX;
            console.log(obj.id + " passed right border")
        }
        if (obj.bottomY > BORDERS.BOTTOM) {
            if (ballPit.includes(obj)) {
                obj.y -= 5;
            } else if (autoPlay) {
                obj.y = BORDERS.BOTTOM - $(obj.id).height();
            } else {
                obj.y -= 5;
            }
            // obj.y -= obj.velocityY;
            console.log(obj.id + " passed bottom border")
        }
    }

    function bounceBall(ballObj) {
        if (ballObj.leftX < BORDERS.LEFT) {
            if (freePlay) {
                ballObj.speed.right = ballObj.speed.left;
                // ballObj.speed.right = 5;
                ballObj.speed.left = 0;
            }
            playerLose(p1.id);
            console.log(ballObj.id+" bounced left border");
        }
        else if (ballObj.topY < BORDERS.TOP) {
            ballObj.speed.down = ballObj.speed.up;
            // ballObj.speed.down = 5;
            ballObj.speed.up = 0;
            console.log(ballObj.id+" bounced top border");
        }
        else if (ballObj.rightX > BORDERS.RIGHT) {
            if (freePlay) {
                ballObj.speed.left = ballObj.speed.right;
                // ballObj.speed.left = 5;
                ballObj.speed.right = 0;
            }
            playerLose(p2.id);
            console.log(ballObj.id+" bounced right border");
        }
        else if (ballObj.bottomY > BORDERS.BOTTOM) {
            ballObj.speed.up = ballObj.speed.down;
            // ballObj.speed.up = 5;
            ballObj.speed.down = 0;
            console.log(ballObj.id+" bounced bottom border");
        }
        else {
            // tell us we still have yet to bounce
            firstTimeBouncedWall = true
        }
    }

    function handlePaddleCollisions(paddle) { // TODO: Something happens when I absolutely *nail* the calculations. Gotta figure out what's happening.
        // if it is the first time bouncing on one
        if (firstTimeBouncedPaddle) {
            // Mix up the ball's predicted position in AutoPlay
            randPredictedPositionYMod();
            // if it bounced off the paddle's left border
            for (let ball of ballPit) {
                if (whichBorder(ball, paddle) === "left") {
                    // tell where the ball is and should have been
                    console.log("Predicted Position: TBD");
                    console.log("Actual Position: " + ball.y);
                    // bounce the ball left
                    ball.speed.left = 5;
                    ball.speed.right = 0;
                    ball.x -= 5;
                    // increase the score
                    if (paddle === paddleRight) {
                        score.bounced++;
                        if (!multiBall) {
                            increaseGameSpeed();
                        }
                    }
                    console.log(ball.id+" bounced " + tellPaddle(paddle) + " paddle's left border");
                }
                // if it bounced off the paddle's right border
                else if (whichBorder(ball, paddle) === "right") {
                    // tell where the ball is and should have been
                    console.log("Predicted Position: TBD");
                    console.log("Actual Position: " + ball.y);
                    // bounce the ball right
                    ball.speed.left = 0;
                    ball.speed.right = 5;
                    ball.x += 5;
                    // increase the score
                    if (paddle === paddleLeft) {
                        score.bounced++;
                        if (!multiBall) {
                            increaseGameSpeed();
                        }
                    }
                    console.log(ball.id+" bounced " + tellPaddle(paddle) + " paddle's right border");
                }
            }
        }
        // tell us it isn't the first time bouncing anymore
        firstTimeBouncedPaddle = false;
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

            return true;
        } else {
            return false;
        }
    }

    function getCollisionTelemetry(obj1, obj2) {
        console.log("---------------------------");
        console.log(">>> COLLISION DETECTION <<<");
        console.log("Do " + obj1.id + " and " + obj2.id + " collide? " + doCollide(obj1, obj2));
        console.log("They collide on the paddle's *" + whichBorder(obj1, obj2) + "* border.");
        console.log("Calculated Time: " + calculateTime(obj2, obj1, obj1));
        console.log("Predicted Position: " + predictBallPosition(obj2, obj1));
        console.log("paddleLeft.y = " + obj2.y);
        console.log("Predicted Movement: " + (predictBallPosition(obj2, obj1)-obj2.y) / (calculateTime(obj2, obj1, obj1)))
        console.log("---------------------------");
        console.log("OBJECT 1: " + obj1.id);
        console.log("xLeft: " + obj1.leftX);
        console.log("xRight: " + obj1.rightX);
        console.log("yTop: " + obj1.topY);
        console.log("yBottom: " + obj1.bottomY);
        console.log("---------------------------");
        console.log("OBJECT 2: " + obj2.id);
        console.log("xLeft: " + obj2.leftX);
        console.log("xRight: " + obj2.rightX);
        console.log("yTop: " + obj2.topY);
        console.log("yBottom: " + obj2.bottomY);
        console.log("---------------------------")
    }


    ///////////////////\\\\\\\\\\\\\\\\\\\
    /////////////// Points \\\\\\\\\\\\\\\
    ///////////////////\\\\\\\\\\\\\\\\\\\

    function playerLose(player) {
        if (firstTimeBouncedWall) {
            if (player === p1.id) {             // player 1's side
                score.p2++;
                console.log("P2 scored a point! Total: " + score.p2);
                $("#p2").text(score.p2);
            } else if (player === p2.id) {      // player 2's side
                score.p1++;
                console.log("P1 scored a point! Total: " + score.p1);
                $("#p1").text(score.p1);
            } else {
                console.log(text.error);
            }
        }
        if (!freePlay) {
            whoWon();
            if (!gameWon) {
                $("balls").css("background-color", "red");
                clearInterval(interval);
                setTimeout(restartGame.bind(null, player), 1000);
            }
        }
        // tell us it isn't the first time bouncing anymore
        firstTimeBouncedWall = false;
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
        ticks = 0;
        restartTimer();
        for (let ball of ballPit) {
            if (ball != ball0) {
                $(ball.id).remove();
            }
        }
        ballPit.splice(1, ballPit.length);
        console.log(ballPit);
        $("balls").css("background-color", "fuchsia");
        for (let ball of ballPit) {
            ball.x = 340;
            ball.y = 210;
            randBallVelocityY(ball);
            if (player === p1.id) {
                ball.speed.left = 0;
                ball.speed.right = 5;
            } else if (player === p2.id) {
                ball.speed.left = 5;
                ball.speed.right = 0;
            } else {
                alert(text.error + " in restartGame " + player);
            }
        }
        paddleLeft.y = 180;
        paddleRight.y = 180;
    }


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    //////////// Repositioning \\\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function randPredictedPositionYMod() {
        varPredictedPositionY = Math.floor(Math.random() * 60) - 30;
        console.log("predicted ball position modified by " + varPredictedPositionY);
    }

    /**
     * Calculates the amount of frames it will take for one point to reach the second point.
     * - Distance from point A to point B...
     * - Divided by distance/frame.
     * @param {double} pointA - The first point of reference.
     * @param {double} pointB - The second point of reference (which has a velocity).
     * @param {double} velocity - The pixels/frame velocity of one of the two points.
     */
    function calculateTime(pointA, pointB, velocity) {
        var predictedPosition;
        if (pointA.id == "#paddleLeft") {
            predictedPosition = ((pointA.rightX)-pointB.x)/velocity.velocityX;
        } else if (pointA.id == "#paddleRight") {
            predictedPosition = (pointA.x-(pointB.rightX))/velocity.velocityX;
        } else {
            predictedPosition = (pointA.x-pointB.x)/velocity.velocityX; 
        }
        return predictedPosition;
    }

    /**
     * Algorithm to predict the ball's future position upon meeting the X value of an object.
     * - We start with `ball.y`, the ball's initial height.
     *   - This will increase as the ball moves upward.
     * - We then `calculateTime()` the ball takes to get to the object's X value.
     * - We multiply that time by the `ball.velocityY` (frames * dist/frames) to get how far up the 
     *   ball would move by the time it reaches the object.
     *   - This will decrease as the ball moves closer to the object.
     * - We then add that total Y displacement to the current `ball.y` to get a predicted Y position.
     * - After that we subtract half the object's height and add half the ball's height to center the
     *   object on the ball.
     * @param {object} obj - The object to use as a second point of reference.
     * @returns {double} The Y position of the ball where it meets the object's X position.
     */
    function predictBallPosition(obj, ballObj) {
        var predictedPosition = ballObj.y + (calculateTime(obj, ballObj, ballObj)*(ballObj.velocityY));
        if (predictedPosition < BORDERS.TOP) {predictedPosition = -predictedPosition;}
        else if (predictedPosition > BORDERS.BOTTOM) {predictedPosition = Math.floor(BORDERS.BOTTOM) + ((Math.floor(BORDERS.BOTTOM) - $(ballObj.id).height()*2) - predictedPosition);}
        
        return predictedPosition - $(obj.id).height()/2 + $(ballObj.id).height()/2 + varPredictedPositionY;
    }

    /**
     * Calculates the pixels/frame required for an object to catch the ball in time.
     * - First, we find the distance between the ball's predicted Y position and the 
     *   object's current Y position.
     * - Then, we calculate the amount of frames it will take for the ball's X position
     *   to reach the object's X position.
     * - We divide pixels by frames, and we get a velocity.
     * - Sometimes the calculated time is zero. We force the added value to be 0 to prevent a Divide By Zero error.
     * @param {object} gameItem - The object whose required velocity will be calculated. 
     * @returns {double} The Y velocity required to reach the ball before it passes the object up.
     */
    function moveToPredictedBallPosition(gameItem, ballObj) {
        var predictedMovement = predictBallPosition(gameItem, ballObj) - gameItem.y;
        var calculatedTime = calculateTime(gameItem, ballObj, ballObj);
        
        if (calculatedTime == 0) {gameItem.velocityY = 0;} 
        else {gameItem.velocityY = predictedMovement / calculatedTime;}
    }

    function repositionGameItem(gameItem) {
        gameItem.x += gameItem.velocityX;
        gameItem.y += gameItem.velocityY;
    }

    function repositionAllGameItems() {
        // Paddle Repositioning
        if (autoPlay) {
            if (targetedBallLeft.id != "#ballNull") {moveToPredictedBallPosition(paddleLeft, targetedBallLeft);}
            if (targetedBallRight.id != "#ballNull") {moveToPredictedBallPosition(paddleRight, targetedBallRight);}
        }
        repositionGameItem(paddleLeft);
        repositionGameItem(paddleRight);
        // Ball Repositioning
        for (let ball of ballPit) {
            repositionGameItem(ball);
        }
    }


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    ////////////// Redrawing \\\\\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function redrawGameItem(gameItem) {
        $(gameItem.id).css("left", gameItem.x);
        $(gameItem.id).css("top", gameItem.y);
    }

    function redrawScores() { // TODO: Put the scores in a better place.
        $("#bouncedLeft").text(score.bounced);
        $("#bouncedRight").text(score.bounced);
    }

    function redrawAllGameItems() {
        redrawGameItem(paddleLeft);
        redrawGameItem(paddleRight);
        for (let ball of ballPit) {
            redrawGameItem(ball);
        }
        redrawScores();
    }

    function endGame() {
        // stop the interval timer
        clearInterval(interval);

        // turn off event handlers
        $(document).off();
    }
}
