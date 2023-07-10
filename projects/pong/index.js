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
    // TODOING: Work on creating better variable names for these
    var CENTER = {
        BORDER: {
            HORIZONTAL: $("#board").width()/2,
            VERTICAL: $("#board").height()/2,
        },
        BALL: $(".balls").width()/2,
        PADDLE: {
            HORIZONTAL: $(".paddles").width()/2,
            VERTICAL: $(".paddles").height()/2,
        }
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
    
    var PPF_STOP = 0; // Pixels Per Frame at rest
    var PPF = 5;     // Pixels Per Frame

    // Game Item Objects

    // player 1
    var paddleLeft = createGameObject(50, CENTER.BORDER.VERTICAL-CENTER.PADDLE.VERTICAL, 0, 0, "#paddleLeft");
    var p1 = paddleLeft;

    // player 2
    var paddleRight = createGameObject(BORDERS.RIGHT-50-$("#paddleRight").width(), CENTER.BORDER.VERTICAL-CENTER.PADDLE.VERTICAL, 0, 0, "#paddleRight");
    var p2 = paddleRight;

    // initial ball
    var ball0 = createGameObject(CENTER.BORDER.HORIZONTAL-CENTER.BALL, CENTER.BORDER.VERTICAL-CENTER.BALL, -PPF, -2.5, "#ball0");

    // references for targeting balls in AutoPlay
    var ballNullLeft = createGameObject(99999, 0, 0, 0, "#ballNull");
    var ballNullRight = createGameObject(-99999, 0, 0, 0, "#ballNull");

    // scores
    var score = {
        bounced: 0,
        p1: 0,
        p2: 0,
    }

    var text = { // TODO: Remove the "Reload the page to play again" message, and make that whole process more efficient.
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

    // Pause Variables
    var pause = false;
    var spaceIsDown = false
    var firstTimePaused = true;
    // Collision Variables
    var firstTimeBouncedPaddle = true;
    var firstTimeBouncedWall = true;
    // Mode Variables
    var cheatMode = false;
    var firstTimeCheat = true;
    var freePlay = true;
    var autoPlay = false;
    var multiBall = false;
    // MultiBall Variables
    var ballCount = 1;
    var ticksPerBall = 50;
    var ticks = 0;
    var ballPit = [];
    ballPit.push(ball0);
    var targetedBallLeft = ballNullLeft;
    var targetedBallRight = ballNullRight;
    // var pageHasHadTimeToRedraw = false;
    // Motion Variables
    var xDirection = -1;
    var varVelocityY = 5;
    var varPredictedPositionY = 0;
    // Game Finalization Variables
    var gameWon = false;
    var restartingRound = false;
    // Telemetry Variables
    var slowDown = false;                   // Slows down the game at some intervals
    var showTelemetryMultiBall = false;     // Shows MultiBall telemetry
    var showTelemetryBallBounce = false;    // Makes ball colors change according to the direction they're bouncing
    var showTelemetryBallNumbers = false;   // Shows each ball's number on the balls
    var showTelemetryMetaData = false;      // Shows the hidden miscellaneous telemetry below the scoreboard.
    var showTelemetryTicks = false;         // Shows the tick count in the console 
    var showTelemetryFPS = false;           // Shows FPS telemetry in the console
    var showTelemetryCollision = false;     // Shows collision telemetry
    var showTelemetryVelocity = false;      // Shows velocity telemetry

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
    function newFrame() {
        // Notify how MultiBall will be played
        getTelemetryMultiBall();

        if (!pause) {
            // Periodically create new balls if MultiBall is activated
            ticks++;
            if (multiBall && ticks%ticksPerBall == 0 && ticks <= ticksPerBall*(ballCount-1)) {
                createNewBall();
            }
            targetBall();
            // Telemetry on game time and speed
            getTelemetryTicks();
            getTelemetryFPS();
        }

        // Slow the game down if we need to
        debugSlowDown();

        // Update the temporary velocity for if we decide to pause the game
        updateTemporaryVelocity(ball0);

        // Detect whether we want to pause the game
        pauseGame();

        // Handles colors
        changeColors()

        // More telemetry on miscellaneous info
        getTelemetryMetaData();

        // Collisions and repositioning! Also is where scores are handled.
        getTelemetryCollision(ball0, paddleLeft);
        handleCollisions();
        redrawAllGameItems();
        if (!gameWon) {
            if (!pause) {
                handleVelocity();
                repositionAllGameItems();
            }
        }
        //else {
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
        let keycode = event.which;
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
                paddleLeft.speed.up = PPF;
                console.log("w pressed");
            } if (keycode === KEY.A) {          // left
                console.log("a pressed");
            } if (keycode === KEY.S) {          // down
                paddleLeft.speed.down = PPF;
                console.log("s pressed");
            } if (keycode === KEY.D) {          // right
                console.log("d pressed");
            }

            /* P2 controls */
            if (keycode === KEY.UP) {           // up
                paddleRight.speed.up = PPF;
                console.log("up pressed");
            } if (keycode === KEY.LEFT) {       // left
                console.log("left pressed");
            } if (keycode === KEY.DOWN) {       // down
                paddleRight.speed.down = PPF;
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
                ball0.speed.up = PPF;
                console.log("u pressed");
            } if (keycode === KEY.H) {      // left
                ball0.speed.left = PPF;
                console.log("h pressed");
            } if (keycode === KEY.J) {      // down
                ball0.speed.down = PPF;
                console.log("j pressed");
            } if (keycode === KEY.K) {      // right
                ball0.speed.right = PPF;
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

    function handleKeyUp(event) { // TODONE: Create a global ppf (pixels per frame) speed
        let keycode = event.which;
        console.log(keycode);

        /* general controls */
        if (keycode === KEY.ENTER) {
            console.log("enter released");
        } if (keycode === KEY.SPACE) {
            console.log("space released");
            spaceIsDown = false;
        } if (keycode === KEY.R) {
            console.log("r released");
        } if (keycode === KEY.C) {
            console.log("c released");
            activateCheatMode();
        }

        if (!autoPlay) {
            /* P1 controls */
            if (event.which === KEY.W) {
                console.log("w released");
                paddleLeft.speed.up = PPF_STOP;
            } if (keycode === KEY.A) {
                console.log("a released");
                paddleLeft.speed.left = PPF_STOP;
            } if (keycode === KEY.S) {
                console.log("s released");
                paddleLeft.speed.down = PPF_STOP;
            } if (keycode === KEY.D) {
                console.log("d released");
                paddleLeft.speed.right = PPF_STOP;
            }

            /* P2 controls */
            if (keycode === KEY.UP) {
                console.log("up released");
                paddleRight.speed.up = PPF_STOP;
            } if (keycode === KEY.LEFT) {
                console.log("left released");
                paddleRight.speed.left = PPF_STOP;
            } if (keycode === KEY.DOWN) {
                console.log("down released");
                paddleRight.speed.down = PPF_STOP;
            } if (keycode === KEY.RIGHT) {
                console.log("right released");
                paddleRight.speed.right = PPF_STOP;
            }

            /* ball controls */
            if (cheatMode) {
                if (keycode === KEY.U) {
                    console.log("u released");
                    ball0.speed.up = PPF_STOP;
                } if (keycode === KEY.H) {
                    console.log("h released");
                    ball0.speed.left = PPF_STOP;
                } if (keycode === KEY.J) {
                    console.log("j released");
                    ball0.speed.down = PPF_STOP;
                } if (keycode === KEY.K) {
                    console.log("k released");
                    ball0.speed.right = PPF_STOP;
                }
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // TODOING: Organize code into better helper functions to make code more readable
    // TODONE: Do a renaming overhaul of methods and variables
    // TODONE: Clean up old comments and get rid of old, unused telemetry
    // TODONE: Create a way to isolate various parts of telemetry

    function createGameObject(x, y, velocityX, velocityY, id) {
        let gameObject = {};
        gameObject.id = id;
        gameObject.color = getRandomColor();
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
            gameObject.firstTimeBouncedPaddle = true;
            gameObject.firstTimeBouncedWall = true;
        }
        return gameObject;
    }

    function createNewBall() {
        // create a new id for the ball
        let ballId = 'ball' + (ballPit.length);
        // create a new div for the ball
        let $newBall = $("<div>")
            .appendTo('#ballPit')
            .addClass('gameItem balls')
            .attr("id", ballId)
            .css("left", (CENTER.BORDER.HORIZONTAL)-(CENTER.BALL))
            .css("top", (CENTER.BORDER.VERTICAL)-(CENTER.BALL));
        $("<span>")
            .appendTo("#"+ballId)
            .text(ballId.replace(/\D/g, ''));
        // store the new div in a variable
        xDirection *= -1;
        $newBall = createGameObject(
            (CENTER.BORDER.HORIZONTAL)-(CENTER.BALL),
            (CENTER.BORDER.VERTICAL)-(CENTER.BALL),
            5*xDirection,
            -2.5,
            "#"+ballId);
            $($newBall.id).css("background-color", $newBall.color);
        randBallVelocityY($newBall);
        // push the new body into the ballPit
        ballPit.push($newBall);
        console.log("#"+ballId+" created!");
        if (showTelemetryMultiBall) {console.log(ballPit);}
    }
    
    function getRandomColor() {
        let h = Math.floor(Math.random() * 360);
        let s = "100%";
        let l = "50%";

        if (h > 360) {
            h = 0;
        }
        let hslString = "hsl(" + h + "," + s + "," + l + ")";
        return hslString;
    }

    function join(delimiter, arg1, arg2, arg3) {
        return arg1.concat(delimiter, arg2, delimiter, arg3)
    }


    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// TELEMETRY & DEBUGGING ///////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    function debugSlowDown() {
        if (slowDown) {
            if (ticks > 160) {FRAMES = 1;}
            if (ticks > 170) {FRAMES = 60;}
            if (ticks > 265) {FRAMES = 1;}
            if (ticks > 280) {FRAMES = 60;}
            if (ticks > 370) {FRAMES = 1;}
            modifyGameSpeed();
        }
    }

    function getTelemetryMultiBall() {
        if (multiBall && ticks == 1 && showTelemetryMultiBall) {alert(ballCount + " balls\n interval of 1 ball per " + ticksPerBall + " frames");}
    }
    
    function getTelemetryMetaData() {
        let signLeft = 1;
        let signRight = 1;
        if (targetedBallLeft.id == "#ballNull") {signLeft=-1;}
        if (targetedBallRight.id == "#ballNull") {signRight=-1;}

        if (showTelemetryMetaData) {
            $(".speeds").show();

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
        } else {
            $(".speeds").hide();
        }
    }

    function getTelemetryTicks() {
        if (showTelemetryTicks) {console.log(ticks);}
    }

    function getTelemetryFPS() {
        if(showTelemetryFPS) {console.log(framesPerSecondInterval);}
    }

    function getTelemetryCollision(obj1, obj2) {
        if (showTelemetryCollision) {
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
    }

    function getTelemetryVelocities(ballObj) {
        if (showTelemetryVelocity) {
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
    }


    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// VELOCITY FUNCTIONS //////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

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

    function updateTemporaryVelocity(ballObj) {
        if (!pause && !cheatMode) {
            ballObj.temporaryVelocity.up = ballObj.speed.up;
            ballObj.temporaryVelocity.left = ballObj.speed.left;
            ballObj.temporaryVelocity.down = ballObj.speed.down;
            ballObj.temporaryVelocity.right = ballObj.speed.right;
        }
    }

    function randBallVelocityY(ballObj) {
        let min = 1;
        let max = 4;
        let randSign = 0;
        let randNum = 0;

        do {
            randSign = Math.random() * 1 - 0.5;
            if (randSign < 0) {randSign = -1;}
            else if (randSign > 0) {randSign = 1;}
            else {randSign = 1;}
            randNum = Math.random() * 10 * randSign;
        } while (randNum < -max || (randNum > -min && randNum < min) || randNum > max);
        varVelocityY = randNum;
        if (varVelocityY > 0) {
            ballObj.speed.up = varVelocityY;
            ballObj.speed.down = 0;
        } else if (varVelocityY < 0) {
            ballObj.speed.up = 0;
            ballObj.speed.down = -varVelocityY;
        } else {
            console.log(text.error + " in randBallVelocityY");
        }
        console.log("changed " + ballObj.id + " velocityY to " + varVelocityY);
    }


    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// PAUSE & CHEATS //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

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
            let answer = prompt("Password:");

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

            // MultiBall Activation // TODONE: Find a way to restart MultiBall with a new set of balls if it is still enabled
            else if (answer === "multiBall") {
                if (cheatMode) {
                    alert("Cannot activate MultiBall because Cheat Mode is activated.\nType 'noCheat' to deactivate it.");
                    multiBall = false;
                } else {
                    if (confirm(((multiBall) ? "Rea" : "A") + "ctivating MultiBall will restart the current game. Do you still want to continue?")) {
                        let ballCountOld = ballCount;
                        do {
                            ballCount = prompt("How many balls?");
                            if (showTelemetryMultiBall) {
                                console.log("ballCountOld: " + ballCountOld);
                                console.log("ballCount: " + ballCount);
                            }
                            // Was Cancel pressed?
                            if (ballCount == null) {break;}
                            else {ballCount = Number(ballCount);}
                            // Make sure the correct amount is entered
                            if (ballCount < 2) {alert("Please enter more than 1 ball.");}
                            else if (ballCount > 50) {alert("Please enter 50 or less balls.");}
                            // Make sure a number is entered.
                            else if (isNaN(ballCount)) {alert("Please enter a valid number.");}
                        } while (isNaN(ballCount) || ballCount < 2 || ballCount > 50);
                        if (ballCount == null) {
                            alert("MultiBall activation cancelled." + ((multiBall) ? "\nType 'noMulti' to deactivate MultiBall." : "")); 
                            ballCount = ballCountOld;
                        } else {
                            alert("MultiBall Activated with " + ballCount + " balls!\nType 'noMulti' to deactivate MultiBall.");
                            multiBall = true;
                            restartGame(p2.id);
                        }
                    } else {
                        alert("MultiBall activation cancelled." + ((multiBall) ? "\nType 'noMulti' to deactivate MultiBall." : ""));
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
                    paddleLeft.y -= paddleLeft.y % PPF;
                    paddleRight.y -= paddleRight.y % PPF;
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

            // Pressed Cancel
            else if (answer === null || answer === "") {
                // Do nothing.
            }

            // Wrong Password
            else {
                alert("Wrong Password.");
            }
        }
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
                console.log(targetedBallRight.id + " is being targeted by RightPaddle!");
            }
        }
    }


    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// COLLISION FUNCTIONS /////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

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
            // keep the balls in the borders
            enforceNoNoZone(ball);
            // handle ball/wall collisions
            if (!cheatMode) {
                bounceBall(ball);
            }

            // handle ball/paddle collisions
            if (doCollide(ball, paddleLeft)) {
                console.log("ping");
                handlePaddleCollisions(ball, paddleLeft);     // left paddle
            }
            else if (doCollide(ball, paddleRight)) {
                console.log("pong");
                handlePaddleCollisions(ball, paddleRight);    // right paddle
            } 
            else if (!doCollide(ball, paddleLeft) || !doCollide(ball, paddleRight)) {
                // tell us we still have yet to bounce
                ball.firstTimeBouncedPaddle = true;
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
            obj.x -= obj.velocityX;
            console.log(obj.id + " passed left border")
        }
        if (obj.topY < BORDERS.TOP) {
            obj.y -= obj.velocityY;
            console.log(obj.id + " passed top border")
        }
        if (obj.rightX > BORDERS.RIGHT) {
            obj.x -= obj.velocityX;
            console.log(obj.id + " passed right border")
        }
        if (obj.bottomY > BORDERS.BOTTOM) {
            obj.y -= obj.velocityY;
            console.log(obj.id + " passed bottom border")
        }
    }

    function bounceBall(ballObj) { // TODO: Add sounds to bounces!!!
        if (ballObj.leftX < BORDERS.LEFT) {
            if (freePlay) {
                ballObj.speed.right = ballObj.speed.left;
                ballObj.speed.left = 0;
            }
            playerLose(ballObj, p1.id);
            console.log(ballObj.id+" bounced left border");
        }
        else if (ballObj.topY < BORDERS.TOP) {
            ballObj.speed.down = ballObj.speed.up;
            ballObj.speed.up = 0;
            console.log(ballObj.id+" bounced top border");
        }
        else if (ballObj.rightX > BORDERS.RIGHT) {
            if (freePlay) {
                ballObj.speed.left = ballObj.speed.right;
                ballObj.speed.right = 0;
            }
            playerLose(ballObj, p2.id);
            console.log(ballObj.id+" bounced right border");
        }
        else if (ballObj.bottomY > BORDERS.BOTTOM) {
            ballObj.speed.up = ballObj.speed.down;
            ballObj.speed.down = 0;
            console.log(ballObj.id+" bounced bottom border");
        }
        else {
            // tell us we still have yet to bounce
            ballObj.firstTimeBouncedWall = true;
        }
    }

    function handlePaddleCollisions(ball, paddle) {
        // if it is the first time bouncing on one
        if (ball.firstTimeBouncedPaddle) {
            // Mix up the ball's predicted position in AutoPlay
            randPredictedPositionYMod();
            // if it bounced off the paddle's left border...
            if (whichBorder(ball, paddle) === "left") {
                // bounce the ball left
                ball.x -= ball.velocityX;
                ball.speed.left = PPF;
                ball.speed.right = 0;
                // increase the score
                if (paddle === paddleRight) {
                    score.bounced++;
                    if (!multiBall) {
                        increaseGameSpeed();
                    }
                }
                console.log(ball.id+" bounced " + tellPaddle(paddle) + " paddle's left border");
            }
            // if it bounced off the paddle's right border...
            else if (whichBorder(ball, paddle) === "right") {
                // bounce the ball right
                ball.x -= ball.velocityX;
                ball.speed.right = PPF;
                ball.speed.left = 0;
                // increase the score
                if (paddle === paddleLeft) {
                    score.bounced++;
                    if (!multiBall) {
                        increaseGameSpeed();
                    }
                }
                console.log(ball.id+" bounced " + tellPaddle(paddle) + " paddle's right border");
            }
            // tell us it isn't the first time bouncing anymore
            ball.firstTimeBouncedPaddle = false;
        }
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


    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// POINTS & SCOREBOARD /////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // TODO: Find a way to update the scoreboard *before* the game alerts who has won
    // ...this is so simple. I'd need to move away from alert()s and // TODO: start using on-screen text for menus
    function playerLose(ballObj, player) {
        if (ballObj.firstTimeBouncedWall) {
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
        ballObj.firstTimeBouncedWall = false;
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


    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// REPOSITIONING FUNCTIONS /////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

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
        let predictedPosition;
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
        let predictedPosition = ballObj.y + (calculateTime(obj, ballObj, ballObj)*(ballObj.velocityY));
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
        let predictedMovement = predictBallPosition(gameItem, ballObj) - gameItem.y;
        let calculatedTime = calculateTime(gameItem, ballObj, ballObj);
        
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


    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// REDRAWING FUNCTIONS /////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // TODOING: Need to do a color overhaul.
    // [x] Make each ball more colorful? Idk, I kinda like the way the colors are now
    // [x] Update the ball colors for when the game is paused
    // [ ] Make a unique visual for when MultiBall is enabled
    // [ ] Make a better pause menu
    function changeColors() {
        // Ball colors
        if (showTelemetryBallBounce) {
            for (let ball of ballPit) {
                if (ball != targetedBallLeft && ball != targetedBallRight) {$(ball.id).css("background-color", "fuchsia");}
                if (ball.velocityX < 0) {$(ball.id).css("background-color", "blue");}
                if (ball.velocityX > 0) {$(ball.id).css("background-color", "maroon");}
                if (ball == targetedBallLeft) {$(ball.id).css("background-color", "cyan");}
                if (ball == targetedBallRight) {$(ball.id).css("background-color", "hotpink");}
            }
        } else {
            $(".balls").css("background-color", "fuchsia");
            for (let ball of ballPit) {
                $(ball.id).css("background-color", ball.color);
            }
        }

        // TODONE: Create a way to show and hide the ball numbers
        if (showTelemetryBallNumbers) {
            $(".balls span").show();
        } else {
            $(".balls span").hide();
        }
        
        // cheat mode colors
        if (cheatMode) {
            if (pause) {
                $("#ball0").css("background-color", "green");
                $("#ball0").css("box-shadow", "0px 0px 0px 3px lime inset");
            } else {
                $("#ball0").css("background-color", "lightpink");
                $("#ball0").css("box-shadow", "0px 0px 0px 3px fuchsia inset");
            }
        } else {
            $(".balls").css("box-shadow", "none");
        }

        // Border colors
        if (pause) {
            $("#board").css("border-color", "lime");
        } else if (freePlay) {
            $("#board").css("border-color", "orange");
        } else {
            $("#board").css("border-color", "white");
        }

        // paddle colors
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

    function redrawGameItem(gameItem) {
        $(gameItem.id).css("left", gameItem.x);
        $(gameItem.id).css("top", gameItem.y);
    }

    function redrawScoreBoard() {
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

    function redrawScores() {
        redrawScoreBoard();
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

    
    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// GAME FUNCTIONS //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

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
        if (showTelemetryMultiBall) {console.log(ballPit);}
        $("balls").css("background-color", "fuchsia");
        for (let ball of ballPit) {
            ball.x = CENTER.BORDER.HORIZONTAL-CENTER.BALL;
            ball.y = CENTER.BORDER.VERTICAL-CENTER.BALL;
            randBallVelocityY(ball);
            if (player === p1.id) {
                ball.speed.left = 0;
                ball.speed.right = PPF;
            } else if (player === p2.id) {
                ball.speed.left = PPF;
                ball.speed.right = 0;
            } else {
                alert(text.error + " in restartRound " + player);
            }
        }
        paddleLeft.y = CENTER.BORDER.VERTICAL-CENTER.PADDLE.VERTICAL;
        paddleRight.y = CENTER.BORDER.VERTICAL-CENTER.PADDLE.VERTICAL;
        targetedBallLeft = ballNullLeft;
        targetedBallRight = ballNullRight;
        pause = false;

        // Tell that we have finished restarting the round
        restartingRound = false;
    }

    function restartGame(player) {
        restartingRound = true;
        gameWon = true;
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
        ball0.firstTimeBouncedPaddle = true;
        ball0.firstTimeBouncedWall = true;
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
    
    function increaseGameSpeed() {
        clearInterval(interval);
        setTimeout(restartTimer, 0);
    }

    function modifyGameSpeed() {
        clearInterval(interval);
        setTimeout(modifyTimer, 0);
    }

    function restartTimer() {
        framesPerSecondInterval = 1000 / (FRAMES + score.bounced * 2);
        interval = setInterval(newFrame, framesPerSecondInterval);
    }

    function modifyTimer() {
        framesPerSecondInterval = 1000 / FRAMES;
        interval = setInterval(newFrame, framesPerSecondInterval);
    }

    function endGame() {
        // stop the interval timer
        clearInterval(interval);

        // turn off event handlers
        $(document).off();
    }
}
