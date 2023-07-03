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
        C: 67,      // cheat

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

    var paddleLeft = createGameObject(50, (BORDERS.BOTTOM/2)-($("#paddleLeft").height()/2), 0, 0, "#paddleLeft");    // player 1
    var p1 = paddleLeft;

    var paddleRight = createGameObject(BORDERS.RIGHT-50-$("#paddleRight").width(), (BORDERS.BOTTOM/2)-($("#paddleRight").height()/2), 0, 0, "#paddleRight"); // player 2
    var p2 = paddleRight;

    var ball0 = createGameObject((BORDERS.RIGHT/2)-($("#ball0").width()/2), (BORDERS.BOTTOM/2)-($("#ball0").height()/2), -5, -2.5, "#ball0");         // ball

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
    var firstTimePaused = true;
    var cheatMode = false;
    var freePlay = false;
    var autoPlay = false;
    var multiBall = false;
    var slowDown = false;
    var ballPit = [];
    ballPit.push(ball0);
    var targetedBallLeft = ballNullLeft;
    var targetedBallRight = ballNullRight;
    var debug = false;
    var gameWon = false;
    // var pageHasHadTimeToRedraw = false;
    var ppfStop = 0; // Pixels Per Frame at rest
    var ppf = 5;     // Pixels Per Frame
    var xDirection = -1;
    var varVelocityY = 5;
    var varPredictedPositionY = 0;
    var restartingRound = false;

    function join(delimiter, arg1, arg2, arg3) {
        return arg1.concat(delimiter, arg2, delimiter, arg3)
    }

    alert(  "Welcome to Pong!\n" +
            "P1 Controls: W S\n" +
            "P2 Controls: Up Down\n" +
            "Pause: Space\n" + 
            "Restart: R");

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
        if (ticks == 1) {
            // alert(ballCount + " balls\n interval of 1 ball per " + ticksPerBall + " frames");
        }
        if (!pause) {
            ticks++;
            if (multiBall && ticks%ticksPerBall == 0 && ticks <= ticksPerBall*(ballCount-1)) {
                createNewBall();
                // getBallPitTelemetry();
            }
            targetBall();
            // if (true) {
            if (debug) {
                console.log(ticks);
                console.log(framesPerSecondInterval);
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
        updateTemporaryVelocity(ball0);
        pauseGame();
        changeColors()
        if (debug) {
            showTelemetries();
            // getCollisionTelemetry(ball0, paddleLeft);
        }
        handleCollisions();
        redrawAllGameItems();
        if (!gameWon) {
            if (!pause) {
                handleVelocity();
                repositionAllGameItems();
            }
        } //else {
        //     if (pageHasHadTimeToRedraw) {
        //         restartGame(p1.id);
        //     }
        //     pageHasHadTimeToRedraw = true;
        // }
    }

    /* 
    Called in response to events.
    */
    function handleKeyDown(event) { // TODONE: Make a keydown button to activate cheat modes
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
            if (confirm("Reset Game?")) {restartGame(p2.id);}
        } if (keycode === KEY.C) {          // cheat
            console.log("c pressed");
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
        } if (keycode === KEY.C) {
            activateCheatMode();
            console.log("c released");
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

    // TODO: Organize code into better helper functions to make code more readable
    // TODO: Do a renaming overhaul of methods and variables
    // TODO: Clean up old comments and get rid of old, unused telemetry OR create a way to isolate various parts of telemetry

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
        var min = 1;
        var max = 4;
        var randSign = 0;
        var randNum = 0;

        do {
            randSign = Math.random() * 1 - 0.5;
            if (randSign < 0) {randSign = -1;}
            else if (randSign > 0) {randSign = 1;}
            else {randSign = 1;}
            randNum = Math.random() * 10 * randSign;
        } while (randNum < -max || (randNum > -min && randNum < min) || randNum > max);
        varVelocityY = randNum;
        if (varVelocityY > 0) {
        // if (ballObj.velocityY > 0) {
            ballObj.speed.up = varVelocityY;
            ballObj.speed.down = 0;
        } else if (varVelocityY < 0) {
        // } else if (ballObj.velocityY < 0) {
            ballObj.speed.up = 0;
            ballObj.speed.down = -varVelocityY;
        } else {
            console.log(text.error + " in randBallVelocityY");
        }
        console.log("changed " + ballObj.id + " velocityY to " + varVelocityY);
    }


    ///////////////////\\\\\\\\\\\\\\\\\\\
    ////////// Pause and Cheats \\\\\\\\\\
    ///////////////////\\\\\\\\\\\\\\\\\\\

    function pauseGame() {
        if (spaceIsDown) {
            if (firstTimePaused) {
                pause = !pause;
                console.log("Pause: " + pause);
            }
            firstTimePaused = false;
        } else {
            firstTimePaused = true;
        }

        if (pause) {
            $("#cheatIcon").show();
        } else {
            $("#cheatIcon").hide();
        }
    }

    // TODO: Create a better cheat mode interface. Probably a sidebar
    // Include buttons!! Steal code from the StopLight program
    // Green: Active
    // Red: Inactive
    // Grey: Unavailable
    // TODO: Create a constructor function that creates a button with new variables to toggle it with
    // TODONE: Make the game screen bigger

    // TODO: CREATE A ONE-PLAYER MODE
    // - One side is controlled
    // - The other side is automated
    // - The computer side needs to be consistent with player speed
    // - Can still use position-predicting code, but make paddle speed static until it has reached +-X of a specific point
    // - Perhaps remove the wall-bounce predicting feature for added inconsistency
    // - and include the random y mod for even more inconsistency (make it slightly wider than the paddle)

    // TODO: Create a startup menu for choosing initial game modes

    function activateCheatMode() {
        if (!restartingRound) {
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
                } else if (!pause) {
                    alert("Cannot activate Cheat Mode because the game is not paused.\nPress space to pause the game.");
                    cheatMode = false;
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
            else if (answer === "multiBall") {
                if (cheatMode) {
                    alert("Cannot activate MultiBall because Cheat Mode is activated.\nType 'noCheat' to deactivate it.");
                    multiBall = false;
                } else if (multiBall) {
                    alert("MultiBall is already activated.\nType 'noMulti' to deactivate it.");
                    multiBall = true;
                } else {
                    if (confirm("Enabling MultiBall will restart the current game. Do you still want to continue?")) {
                        var ballCountOld = ballCount;
                        do {
                            ballCount = prompt("How many balls?");
                            console.log("ballCountOld: " + ballCountOld);
                            console.log("ballCount: " + ballCount);
                            // Was Cancel pressed?
                            if (ballCount == null) {break;}
                            else {ballCount = Number(ballCount);}
                            // Make sure a number is entered.
                            if (ballCount < 2) {alert("Please enter more than 1 ball.");}
                            else if (ballCount > 50) {alert("Please enter 50 or less balls.");}
                            else if (isNaN(ballCount)) {alert("Please enter a valid number.");}
                        } while (isNaN(ballCount) || ballCount < 2 || ballCount > 50);
                        if (ballCount == null) {
                            alert("MultiBall Cancelled."); 
                            ballCount = ballCountOld;
                            multiBall = false;
                        } else {
                            alert("MultiBall Activated with " + ballCount + " balls!\nType 'noMulti' to deactivate MultiBall.");
                            multiBall = true;
                            restartGame(p2.id);
                        }
                    } else {
                        multiBall = false;
                    }
                }
            }

            // Cheat Mode Deactivation
            else if (answer === "noCheat") {
                if (cheatMode) {
                    if (!pause) {
                        alert("Cannot deactivate Cheat Mode because the game is not paused.\nPress space to pause the game.");
                        cheatMode = true;
                    } else {
                        alert("Cheat Mode Deactivated.\nType the password to activate Cheat Mode.");
                        cheatMode = false;
                    }
                } else {
                cheatMode = false;
                    alert("Cheat Mode is already deactivated.\nType the password to activate it.");
                    cheatMode = false;
                }
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

            // AutoPlay Deactivation
            else if (answer === "noAuto") {
                if (autoPlay) {
                    alert("AutoPlay Deactivated.\nType 'autoPlay' to activate AutoPlay.");
                    // Snap paddles to a multiple of the pixels per frame speed to prevent
                    // collision between the paddles and wall from being off
                    paddleLeft.y -= paddleLeft.y % ppf;
                    paddleRight.y -= paddleRight.y % ppf;
                } else {
                    alert("AutoPlay is already deactivated.\nType 'autoPlay' to activate it.");
                }
                autoPlay = false;
            }

            // MultiBall Deactivation
            else if (answer === "noMulti") {
                if (multiBall) {

                    if (confirm("Disabling MultiBall will restart the current game. Do you still want to continue?")) {
                        alert("MultiBall Deactivated.\nType 'multiBall' to activate MultiBall.");
                        multiBall = false;
                        restartGame(p2.id);
                    } else {
                        multiBall = true;
                    }


                } else {
                    alert("MultiBall is already deactivated.\nType 'multiBall' to activate it.");
                    multiBall = false;
                }
            }

            // Wrong Password
            else {
                alert("Wrong Password.");
            }
        }
    }

    function createNewBall() {
        // create a new id for the ball
        var ballId = 'ball' + (ballPit.length);
        // create a new div for the ball
        var $newBall = $("<div>")
            .appendTo('#ballPit')
            .addClass('gameItem balls')
            .attr("id", ballId)
            .css("left", (BORDERS.RIGHT/2)-($("#ball0").width()/2))
            .css("top", (BORDERS.BOTTOM/2)-($("#ball0").height()/2))
            .css("background-color", "orange");
        // store the new div in a variable
        xDirection *= -1;
        $newBall = createGameObject(
            (BORDERS.RIGHT/2)-($("#ball0").width()/2),
            (BORDERS.BOTTOM/2)-($("#ball0").height()/2),
            5*xDirection,
            -2.5,
            "#"+ballId);
        randBallVelocityY($newBall);
        // push the new body into the ballPit
        ballPit.push($newBall);
        console.log("#"+ballId+" created!");
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

    // TODO: Need to do a color overhaul.
    // - Make each ball more colorful? Idk, I kinda like the way the colors are now
    // - Update the ball colors for when the game is paused
    // - Make a unique visual for when MultiBall is enabled
    // - Make a better pause menu
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
            $("#paddleLeft").css("background-color", "blue");
            $("#paddleLeft").css("box-shadow", "0px 0px 0px 3px cyan inset");
            $("#paddleRight").css("background-color", "maroon");
            $("#paddleRight").css("box-shadow", "0px 0px 0px 3px red inset");
        } else {
            $("#paddleLeft").css("background-color", "cyan");
            $("#paddleLeft").css("box-shadow", "0px 0px 0px 3px teal inset");
            $("#paddleRight").css("background-color", "hotpink");
            $("#paddleRight").css("box-shadow", "0px 0px 0px 3px maroon inset");
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

        for (let ball of ballPit) {
            // handle ball/wall collisions
            if (!cheatMode) {
                bounceBall(ball);
            }

            // keep the balls in the borders
            enforceNoNoZone(ball);

            // handle ball/paddle collisions
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

    function bounceBall(ballObj) { // TODO: Add sounds to bounces!!!
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

    function handlePaddleCollisions(paddle) {
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

    function handleScoreBoard() {
        $(".p1TallyMark").css("background-color", "darkblue");
        $(".p2TallyMark").css("background-color", "maroon");
        $(".winTallyMark").css("background-color", "limegreen");
        $(".p1TallyMark").css("box-shadow", "none");
        $(".p2TallyMark").css("box-shadow", "none");
        $(".winTallyMark").css("box-shadow", "none");

        for (let i = 1; i <= score.p1; i++) {$("#p1Tally"+i).css("background-color", "blue");}
        for (let i = 1; i <= score.p2; i++) {$("#p2Tally"+i).css("background-color", "red");}

        if (score.p1 >= 10 || score.p2 >= 10) {
            $(".winTallyMark").css("background-color", "lime");
            if (score.p1 == score.p2) {
                $(".tallyMark").css("box-shadow", "0px 0px 0px 3px violet inset");
                $(".winTallyMark").css("box-shadow", "0px 0px 0px 3px violet inset");
            } else if (score.p1 > score.p2) {
                $(".tallyMark").css("box-shadow", "none");
                $(".p1TallyMark").css("background-color", "lime");
                $(".p1TallyMark").css("box-shadow", "0px 0px 0px 3px blue inset");
                $(".winTallyMark").css("box-shadow", "0px 0px 0px 3px blue inset");
            } else if (score.p2 > score.p1) {
                $(".tallyMark").css("box-shadow", "none");
                $(".p2TallyMark").css("background-color", "lime");
                $(".p2TallyMark").css("box-shadow", "0px 0px 0px 3px red inset");
                $(".winTallyMark").css("box-shadow", "0px 0px 0px 3px red inset");
            }
        }
    }

    // TODO: Find a way to update the scoreboard *before* the game alerts who has won
    // ...this is so simple. I'd need to move away from alert()s and start using on-screen text
    function playerLose(player) {
        if (firstTimeBouncedWall) {
            if (player === p1.id) {         // player 1's side
                score.p2++;
                console.log("P2 scored a point! Total: " + score.p2);
            } else if (player === p2.id) {  // player 2's side
                score.p1++;
                console.log("P1 scored a point! Total: " + score.p1);
            } else {
                console.log(text.error);
            }
            redrawScores();
        }
        if (!freePlay) {
            $(".balls").css("background-color", "red");
            whoWon();
            // if (pageHasHadTimeToRedraw) {
                if (!gameWon) {
                    restartingRound = true;
                    clearInterval(interval);
                    setTimeout(restartRound.bind(null, player), 1000);
                } else { 
                    if (playAgain()){restartGame(player);}
                    else {endGame();}
                }
            // }
        }
        // tell us it isn't the first time bouncing anymore
        firstTimeBouncedWall = false;
    }

    function whoWon() { // TODO: Implement methods for if there is a tie, somehow (eh, maybe). It would get rid of the redundant double-win processes.
        if (score.p1 >= 10 || isNaN(score.p1)) {
            $("#paddleLeft").css("background-color", "lime");
            alert(text.p1 + "\n" + text.restart);
            gameWon = true;
        }
        if (score.p2 >= 10 || isNaN(score.p2)) {
            $("#paddleRight").css("background-color", "lime");
            alert(text.p2 + "\n" + text.restart);
            gameWon = true;
        }
    }

    function playAgain() {
        return confirm("Good game! Play again?");
    }

    function restartRound(player) {
        if (gameWon) {resetGame();}
        
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
            ball.x = (BORDERS.RIGHT/2)-($("#ball0").width()/2);
            ball.y = (BORDERS.BOTTOM/2)-($("#ball0").height()/2);
            randBallVelocityY(ball);
            if (player === p1.id) {
                ball.speed.left = 0;
                ball.speed.right = 5;
            } else if (player === p2.id) {
                ball.speed.left = 5;
                ball.speed.right = 0;
            } else {
                alert(text.error + " in restartRound " + player);
            }
        }
        paddleLeft.y = (BORDERS.BOTTOM/2)-($("#paddleLeft").height()/2);
        paddleRight.y = (BORDERS.BOTTOM/2)-($("#paddleRight").height()/2);
        targetedBallLeft = ballNullLeft;
        targetedBallRight = ballNullRight;
        pause = false;

        // Tell that we have finished restarting the round
        restartingRound = false;
    }

    function restartGame(player) {
        restartingRound = true;
        clearInterval(interval);
        setTimeout(restartRound.bind(null, player), 1000);
    }

    function resetGame() {
        resetVariables();
        resetSpeeds(paddleLeft);
        resetSpeeds(paddleRight);
        resetScores();
    }

    function resetVariables() {
        pause = false;
        spaceIsDown = false
        firstTimeCheat = true;
        firstTimeBouncedPaddle = true;
        firstTimeBouncedWall = true;
        firstTimePaused = true;
        gameWon = false;
        varPredictedPositionY = 0;
    }

    function resetScores() {
        score.bounced = 0;
        score.p1 = 0;
        score.p2 = 0;
    }

    function resetSpeeds(obj) {
        obj.speed.up = 0;
        obj.speed.down = 0;
        obj.speed.left = 0;
        obj.speed.right = 0;
        obj.velocityX = 0;
        obj.velocityY = 0;
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
     * @param {double} pointPaddle - The first point of reference.
     * @param {double} pointBall - The second point of reference (which has a velocity).
     * @param {double} velocityBall - The pixels/frame velocity of one of the two points.
     */
    function calculateTime(pointPaddle, pointBall, velocityBall) {
        var predictedPosition;
        if (pointPaddle.id == "#paddleLeft") {
            predictedPosition = ((pointPaddle.rightX)-pointBall.x)/velocityBall.velocityX;
        } else if (pointPaddle.id == "#paddleRight") {
            predictedPosition = (pointPaddle.x-(pointBall.rightX))/velocityBall.velocityX;
        } else {
            predictedPosition = (pointPaddle.x-pointBall.x)/velocityBall.velocityX; 
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
        do {
            if (predictedPosition < BORDERS.TOP) {predictedPosition = -predictedPosition;}
            else if (predictedPosition > BORDERS.BOTTOM) {predictedPosition = Math.floor(BORDERS.BOTTOM) + ((Math.floor(BORDERS.BOTTOM) - $(ballObj.id).height()*2) - predictedPosition);}
        } while (predictedPosition < BORDERS.TOP || predictedPosition > BORDERS.BOTTOM);
        return predictedPosition - $(obj.id).height()/2 + $(ballObj.id).height()/2;// + varPredictedPositionY;
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
     * @param {object} ballObj - The object whose velocity will be used in the calculations.
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

    function redrawScores() {
        handleScoreBoard();
        if (score.p1 > 999) {score.p1 = "?!?";}
        $("#p1 span").text(String(score.p1).padStart(3, "0"));
        if (score.bounced > 999) {score.bounced = "?!?";}
        $("#bounces span").text(String(score.bounced).padStart(3, "0"));
        if (score.p2 > 999) {score.p2 = "?!?";}
        $("#p2 span").text(String(score.p2).padStart(3, "0"));
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
