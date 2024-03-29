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
        BOTTOM: $(".board").height(),
        RIGHT: $(".board").width(),
    }
    var CENTERS = {
        BORDER: {
            HORIZONTAL: $(".board").width()/2,
            VERTICAL: $(".board").height()/2,
        },
        BALL: $(".balls").width()/2,
        PADDLE: {
            HORIZONTAL: $(".paddles").width()/2,
            VERTICAL: $(".paddles").height()/2,
        }
    }
    var KEY = {
        /* general controls */
        ENTER: 13,  // ???
        SPACE: 32,  // pause
        R: 82,      // restart
        C: 67,      // cheat
        M: 77,      // mute

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
        I: 73,      // up
        J: 74,      // left
        K: 75,      // down
        L: 76,      // right
    }
    
    var PPF_STOP = 0;   // Pixels Per Frame at rest
    var PPF = 5;        // Pixels Per Frame

    // Game Item Objects

    // player 1
    var paddleLeft = createGameObject(50, CENTERS.BORDER.VERTICAL-CENTERS.PADDLE.VERTICAL, 0, 0, "#paddleLeft");
    // var paddleLeft = createGameObject(50, 240-40, 0, 0, "#paddleLeft");
    // var paddleLeft = createGameObject(50, 200, 0, 0, "#paddleLeft");
    var p1 = paddleLeft;

    // player 2
    var paddleRight = createGameObject(BORDERS.RIGHT-50-$("#paddleRight").width(), CENTERS.BORDER.VERTICAL-CENTERS.PADDLE.VERTICAL, 0, 0, "#paddleRight");
    // var paddleRight = createGameObject(750-50-20, 240-40, 0, 0, "#paddleRight");
    // var paddleRight = createGameObject(680, 200, 0, 0, "#paddleRight");
    var p2 = paddleRight;

    // initial ball
    // var ball0 = createGameObject(snapDown(CENTERS.BORDER.HORIZONTAL-CENTERS.BALL), snapUp(CENTERS.BORDER.VERTICAL-CENTERS.BALL), -PPF, -2.5, "#ball0");
    var ball0 = createGameObject(CENTERS.BORDER.HORIZONTAL-CENTERS.BALL, CENTERS.BORDER.VERTICAL-CENTERS.BALL, -PPF, -2.5, "#ball0");
    // var ball0 = createGameObject(375-10, 240-10, -PPF, -2.5, "#ball0");
    // var ball0 = createGameObject(365, 230, -PPF, -2.5, "#ball0");

    // references for targeting balls in AutoPlay
    var ballNullLeft = createGameObject(99999, 0, 0, 0, "#ballNull");
    var ballNullRight = createGameObject(-99999, 0, 0, 0, "#ballNull");

    // scores
    var score = {
        bounced: 0,
        p1: 0,
        p2: 0,
        WIN: 10,
    }

    var text = {
        p1: "P1 WINS!",
        p2: "P2 WINS!",
        pause: "PAUSED",
        error: "ERROR",
    }

    // one-time setup
    var interval = setInterval(newFrame, framesPerSecondInterval);   // execute newFrame every 0.0166 seconds (60 frames per second)
    $(document).on("keydown", handleKeyDown);       // listen for keydown events
    $(document).on("keyup", handleKeyUp);           // listen for keyup events
    $("#mute").on("click", toggleCheatButton);
    $("#pause").on("click", toggleCheatButton);
    $("#cheatMode").on("click", toggleCheatButton);
    $("#freePlay").on("click", toggleCheatButton);
    $("#autoPlay").on("click", toggleCheatButton);
    $("#multiBall").on("click", toggleCheatButton);
    $("#confirmBallCount").on("click", toggleCheatButton);
    $("#singlePlayer").on("click", toggleCheatButton);
    $("#paddleControl").on("click", toggleCheatButton);
    $("#choosePlayer").on("click", togglePlayer);

    // Mute Variable
    var mute = false;
    // Pause Variables
    var pause = true;
    var spaceIsDown = false
    var firstTimePaused = true;
    // Mode Variables
    var cheatMode = false;
    var firstTimeCheat = true;
    var freePlay = false;
    var autoPlay = false;
    var singlePlayer = false;
    var multiBall = false;
    var paddleControl = false;
    // MultiBall Variables
    var ballCount = 2;
    var ticksPerBall = 45;
    var ballPit = [];
    ballPit.push(ball0);
    var targetedBallLeft = ballNullLeft;
    var targetedBallRight = ballNullRight;
    // SinglePlayer Variables
    var playerChosen = "p1";
    // Motion Variables
    var xDirection = -1;
    var varVelocityY = 5;
    var varPredictedPositionY = 0;
    // Game Variables
    var ticks = 0;
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
    var showTelemetryCheatModes = false;    // Shows cheat mode telemetry
    var showTelemetryCheatColors = false;   // Shows cheat mode values

    // NOTE: Put this back when needed
    // alert(  "Welcome to Pong!\n" +
    //         "P1 Controls: W S\n" +
    //         "P2 Controls: Up Down\n" +
    //         "Pause: Space\n" + 
    //         "Restart: R");

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////// CORE LOGIC ///////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /* 
    On each "tick" of the timer, a new frame is dynamically drawn using JavaScript
    by calling this function and executing the code inside.
    */
    function newFrame() {
        // console.log("NEW FRAME");

        // Notify how MultiBall will be played
        checkBallCountValidity(ballCount);
        getTelemetryMultiBall();

        if (!pause) {
            // Periodically create new balls if MultiBall is activated
            ticks++;
            if (multiBall && ticks%ticksPerBall == 0 && ticks <= ticksPerBall*(ballCount-1)) {
                createNewBall();
            }

            // Telemetry on the game
            getTelemetryTicks();
            getTelemetryFPS();
            getTelemetryMetaData();
        }

        // Slow the game down if we need to
        debugSlowDown();
        // Update the temporary velocity for if we decide to go into cheatMode            
        updateTemporaryVelocity(ball0);
        // Detect whether we want to pause the game
        pauseGame();
        // Handles colors
        changeColors();

        if (!gameWon && !pause) {
            // Moves all the game items
            repositionAllGameItems();
            // Collision Telemetry
            getTelemetryCollision(ball0, paddleLeft);
            // Uncollides all objects
            handleCollisions();
        }

        // Updates everything on the big screen
        redrawAllGameItems();
    }

    /* 
    Called in response to events.
    */
    function handleKeyDown(event) {
        let keycode = event.which;
        console.log(keycode);

        /* general controls */
        if (keycode === KEY.ENTER) {        // ???
            event.preventDefault();
            console.log("enter pressed");
        } if (keycode === KEY.SPACE) {      // pause
            event.preventDefault();
            spaceIsDown = true;
            console.log("space pressed");
        } if (keycode === KEY.R) {          // restart
            console.log("r pressed");
            // NOTE: Uncomment this when done testing
            if (confirm("Reset Game?")) {restartGame(p2.id);}
        } if (keycode === KEY.C) {          // cheat
            console.log("c pressed");
        } if (keycode === KEY.M) {          // mute
            console.log("m pressed");
        }

        if (!autoPlay) {
            if (!singlePlayer || (singlePlayer && playerChosen === "p1")) {
                /* P1 controls */
                if (keycode === KEY.W) {            // up
                    paddleLeft.speed.up = PPF;
                    console.log("w pressed");
                } if (keycode === KEY.A) {          // left
                    if (paddleControl) {paddleLeft.speed.left = PPF;}
                    else {paddleLeft.speed.left = PPF_STOP}
                    console.log("a pressed");
                } if (keycode === KEY.S) {          // down
                    paddleLeft.speed.down = PPF;
                    console.log("s pressed");
                } if (keycode === KEY.D) {          // right
                    if (paddleControl) {paddleLeft.speed.right = PPF;}
                    else {paddleLeft.speed.right = PPF_STOP}
                    console.log("d pressed");
                }
            }

            if (!singlePlayer || (singlePlayer && playerChosen === "p2")) {
                /* P2 controls */
                if (keycode === KEY.UP) {           // up
                    paddleRight.speed.up = PPF;
                    console.log("up pressed");
                } if (keycode === KEY.LEFT) {       // left
                    if (paddleControl) {paddleRight.speed.left = PPF;}
                    else {paddleRight.speed.left = PPF_STOP}
                    console.log("left pressed");
                } if (keycode === KEY.DOWN) {       // down
                    paddleRight.speed.down = PPF;
                    console.log("down pressed");
                } if (keycode === KEY.RIGHT) {      // right
                    if (paddleControl) {paddleRight.speed.right = PPF;}
                    else {paddleRight.speed.right = PPF_STOP}
                    console.log("right pressed");
                }
            }

        }
        /* ball controls */
        if (cheatMode) {
            if (firstTimeCheat) {
                ball0.speed.up = 0;
                ball0.speed.left = 0;
                ball0.speed.down = 0;
                ball0.speed.right = 0;
                updateVelocity(ball0);
            } firstTimeCheat = false;
            if (keycode === KEY.I) {        // up
                ball0.speed.up = PPF;
                console.log("u pressed");
            } if (keycode === KEY.J) {      // left
                ball0.speed.left = PPF;
                console.log("h pressed");
            } if (keycode === KEY.K) {      // down
                ball0.speed.down = PPF;
                console.log("j pressed");
            } if (keycode === KEY.L) {      // right
                ball0.speed.right = PPF;
                console.log("k pressed");
            }
        } else {
            if (!firstTimeCheat) {
                ball0.speed.up = ball0.temporaryVelocity.up;
                ball0.speed.left = ball0.temporaryVelocity.left;
                ball0.speed.down = ball0.temporaryVelocity.down;
                ball0.speed.right = ball0.temporaryVelocity.right;
                updateVelocity(ball0);
            } firstTimeCheat = true;
        }
    }

    function handleKeyUp(event) {
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
            chooseCheatMode();
        } if (keycode === KEY.M) {
            console.log("m released");
            toggleCheatModeMute();
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
                if (keycode === KEY.I) {
                    console.log("u released");
                    ball0.speed.up = PPF_STOP;
                } if (keycode === KEY.J) {
                    console.log("h released");
                    ball0.speed.left = PPF_STOP;
                } if (keycode === KEY.K) {
                    console.log("j released");
                    ball0.speed.down = PPF_STOP;
                } if (keycode === KEY.L) {
                    console.log("k released");
                    ball0.speed.right = PPF_STOP;
                }
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

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
        gameObject.velocityX = gameObject.speed.right - gameObject.speed.left;
        gameObject.velocityY = gameObject.speed.down - gameObject.speed.up;
        if (gameObject.id.includes("#ball")) {
            gameObject.firstTimeBouncedPaddle = true;
            gameObject.firstTimeBouncedWall = true;
            gameObject.temporaryVelocity = {}
            gameObject.temporaryVelocity.up = gameObject.speed.up;
            gameObject.temporaryVelocity.left = gameObject.speed.left;
            gameObject.temporaryVelocity.down = gameObject.speed.down;
            gameObject.temporaryVelocity.right = gameObject.speed.right;
        }
        gameObject.height = $(gameObject.id).height();
        gameObject.width = $(gameObject.id).width();
        return gameObject;
    }

    function createNewBall() {
        // create a new id for the ball
        let ballId = 'ball' + (ballPit.length);
        // create a new div for the ball
        let $newBall = $("<div>") // The ball
            .appendTo('#ballPit')
            .addClass('gameItem balls')
            .attr("id", ballId)
            .css("left", (CENTERS.BORDER.HORIZONTAL)-(CENTERS.BALL))
            .css("top", (CENTERS.BORDER.VERTICAL)-(CENTERS.BALL));
        $("<span>") // The text inside the ball
            .appendTo("#"+ballId)
            .text(ballId.replace(/\D/g, ''));
        // store the new div in a variable
        xDirection *= -1;
        $newBall = createGameObject(
            (CENTERS.BORDER.HORIZONTAL)-(CENTERS.BALL),
            (CENTERS.BORDER.VERTICAL)-(CENTERS.BALL),
            5*xDirection,
            -2.5,
            "#"+ballId);
        $($newBall.id).css("background-color", $newBall.color);
        randBallVelocityY($newBall);
        // push the new ball into the ballPit
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
            console.log("---------------------------");
            console.log("varPredictedPositionY: " + varPredictedPositionY);
            console.log(">>> COLLISION DETECTION <<<");
            console.log("Do " + obj1.id + " and " + obj2.id + " collide? " + doCollide(obj1, obj2));
            console.log("They collide on the paddle's *" + whichBorder(obj1, obj2) + "* border.");
            console.log("Calculated Time: " + calculateTime(obj2, obj1, obj1));
            console.log("Predicted Position: " + predictBallPosition(obj2, obj1));
            console.log("paddleLeft.y = " + obj2.y);
            console.log("Predicted Movement: " + (predictBallPosition(obj2, obj1)-obj2.y) / (calculateTime(obj2, obj1, obj1)));
            console.log("---------------------------");
            console.log("OBJECT 1: " + obj1.id);
            console.log("Left Border: " + obj1.borderLeft);
            console.log("Right Border: " + obj1.borderRight);
            console.log("Top Border: " + obj1.borderTop);
            console.log("Bottom Border: " + obj1.borderBottom);
            console.log("---------------------------");
            console.log("OBJECT 2: " + obj2.id);
            console.log("Left Border: " + obj2.borderLeft);
            console.log("Right Border: " + obj2.borderRight);
            console.log("Top Border: " + obj2.borderTop);
            console.log("Bottom Border: " + obj2.borderBottom);
            console.log("---------------------------");
            console.log("---------------------------");
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

    function getTelemetryCheatModes() {
        if (showTelemetryCheatModes) {
            console.log("pause: " + pause);
            console.log("cheatMode: " + cheatMode);
            console.log("freePlay: " + freePlay);
            console.log("autoPlay: " + autoPlay);
            console.log("multiBall: " + multiBall);
            console.log("singlePlayer: " + singlePlayer);
            console.log("paddleControl: " + paddleControl);
        }
    }


    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// VELOCITY FUNCTIONS //////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    function updateAllVelocities() {
        // p1 Velocity
        updateVelocity(paddleLeft);

        // p2 Velocity
        updateVelocity(paddleRight);

        // ballPit Velocity
        for (let ball of ballPit) {
            updateVelocity(ball);
        }
    }

    function updateVelocity(obj) {
        obj.velocityX = obj.speed.right - obj.speed.left;
        obj.velocityY = obj.speed.down - obj.speed.up;
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
        } else {console.log(text.error + " in randBallVelocityY");}
        console.log("changed " + ballObj.id + " velocityY to " + varVelocityY);
    }


    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// PAUSE & CHEATS //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    function pauseGame() {
        if (spaceIsDown) {
            if (firstTimePaused) {
                toggleCheatModePause();
                console.log("Pause: " + pause);
            }
            firstTimePaused = false;
        } else {firstTimePaused = true;}
    }

    // TODO: Create a startup menu for choosing initial game modes

    function updateCheatModeVelocities() {
        if (cheatMode) {
            if (firstTimeCheat) {
                ball0.speed.up = 0;
                ball0.speed.left = 0;
                ball0.speed.down = 0;
                ball0.speed.right = 0;
                updateVelocity(ball0);
            } firstTimeCheat = false;
        } else {
            if (!firstTimeCheat) {
                ball0.speed.up = ball0.temporaryVelocity.up;
                ball0.speed.left = ball0.temporaryVelocity.left;
                ball0.speed.down = ball0.temporaryVelocity.down;
                ball0.speed.right = ball0.temporaryVelocity.right;
                updateVelocity(ball0);
            } firstTimeCheat = true;
        }
    }

    function getElementId(element) {return $(element).attr("id");}
    function getElementClass(element) {return $(element).attr("class");}

    function toggleCheatButton() {
        toggleCheatModesAll(this);
    }

    function handleCheatModes(element, boolean) {
        if (element === "mute") {mute = boolean;}
        else if (element === "pause") {pause = boolean;}
        else if (element === "cheatMode") {cheatMode = boolean;}
        else if (element === "freePlay") {freePlay = boolean;}
        else if (element === "autoPlay") {autoPlay = boolean;}
        else if (element === "multiBall") {multiBall = boolean;}
        else if (element === "confirmBallCount") {multiBall = boolean;}
        else if (element === "singlePlayer") {singlePlayer = boolean;}
        else if (element === "paddleControl") {paddleControl = boolean;}
        getTelemetryCheatModes();
    }

    function handleCheatModesColors() {
        if (showTelemetryCheatColors) {
            if (mute) {
                $(".mute").removeClass("off");
                $(".mute").addClass("on");
            } else {
                $(".mute").removeClass("on");
                $(".mute").addClass("off");
            }

            if (pause) {
                $(".pause").removeClass("off");
                $(".pause").addClass("on");
            } else {
                $(".pause").removeClass("on");
                $(".pause").addClass("off");
            }

            if (cheatMode) {
                $(".cheatMode").removeClass("off");
                $(".cheatMode").addClass("on");
            } else {
                $(".cheatMode").removeClass("on");
                $(".cheatMode").addClass("off");
            }

            if (freePlay) {
                $(".freePlay").removeClass("off");
                $(".freePlay").addClass("on");
            } else {
                $(".freePlay").removeClass("on");
                $(".freePlay").addClass("off");
            }

            if (autoPlay) {
                $(".autoPlay").removeClass("off");
                $(".autoPlay").addClass("on");
            } else {
                $(".autoPlay").removeClass("on");
                $(".autoPlay").addClass("off");
            }

            if (multiBall) {
                $(".multiBall").removeClass("off");
                $(".multiBall").addClass("on");
            } else {
                $(".multiBall").removeClass("on");
                $(".multiBall").addClass("off");
            }

            if (singlePlayer) {
                $(".singlePlayer").removeClass("off");
                $(".singlePlayer").addClass("on");
            } else {
                $(".singlePlayer").removeClass("on");
                $(".singlePlayer").addClass("off");
            }

            if (paddleControl) {
                $(".paddleControl").removeClass("off");
                $(".paddleControl").addClass("on");
            } else {
                $(".paddleControl").removeClass("on");
                $(".paddleControl").addClass("off");
            }
        }
    }

    function activateCheatMode(element) {
        // change the variable value
        handleCheatModes(element, true);
        // handle the pause menu
        if (element === "pause") {$("#paused").show();}
        // change the color
        element = "#" + element;
        $(element).removeClass("deactivated");
        $(element).removeClass("disabled");
        $(element).addClass("activated");
    }

    function deactivateCheatMode(element) {
        // change the variable value
        handleCheatModes(element, false);
        // handle the pause menu
        if (element === "pause") {$("#paused").hide();}
        // change the color
        element = "#" + element;
        $(element).removeClass("activated");
        $(element).removeClass("disabled");
        $(element).addClass("deactivated");
    }

    function disableCheatMode(element) {
        // handleCheatModes(element, false);
        // change the color
        element = "#" + element;
        $(element).removeClass("activated");
        $(element).removeClass("deactivated");
        $(element).addClass("disabled");
    }

    function toggleCheatModeMute() {
        if (mute) { // Unmute
            deactivateCheatMode("mute");
        } else { // Mute
            activateCheatMode("mute");
        }
        console.log(mute);
    }

    function toggleCheatModePause() {
        if (!restartingRound) {
            if (pause) { // Unpause
                deactivateCheatMode("pause");
                disableCheatMode("cheatMode");
            } else { // Pause
                activateCheatMode("pause");
                if (autoPlay || singlePlayer || multiBall) {
                    disableCheatMode("cheatMode");
                } else if (cheatMode) {
                    activateCheatMode("cheatMode");
                } else {
                    deactivateCheatMode("cheatMode");
                }
            }
        }
        console.log(pause);
    }

    function toggleCheatModeCheat() {
        if (autoPlay || singlePlayer || multiBall || !pause) {
            disableCheatMode("cheatMode");
        } else if (cheatMode) { // Deactivate CheatMode
            deactivateCheatMode("cheatMode");
            deactivateCheatMode("autoPlay");
            deactivateCheatMode("singlePlayer");
            deactivateCheatMode("playerSlider");
            deactivateCheatMode("multiBall");
            activateCheatMode("pause");
        } else { // Activate CheatMode
            activateCheatMode("cheatMode");
            disableCheatMode("autoPlay");
            disableCheatMode("singlePlayer");
            disableCheatMode("playerSlider");
            disableCheatMode("multiBall");
            activateCheatMode("pause");
        }
        console.log(cheatMode);
    }

    function toggleCheatModeFree() {
        if (freePlay) { // Deactivate FreePlay
            deactivateCheatMode("freePlay");
        } else { // Activate FreePlay
            activateCheatMode("freePlay");
        }
        console.log(freePlay);
    }

    function toggleCheatModeAuto() {
        if (cheatMode) {
            disableCheatMode("autoPlay");
        } else if (autoPlay) { // Deactivate AutoPlay
            deactivateCheatMode("autoPlay");
            if (multiBall || singlePlayer || !pause) {
                disableCheatMode("cheatMode");
            } else {
                deactivateCheatMode("cheatMode");
            }
        } else { // Activate AutoPlay
            activateCheatMode("autoPlay");
            deactivateCheatMode("singlePlayer");
            deactivateCheatMode("playerSlider");
            disableCheatMode("cheatMode");
        }
        console.log(autoPlay);
    }

    function toggleCheatModeSingle() {
        if (cheatMode) {
            disableCheatMode("singlePlayer");
            disableCheatMode("playerSlider");
        } else if (singlePlayer) { // Deactivate SinglePlayer
            deactivateCheatMode("singlePlayer");
            deactivateCheatMode("playerSlider");
            if (autoPlay || multiBall || !pause) {
                disableCheatMode("cheatMode");
            } else {
                deactivateCheatMode("cheatMode");
            }
        } else { // Activate SinglePlayer
            activateCheatMode("singlePlayer");
            activateCheatMode("playerSlider");
            deactivateCheatMode("autoPlay");
            disableCheatMode("cheatMode");
        }
        console.log(singlePlayer);
    }

    function togglePlayer() {
        if ($(this).prop("checked") === false) {playerChosen = "p1";}
        else if ($(this).prop("checked") === true) {playerChosen = "p2";}
        console.log(playerChosen + " joins the battle!");
    }

    // This will toggle the button, and also set the ballCount
    function toggleCheatModeMulti() {
        if (cheatMode) {
            disableCheatMode("multiBall");
        } else if (!restartingRound && multiBall) { // Deactivate MultiBall 
            if (confirm("Deactivating MultiBall will restart the current game. Do you still want to continue?")) {
                ballCount = 1;
                deactivateCheatMode("multiBall");
                if (autoPlay || singlePlayer || !pause) {
                    disableCheatMode("cheatMode");
                } else {
                    deactivateCheatMode("cheatMode");
                }
                restartGame(p2.id);
            }
        } else if (!restartingRound && confirm(((multiBall) ? "Rea" : "A") + "ctivating MultiBall will restart the current game. Do you still want to continue?")) { // Activate MultiBall
            ballCount = $("#ballCount").val();
            alert("MultiBall activated with " + ballCount + " balls!");
            activateCheatMode("multiBall");
            disableCheatMode("cheatMode");
            restartGame(p2.id);
        }
        console.log(multiBall);
    }

    function confirmCheatModeMulti() {
        if (cheatMode) {
            disableCheatMode("multiBall");
        } else if (!restartingRound && confirm(((multiBall) ? "Rea" : "A") + "ctivating MultiBall will restart the current game. Do you still want to continue?")) { // (Re)Activate MultiBall
            ballCount = $("#ballCount").val();
            alert("MultiBall activated with " + ballCount + " balls!");
            activateCheatMode("multiBall");
            disableCheatMode("cheatMode");
            restartGame(p2.id);
        }
        console.log(multiBall);
    }

    // This will ONLY check if the button is alright to press. It WON'T change any actual ballCount values.
    function checkBallCountValidity() {
        let ballCountValue = $("#ballCount").val();
        ballCountValue = Math.floor(Number(ballCountValue));
        if (!cheatMode && !isNaN(ballCountValue) && ballCountValue >= 2 && ballCountValue <= 50) {
            if (multiBall) {
                activateCheatMode("multiBall");
                disableCheatMode("cheatMode");
            } else {
                deactivateCheatMode("multiBall");
                if (autoPlay || singlePlayer || !pause) {
                    disableCheatMode("cheatMode");
                } else {
                    deactivateCheatMode("cheatMode");
                }
            }
        } else {
            disableCheatMode("multiBall");
        }
    }

    function multiBallLogic() {
        if (confirm("Activating MultiBall will restart the current game. Do you still want to continue?")) {
            if (showTelemetryMultiBall) {
                console.log("ballCountOld: " + ballCountOld);
                console.log("ballCount: " + ballCount);
            }
        }
    }

    function toggleCheatModePaddle() {
        if (paddleControl) { // Deactivate PaddleControl
            deactivateCheatMode("paddleControl");
        } else { // Activate PaddleControl
            activateCheatMode("paddleControl");
        }
        console.log(paddleControl);
    }
    
    function toggleCheatModesAll(element) {
        let cheatId = getElementId(element);
        let cheatClass = getElementClass(element);
        console.log(cheatId);

        if (cheatClass === "disabled") {disableCheatMode(cheatId);}
        else if (cheatId === "mute") {toggleCheatModeMute();}
        else if (cheatId === "pause") {toggleCheatModePause();}
        else if (cheatId === "cheatMode") {toggleCheatModeCheat();}
        else if (cheatId === "freePlay") {toggleCheatModeFree();}
        else if (cheatId === "autoPlay") {toggleCheatModeAuto();}
        else if (cheatId === "singlePlayer") {toggleCheatModeSingle();}
        else if (cheatId === "multiBall") {toggleCheatModeMulti();}
        else if (cheatId === "confirmBallCount" && getElementClass("#multiBall") != "disabled") {confirmCheatModeMulti();}
        else if (cheatId === "paddleControl") {toggleCheatModePaddle();}

        console.log(cheatClass);
        updateCheatModeVelocities();
    }

    function chooseCheatMode() {
        if (!restartingRound) {
            let answer = prompt("Password:");

            // CheatMode Activation
            if (answer === "^^vv<><>ba") {
                if (autoPlay) {
                    alert("Cannot activate Cheat Mode because AutoPlay is activated.\nType 'noAuto' to deactivate it.");
                    disableCheatMode("cheatMode");
                    activateCheatMode("autoPlay");
                } else if (singlePlayer) {
                    alert("Cannot activate Cheat Mode because Single Player Mode is activated.\nType 'multiPlayer' to deactivate it.");
                    disableCheatMode("cheatMode");
                    activateCheatMode("singlePlayer");
                    activateCheatMode("playerSlider");
                } else if (multiBall) {
                    alert("Cannot activate Cheat Mode because MultiBall is activated.\nType 'noMulti' to deactivate it.");
                    disableCheatMode("cheatMode");
                    activateCheatMode("multiBall");
                } else if (!pause) {
                    alert("Cannot activate Cheat Mode because the game is not paused.\nPress space to pause the game.");
                    disableCheatMode("cheatMode");
                    deactivateCheatMode("pause");
                } else if (cheatMode) {
                    alert("Cheat Mode is already activated.\nType 'noCheat' to deactivate it.");
                    activateCheatMode("cheatMode");
                } else {
                    alert("Cheat Mode activated!\nUse these controls to move the ball:\nI: Up\nJ: Left\nK: Down\nL: Right\nType 'noCheat' to deactivate Cheat Mode.");
                    activateCheatMode("cheatMode");
                    disableCheatMode("autoPlay");
                    disableCheatMode("singlePlayer");
                    disableCheatMode("playerSlider");
                    disableCheatMode("multiBall");
                    activateCheatMode("pause");
                }
            }

            // FreePlay Activation
            else if (answer === "freePlay") {
                if (freePlay) {
                    alert("FreePlay is already activated.\nType 'noFree' to deactivate it.");
                } else {
                    alert("FreePlay activated!\nType 'noFree' to deactivate it.");
                }
                activateCheatMode("freePlay");
            }

            // AutoPlay Activation
            else if (answer === "autoPlay") {
                if (cheatMode) {
                    alert("Cannot activate AutoPlay because Cheat Mode is activated.\nType 'noCheat' to deactivate it.");
                    disableCheatMode("autoPlay");
                } else if (singlePlayer) {
                    if (confirm("Activating AutoPlay will deactivate Single Player Mode. Continue?")) {
                        alert("AutoPlay activated!\nType 'noAuto' to deactivate it.\n\nSingle Player Mode deactivated.\nType 'singlePlayer' to reactivate it.");
                        activateCheatMode("autoPlay");
                        deactivateCheatMode("singlePlayer");
                        deactivateCheatMode("playerSlider");
                        disableCheatMode("cheatMode");
                    } else {
                        alert("AutoPlay activation cancelled.\nType 'autoPlay' to activate AutoPlay.\nType 'multiPlayer' to deactivate Single Player Mode.");
                        activateCheatMode("singlePlayer");
                        deactivateCheatMode("autoPlay");
                    }
                } else if (autoPlay) {
                    alert("AutoPlay is already activated.\nType 'noAuto' to deactivate it.");
                    activateCheatMode("autoPlay");
                    deactivateCheatMode("singlePlayer");
                    deactivateCheatMode("playerSlider");
                    disableCheatMode("cheatMode");
                } else {
                    alert("AutoPlay activated!\nType 'noAuto' to deactivate it.");
                    activateCheatMode("autoPlay");
                    deactivateCheatMode("singlePlayer");
                    deactivateCheatMode("playerSlider");
                    disableCheatMode("cheatMode");
                }
            }

            // SinglePlayer Activation
            else if (answer === "singlePlayer") {
                if (cheatMode) {
                    alert("Cannot activate Single Player Mode because Cheat Mode is activated.\nType 'noCheat' to deactivate it.");
                    disableCheatMode("singlePlayer");
                    disableCheatMode("playerSlider");
                } else if (autoPlay) {
                    if (confirm("Activating Single Player Mode will deactivate AutoPlay. Continue?")) {
                        choosePlayer();
                        if (playerChosen === null) {
                            alert("Single Player Mode activation cancelled.\nType 'singlePlayer' to activate Single Player Mode.\nType 'noAuto' to deactivate AutoPlay.");
                            deactivateCheatMode("singlePlayer");
                            deactivateCheatMode("playerSlider");
                            activateCheatMode("autoPlay");
                        } else {
                            alert("Single Player Mode activated!\nType 'multiPlayer' to deactivate it.\n\nAutoPlay deactivated.\nType 'autoPlay' to reactivate it.");
                            activateCheatMode("singlePlayer");
                            activateCheatMode("playerSlider");
                            deactivateCheatMode("autoPlay");
                        }
                    } else {
                        alert("Single Player Mode activation cancelled.\nType 'singlePlayer' to activate Single Player Mode.\nType 'noAuto' to deactivate AutoPlay.");
                        deactivateCheatMode("singlePlayer");
                        deactivateCheatMode("playerSlider");
                        activateCheatMode("autoPlay");
                    }
                    disableCheatMode("cheatMode");
                } else if (singlePlayer) {
                    if (confirm("Single Player Mode is already activated.\nWould you like to select a different player?")) {
                        choosePlayer();
                        if (playerChosen === null) {
                            alert("Single Player Mode activation cancelled.\nType 'singlePlayer' to choose a different player.\nType 'multiPlayer' to deactivate Single Player Mode.");
                        } else {
                            alert("Single Player Mode reactivated!\nType 'multiPlayer' to deactivate it.");
                            activateCheatMode("singlePlayer");
                            activateCheatMode("playerSlider");
                            deactivateCheatMode("autoPlay");
                            disableCheatMode("cheatMode");
                        }
                    } else {
                        alert("Single Player Mode activation cancelled.\nType 'singlePlayer' to choose a different player.\nType 'multiPlayer' to deactivate Single Player Mode.");
                    }
                } else {
                    choosePlayer();
                    if (playerChosen === null) {
                        alert("Single Player Mode activation cancelled.\nType 'singlePlayer' to activate Single Player Mode.");
                        deactivateCheatMode("singlePlayer");
                    } else {
                        alert("Single Player Mode activated!\nType 'multiPlayer' to deactivate it.");
                        activateCheatMode("singlePlayer");
                        activateCheatMode("playerSlider");
                        deactivateCheatMode("autoPlay");
                        disableCheatMode("cheatMode");
                    }
                }
            }

            // MultiBall Activation
            else if (answer === "multiBall") {
                if (cheatMode) {
                    alert("Cannot activate MultiBall because Cheat Mode is activated.\nType 'noCheat' to deactivate it.");
                    disableCheatMode("multiBall");
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
                            alert("MultiBall activated with " + ballCount + " balls!\nType 'noMulti' to deactivate it.");
                            $("#ballCount").val(ballCount);
                            activateCheatMode("multiBall");
                            disableCheatMode("cheatMode");
                            restartGame(p2.id);
                        }
                    } else {
                        alert("MultiBall activation cancelled." + ((multiBall) ? "\nType 'noMulti' to deactivate MultiBall." : ""));
                    }
                }
            }

            // PaddleControl Activation
            else if (answer === "paddleControl") { 
                if (paddleControl) {
                    alert("PaddleControl is already activated. Type 'noPaddle' to deactivate it.");
                } else {
                    alert("PaddleControl activated! Type 'noPaddle' to deactivate it.");
                }
                activateCheatMode("paddleControl");
            }

            // CheatMode Deactivation
            else if (answer === "noCheat") {
                if (cheatMode) {
                    if (!pause) {
                        alert("Cannot deactivate Cheat Mode because the game is not paused.\nPress space to pause the game.");
                        disableCheatMode("cheatMode");
                        deactivateCheatMode("pause");
                    } else {
                        alert("Cheat Mode deactivated.\nType the password to reactivate it.");
                        deactivateCheatMode("cheatMode");
                        deactivateCheatMode("autoPlay");
                        deactivateCheatMode("singlePlayer");
                        deactivateCheatMode("playerSlider");
                        deactivateCheatMode("multiBall");
                        activateCheatMode("pause");
                    }
                } else {
                    alert("Cheat Mode is already deactivated.\nType the password to activate it.");
                    deactivateCheatMode("cheatMode");
                }
            }

            // FreePlay Deactivation
            else if (answer === "noFree") {
                if (freePlay) {
                    alert("FreePlay deactivated.\nType 'freePlay' to reactivate it.");
                } else {
                    alert("FreePlay is already deactivated.\nType 'freePlay' to activate it.");
                }
                deactivateCheatMode("freePlay");
            }

            // AutoPlay Deactivation
            else if (answer === "noAuto") {
                if (autoPlay) {
                    alert("AutoPlay deactivated.\nType 'autoPlay' to reactivate it.");
                } else {
                    alert("AutoPlay is already deactivated.\nType 'autoPlay' to activate it.");
                }
                if (cheatMode) {
                    disableCheatMode("autoPlay");
                } else {
                    deactivateCheatMode("autoPlay");
                }
                if (multiBall || singlePlayer || !pause) {
                    disableCheatMode("cheatMode");
                } else if (cheatMode) {
                    activateCheatMode("cheatMode");
                } else {
                    deactivateCheatMode("cheatMode");
                }
            }

            // SinglePlayer Deactivation
            else if (answer === "multiPlayer") {
                if (singlePlayer) {
                    alert("Single Player Mode deactivated\nType 'singlePlayer to reactivate it.");
                } else {
                    alert("Single Player Mode is already deactivated.\nType 'singlePlayer' to activate it.");
                }
                if (cheatMode) {
                    disableCheatMode("singlePlayer");
                    disableCheatMode("playerSlider");
                } else {
                    deactivateCheatMode("singlePlayer");
                    deactivateCheatMode("playerSlider");
                }
                if (autoPlay || multiBall || !pause) {
                    disableCheatMode("cheatMode");
                } else if (cheatMode) {
                    activateCheatMode("cheatMode");
                } else {
                    deactivateCheatMode("cheatMode");
                }
            }

            // MultiBall Deactivation
            else if (answer === "noMulti") {
                if (multiBall) {
                    if (confirm("Deactivating MultiBall will restart the current game. Do you still want to continue?")) {
                        alert("MultiBall deactivated.\nType 'multiBall' to reactivate it.");
                        if (cheatMode) {
                            disableCheatMode("multiBall");
                        } else {
                            deactivateCheatMode("multiBall");
                        }
                        if (autoPlay || singlePlayer || !pause) {
                            disableCheatMode("cheatMode");
                        } else if (cheatMode) {
                            activateCheatMode("cheatMode");
                        } else {
                            deactivateCheatMode("cheatMode");
                        }
                        restartGame(p2.id);
                    } else {
                        activateCheatMode("multiBall");
                        disableCheatMode("cheatMode");
                    }
                } else {
                    alert("MultiBall is already deactivated.\nType 'multiBall' to activate it.")
                    if (cheatMode) {
                        disableCheatMode("multiBall");
                    } else {
                        deactivateCheatMode("multiBall");
                    }
                }
            }

            // PaddleControl Deactivation
            else if (answer === "noPaddle") {
                if (paddleControl) {
                    alert("PaddleControl deactivated.\nType 'paddleControl' to reactivate it.");
                } else {
                    alert("PaddleControl is already deactivated.\nType 'paddleControl' to activate it.");
                }
                deactivateCheatMode("paddleControl");
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

    // NOTE: I'm keeping this commented out in the code for now, in case I need it again.
    // function chooseCheatModeOLD() {
    //     if (!restartingRound) {
    //         let answer = prompt("Password:");

    //         // Cheat Mode Activation
    //         if (answer === "^^vv<><>ba") {
    //             if (autoPlay) {
    //                 alert("Cannot activate Cheat Mode because AutoPlay is activated.\nType 'noAuto' to deactivate it.");
    //                 cheatMode = false;
    //             } else if (singlePlayer) {
    //                 alert("Cannot activate Cheat Mode because Single Player Mode is activated.\nType 'multiPlayer' to deactivate it.");
    //                 cheatMode = false;
    //             } else if (multiBall) {
    //                 alert("Cannot activate Cheat Mode because MultiBall is activated.\nType 'noMulti' to deactivate it.");
    //                 cheatMode = false;
    //             } else if (cheatMode) {
    //                 alert("Cheat Mode is already activated.\nType 'noCheat' to deactivate it.");
    //                 cheatMode = true;
    //             } else if (!pause) {
    //                 alert("Cannot activate Cheat Mode because the game is not paused.\nPress space to pause the game.");
    //                 cheatMode = false;
    //             } else {
    //                 alert("Cheat Mode activated!\nUse these controls to move the ball:\nU: Up\nH: Left\nJ: Down\nK: Right\nType 'noCheat' to deactivate Cheat Mode.");
    //                 cheatMode = true;
    //             }
    //         }

    //         // FreePlay Activation
    //         else if (answer === "freePlay") {
    //             if (freePlay) {
    //                 alert("FreePlay is already activated.\nType 'noFree' to deactivate it.");
    //             } else {
    //                 alert("FreePlay activated!\nType 'noFree' to deactivate it.");
    //             }
    //             freePlay = true;
    //         }

    //         // AutoPlay Activation
    //         else if (answer === "autoPlay") {
    //             if (cheatMode) {
    //                 alert("Cannot activate AutoPlay because Cheat Mode is activated.\nType 'noCheat' to deactivate it.");
    //                 autoPlay = false;
    //             } else if (singlePlayer) {
    //                 if (confirm("Activating AutoPlay will deactivate Single Player Mode. Continue?")) {
    //                     alert("AutoPlay activated!\nType 'noAuto' to deactivate it.\n\nSingle Player Mode deactivated.\nType 'singlePlayer' to reactivate it.");
    //                     singlePlayer = false;
    //                     autoPlay = true;
    //                 } else {
    //                     alert("AutoPlay activation cancelled.\nType 'autoPlay' to activate AutoPlay.\nType 'multiPlayer' to deactivate Single Player Mode.");
    //                     singlePlayer = true;
    //                     autoPlay = false;
    //                 }
    //             } else if (autoPlay) {
    //                 alert("AutoPlay is already activated.\nType 'noAuto' to deactivate it.");
    //                 autoPlay = true;
    //             } else {
    //                 alert("AutoPlay activated!\nType 'noAuto' to deactivate it.");
    //                 autoPlay = true;
    //             }
    //         }

    //         // SinglePlayer Activation
    //         else if (answer === "singlePlayer") {
    //             if (cheatMode) {
    //                 alert("Cannot activate Single Player Mode because Cheat Mode is activated.\nType 'noCheat' to deactivate it.");
    //                 singlePlayer = false;
    //             } else if (autoPlay) {
    //                 if (confirm("Activating Single Player Mode will deactivate AutoPlay. Continue?")) {
    //                     choosePlayer();
    //                     if (playerChosen === null) {
    //                         alert("Single Player Mode activation cancelled.\nType 'singlePlayer' to activate Single Player Mode.\nType 'noAuto' to deactivate AutoPlay.");
    //                         autoPlay = true;
    //                         singlePlayer = false;
    //                     } else {
    //                         alert("Single Player Mode activated!\nType 'multiPlayer' to deactivate it.\n\nAutoPlay deactivated.\nType 'autoPlay' to reactivate it.");
    //                         autoPlay = false;
    //                         singlePlayer = true;
    //                     }
    //                 } else {
    //                     alert("Single Player Mode activation cancelled.\nType 'singlePlayer' to activate Single Player Mode.\nType 'noAuto' to deactivate AutoPlay.");
    //                     autoPlay = true;
    //                     singlePlayer = false;
    //                 }
    //             } else if (singlePlayer) {
    //                 if (confirm("Single Player Mode is already activated.\nWould you like to select a different player?")) {
    //                     choosePlayer();
    //                     if (playerChosen === null) {
    //                         alert("Single Player Mode activation cancelled.\nType 'singlePlayer' to choose a different player.\nType 'multiPlayer' to deactivate Single Player Mode.");
    //                     } else {
    //                         alert("Single Player Mode reactivated!\nType 'multiPlayer' to deactivate it.");
    //                         singlePlayer = true;
    //                     }
    //                 } else {
    //                     alert("Single Player Mode activation cancelled.\nType 'singlePlayer' to choose a different player.\nType 'multiPlayer' to deactivate Single Player Mode.");
    //                 }
    //             } else {
    //                 choosePlayer();
    //                 if (playerChosen === null) {
    //                     alert("Single Player Mode activation cancelled.\nType 'singlePlayer' to activate Single Player Mode.");
    //                     singlePlayer = false;
    //                 } else {
    //                     alert("Single Player Mode activated!\nType 'multiPlayer' to deactivate it.");
    //                     singlePlayer = true;
    //                 }
    //             }
    //         }

    //         // MultiBall Activation
    //         else if (answer === "multiBall") {
    //             if (cheatMode) {
    //                 alert("Cannot activate MultiBall because Cheat Mode is activated.\nType 'noCheat' to deactivate it.");
    //                 multiBall = false;
    //             } else {
    //                 if (confirm(((multiBall) ? "Rea" : "A") + "ctivating MultiBall will restart the current game. Do you still want to continue?")) {
    //                     let ballCountOld = ballCount;
    //                     do {
    //                         ballCount = prompt("How many balls?");
    //                         if (showTelemetryMultiBall) {
    //                             console.log("ballCountOld: " + ballCountOld);
    //                             console.log("ballCount: " + ballCount);
    //                         }
    //                         // Was Cancel pressed?
    //                         if (ballCount == null) {break;}
    //                         else {ballCount = Number(ballCount);}
    //                         // Make sure the correct amount is entered
    //                         if (ballCount < 2) {alert("Please enter more than 1 ball.");}
    //                         else if (ballCount > 50) {alert("Please enter 50 or less balls.");}
    //                         // Make sure a number is entered.
    //                         else if (isNaN(ballCount)) {alert("Please enter a valid number.");}
    //                     } while (isNaN(ballCount) || ballCount < 2 || ballCount > 50);
    //                     if (ballCount == null) {
    //                         alert("MultiBall activation cancelled." + ((multiBall) ? "\nType 'noMulti' to deactivate MultiBall." : "")); 
    //                         ballCount = ballCountOld;
    //                     } else {
    //                         alert("MultiBall activated with " + ballCount + " balls!\nType 'noMulti' to deactivate it.");
    //                         multiBall = true;
    //                         restartGame(p2.id);
    //                     }
    //                 } else {
    //                     alert("MultiBall activation cancelled." + ((multiBall) ? "\nType 'noMulti' to deactivate MultiBall." : ""));
    //                 }
    //             }
    //         }

    //         // PaddleControl Activation
    //         else if (answer === "paddleControl") { 
    //             if (paddleControl) {
    //                 alert("PaddleControl is already activated. Type 'noPaddle' to deactivate it.");
    //                 paddleControl = true;
    //             } else {
    //                 alert("PaddleControl activated! Type 'noPaddle' to deactivate it.");
    //                 paddleControl = true;
    //             }
    //         }

    //         // Cheat Mode Deactivation
    //         else if (answer === "noCheat") {
    //             if (cheatMode) {
    //                 if (!pause) {
    //                     alert("Cannot deactivate Cheat Mode because the game is not paused.\nPress space to pause the game.");
    //                     cheatMode = true;
    //                 } else {
    //                     alert("Cheat Mode deactivated.\nType the password to reactivate it.");
    //                     cheatMode = false;
    //                 }
    //             } else {
    //             cheatMode = false;
    //                 alert("Cheat Mode is already deactivated.\nType the password to activate it.");
    //                 cheatMode = false;
    //             }
    //         }

    //         // FreePlay Deactivation
    //         else if (answer === "noFree") {
    //             if (freePlay) {
    //                 alert("FreePlay deactivated.\nType 'freePlay' to reactivate it.");
    //             } else {
    //                 alert("FreePlay is already deactivated.\nType 'freePlay' to activate it.");
    //             }
    //             freePlay = false;
    //         }

    //         // AutoPlay Deactivation
    //         else if (answer === "noAuto") {
    //             if (autoPlay) {
    //                 alert("AutoPlay deactivated.\nType 'autoPlay' to reactivate it.");
    //             } else {
    //                 alert("AutoPlay is already deactivated.\nType 'autoPlay' to activate it.");
    //             }
    //             autoPlay = false;
    //         }

    //         // MultiBall Deactivation
    //         else if (answer === "noMulti") {
    //             if (multiBall) {
    //                 if (confirm("Deactivating MultiBall will restart the current game. Do you still want to continue?")) {
    //                     alert("MultiBall deactivated.\nType 'multiBall' to reactivate it.");
    //                     multiBall = false;
    //                     restartGame(p2.id);
    //                 } else {
    //                     multiBall = true;
    //                 }
    //             } else {
    //                 alert("MultiBall is already deactivated.\nType 'multiBall' to activate it.");
    //                 multiBall = false;
    //             }
    //         }

    //         // SinglePlayer Deactivation
    //         else if (answer === "multiPlayer") {
    //             if (singlePlayer) {
    //                 alert("Single Player Mode deactivated\nType 'singlePlayer to reactivate it.");
    //             } else {
    //                 alert("Single Player Mode is already deactivated.\nType 'singlePlayer' to activate it.");
    //             }
    //             singlePlayer = false;
    //         }

    //         // PaddleControl Deactivation
    //         else if (answer === "noPaddle") {
    //             if (paddleControl) {
    //                 alert("PaddleControl deactivated.\nType 'paddleControl' to reactivate it.");
    //             } else {
    //                 alert("PaddleControl is already deactivated.\nType 'paddleControl' to activate it.");
    //             }
    //             paddleControl = false;
    //         }

    //         // Pressed Cancel
    //         else if (answer === null || answer === "") {
    //             // Do nothing.
    //         }

    //         // Wrong Password
    //         else {
    //             alert("Wrong Password.");
    //         }
    //     }
    // }

    function choosePlayer() {
        do {
            playerChosen = prompt("Choose a Player:\nP1 or P2");
            console.log(playerChosen);
            // Check if the value is null, otherwise convert the value to a lowercase string
            if (playerChosen === null) {break;}
            else {playerChosen = playerChosen.toString().toLowerCase();}
            // Check if the value is "close enough"
            if (playerChosen === "1" || playerChosen === "player1" || playerChosen === "player 1" || playerChosen === "blue" || playerChosen === "cyan") {
                playerChosen = "p1";
                $("#choosePlayer").prop("checked", false);
            } else if (playerChosen === "2" || playerChosen === "player2" || playerChosen === "player 2" || playerChosen === "red" || playerChosen === "pink") {
                playerChosen = "p2";
                $("#choosePlayer").prop("checked", true);
            }
            // Check if the value is a valid value
            if (playerChosen != "p1" && playerChosen != "p2") {alert("Please enter either 'P1' or 'P2'.");}
            else {
                alert("Player " + playerChosen.slice(1) + " chosen!\n" + 
                ((playerChosen === "p1") ? "P1 Controls: W S" : "P2 Controls: Up Down"));
            }
        } while (playerChosen != "p1" && playerChosen != "p2");
    }
    
    function targetBall() {
        // Set the targeted ball to no targeted ball if it doesn't have a ball to target
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

        // Find ball closest to the paddle that's also moving towards it, but isn't behind it
        for (let ball of ballPit) {
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
        // update all velocities
        updateAllVelocities();

        // update object borders
        updateAllObjectBorders();

        // keep the objects in the borders
        enforceNoNoZone(paddleLeft);
        enforceNoNoZone(paddleRight);

        for (let ball of ballPit) {
            // handle ball/wall collisions
            if (cheatMode) {enforceNoNoZone(ball);}
            else {bounceBall(ball);}

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

        // update all velocities
        updateAllVelocities();

        // update object borders
        updateAllObjectBorders();
        
        // Decide which ball to automatically target
        if (autoPlay || singlePlayer) {targetBall();}
    }

    function updateObjectBorders(obj) {
        obj.borderLeft = obj.x;
        obj.borderRight = obj.x + obj.width;
        obj.borderTop = obj.y;
        obj.borderBottom = obj.y + obj.height;
    }

    function updateAllObjectBorders() {
        // update object borders
        updateObjectBorders(paddleLeft);
        updateObjectBorders(paddleRight);
        for (let ball of ballPit) {
            updateObjectBorders(ball);
        }
    }

    function enforceNoNoZone(obj) {
        while (obj.borderLeft < BORDERS.LEFT) {
            obj.x = BORDERS.LEFT;
            updateObjectBorders(obj);
            console.log(obj.id + " passed left border");
        }
        while (obj.borderTop < BORDERS.TOP) {
            obj.y = BORDERS.TOP;
            updateObjectBorders(obj);
            console.log(obj.id + " passed top border");
        }
        while (obj.borderRight > BORDERS.RIGHT) {
            obj.x = BORDERS.RIGHT - obj.width;
            updateObjectBorders(obj);
            console.log(obj.id + " passed right border");
        }
        while (obj.borderBottom > BORDERS.BOTTOM) {
            obj.y = BORDERS.BOTTOM - obj.height;
            updateObjectBorders(obj);
            console.log(obj.id + " passed bottom border");
        }
    }
    
    function playSound(source) {
        if (!mute) {
            if (source === "p1") {$("audio#p1")[0].play();}
            else if (source === "p2") {$("audio#p2")[0].play();}
            else if (source === "side") {$("audio#side")[0].play();}
            else if (source === "top") {$("audio#top")[0].play();}
            console.log("playing " + source);
        } else {
            console.log(source + " is currently muted");
        }
    }

    function bounceBall(ballObj) { 
        while (ballObj.borderLeft < BORDERS.LEFT && !restartingRound) {
            playSound("side");
            if (freePlay) {
                // Bounce the ball
                ballObj.speed.right = ballObj.speed.left;
                ballObj.speed.left = 0;
                updateVelocity(ballObj);
                console.log(ballObj.id + " bounced left border");
                // Push the ball out of the wall
                ballObj.x += ballObj.velocityX*2;
            } else {
                ballObj.x = BORDERS.LEFT;
                ballObj.y -= ballObj.velocityY;
            }
            updateObjectBorders(ballObj);
            console.log(ballObj.id + " passed left border");

            playerLose(ballObj, p1.id);
        }
        while (ballObj.borderTop < BORDERS.TOP && !restartingRound) {
            // Bounce the ball
            playSound("top");
            ballObj.speed.down = ballObj.speed.up;
            ballObj.speed.up = 0;
            updateVelocity(ballObj);
            console.log(ballObj.id + " bounced top border");
            // Push the ball out of the wall
            ballObj.y += ballObj.velocityY*2;
            updateObjectBorders(ballObj);
            console.log(ballObj.id + " passed top border");
        }
        while (ballObj.borderRight > BORDERS.RIGHT && !restartingRound) {
            playSound("side");
            if (freePlay) {
                // Bounce the ball
                ballObj.speed.left = ballObj.speed.right;
                ballObj.speed.right = 0;
                updateVelocity(ballObj);
                console.log(ballObj.id+" bounced right border");
                // Push the ball out of the wall
                ballObj.x += ballObj.velocityX*2;
            } else {
                ballObj.x = BORDERS.RIGHT - ballObj.width;
                ballObj.y -= ballObj.velocityY;
            }
            updateObjectBorders(ballObj);
            console.log(ballObj.id + " passed right border");

            playerLose(ballObj, p2.id);
        }
        while (ballObj.borderBottom > BORDERS.BOTTOM && !restartingRound) {
            // Bounce the ball
            playSound("top");
            ballObj.speed.up = ballObj.speed.down;
            ballObj.speed.down = 0;
            updateVelocity(ballObj);
            console.log(ballObj.id + " bounced bottom border");
            // Push the ball out of the wall
            ballObj.y += ballObj.velocityY*2;
            updateObjectBorders(ballObj);
            console.log(ballObj.id + " passed bottom border");
        }

        ballObj.firstTimeBouncedWall = true;
    }

    function handlePaddleCollisions(ball, paddle) {
        // if it is the first time bouncing on one
        if (ball.firstTimeBouncedPaddle) {
            // Mix up the ball's predicted position in AutoPlay
            randPredictedPositionYMod();
            // if it bounced off the paddle's left border...
            if (whichBorder(ball, paddle) === "left") {
                // bounce the ball left
                ball.x -= PPF*2;
                ball.speed.left = PPF;
                ball.speed.right = 0;
                // increase the score
                if (paddle === paddleRight) {
                    playSound("p2");
                    score.bounced++;
                    if (!multiBall) {increaseGameSpeed();}
                } else {
                    playSound("p1");
                }
                console.log(ball.id+" bounced " + tellPaddle(paddle) + " paddle's left border");
            }
            // if it bounced off the paddle's right border...
            else if (whichBorder(ball, paddle) === "right") {
                // bounce the ball right
                ball.x += PPF*2;
                ball.speed.right = PPF;
                ball.speed.left = 0;
                // increase the score
                if (paddle === paddleLeft) {
                    playSound("p1");
                    score.bounced++;
                    if (!multiBall) {increaseGameSpeed();}
                } else {
                    playSound("p2");
                }
                console.log(ball.id+" bounced " + tellPaddle(paddle) + " paddle's right border");
            }
            // tell us it isn't the first time bouncing anymore
            ball.firstTimeBouncedPaddle = false;
        }
    }

    function whichBorder(obj1, obj2) {
        if ((obj1.borderRight > obj2.borderLeft && obj1.borderLeft < (obj2.borderRight - obj2.width / 2)) &&    // right border is in the left border
            (obj1.borderTop < obj2.borderBottom && obj1.borderBottom > obj2.borderTop)) {                       // and the top and bottom borders are between the other's top and bottom borders
            return "left";
        }
        if ((obj1.borderLeft < obj2.borderRight && obj1.borderRight > (obj2.borderLeft + obj2.width / 2)) &&    // left border is in the right border and the right border in halfway in the left border
            (obj1.borderTop < obj2.borderBottom && obj1.borderBottom > obj2.borderTop)) {                       // and the top and bottom borders are between the other's top and bottom borders
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
        if ((obj1.borderLeft < obj2.borderRight &&
             obj1.borderTop < obj2.borderBottom) &&
            (obj1.borderRight > obj2.borderLeft &&
             obj1.borderBottom > obj2.borderTop)) {
            return true;
        } else {
            return false;
        }
    }


    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// POINTS & SCOREBOARD /////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // TODO: Find a way to update the scoreboard *before* the game alerts who has won
    // ...this is so simple. I'd need to move away from alert()s and // TODOING: start using on-screen text for menus
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
            if (!gameWon) {
                restartingRound = true;
                clearInterval(interval);
                setTimeout(restartRound.bind(null, player), 1000);
            } else {
                $(".balls").css("background-color", "lime");
                if (playAgain()){restartGame(player);}
                else {endGame();}
            }
        }
        // tell us it isn't the first time bouncing anymore
        ballObj.firstTimeBouncedWall = false;
    }

    function whoWon() { // TODO: Implement methods for if there is a tie, somehow (eh, maybe). It would get rid of the redundant double-win processes.
        if (score.p1 >= score.WIN || isNaN(score.p1)) {
            $("#paddleLeft").css("background-color", "lime");
            alert(text.p1);
            gameWon = true;
        }
        if (score.p2 >= score.WIN || isNaN(score.p2)) {
            $("#paddleRight").css("background-color", "lime");
            alert(text.p2);
            gameWon = true;
        }
    }


    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// REPOSITIONING FUNCTIONS /////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * Snap position to a multiple of the pixels per frame speed to prevent
     * collision between the paddles and wall from being off, and to prevent
     * odd collision bugs with the paddle and ball.
     * @param {double} position - The position to be snapped.
     */
    function snapUp(position) {position -= position % PPF; return position;}
    
    /**
     * Snap position to a multiple of the pixels per frame speed to prevent
     * collision between the paddles and wall from being off, and to prevent
     * odd collision bugs with the paddle and ball.
     * @param {double} position - The position to be snapped.
     */
    function snapDown(position) {position += PPF - (position % PPF); return position;}

    /**
     * Snap position to a multiple of the pixels per frame speed to prevent
     * collision between the paddles and wall from being off, and to prevent
     * odd collision bugs with the paddle and ball.
     */
    function snapPaddles() {
        snapUp(paddleLeft.y);
        snapUp(paddleRight.y);
    }

    function randPredictedPositionYMod() {
        varPredictedPositionY = Math.floor(Math.random() * 60) - 30;
        console.log("predicted ball position modified by " + varPredictedPositionY);
    }

    /**
     * Calculates the amount of frames it will take for one point to reach the second point.
     * - Distance from point A to point B...
     * - Divided by distance/frame.
     * @param {object} pointPaddle - The first point of reference.
     * @param {object} pointBall - The second point of reference (which has a velocity).
     * @param {object} velocityBall - The pixels/frame velocity of one of the two points.
     */
    function calculateTime(pointPaddle, pointBall, velocityBall) {
        let predictedPosition;
        if (pointPaddle.id == "#paddleLeft") {
            predictedPosition = ((pointPaddle.borderRight)-pointBall.x)/velocityBall.velocityX;
        } else if (pointPaddle.id == "#paddleRight") {
            predictedPosition = (pointPaddle.x-(pointBall.borderRight))/velocityBall.velocityX; // Add 1 to account for the reversed borders
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
     * @param {object} paddleObj - The object to use as a second point of reference.
     * @param {object} ballObj - The ball whose position is being predicted.
     * @returns {double} The Y position of the ball where it meets the object's X position, 
     * **modified to the point above the ball that would center the paddle with the ball.**
     */
    function predictBallPosition(paddleObj, ballObj) {
        let predictedPosition = ballObj.y + (calculateTime(paddleObj, ballObj, ballObj)*(ballObj.velocityY));
        if (!singlePlayer) {
            do {
                if (predictedPosition < BORDERS.TOP) {predictedPosition = -predictedPosition;}
                else if (predictedPosition > BORDERS.BOTTOM) {predictedPosition = Math.floor(BORDERS.BOTTOM) + ((Math.floor(BORDERS.BOTTOM) - ballObj.height*2) - predictedPosition);}
            } while (predictedPosition < BORDERS.TOP || predictedPosition > BORDERS.BOTTOM);
        }
        // The below line centers the predicted position on the paddle and the ball
        return predictedPosition - paddleObj.height/2 + ballObj.height/2;// + varPredictedPositionY;
    }

    function centerPredictedPosition(position, paddleObj, ballObj) {
        return position - paddleObj.height/2 + ballObj.height/2;
    }

    function unCenterPredictedPosition(position, paddleObj, ballObj) {
        return position + paddleObj.height/2 - ballObj.height/2;
    }

    /**
     * Calculates the pixels/frame required for an object to catch the ball in time.
     * - First, we find the distance between the ball's predicted Y position and the 
     *   object's current Y position.
     * - Then, we calculate the amount of frames it will take for the ball's X position
     *   to reach the object's X position.
     * - We divide pixels by frames, and we get a velocity.
     * - Sometimes the calculated time is zero. We force the added value to be 0 to prevent a Divide By Zero error.
     * @param {object} paddleObj - The object whose required velocity will be calculated. 
     * @param {object} ballObj - The object whose velocity will be used in the calculations.
     * @returns {double} The Y velocity required to reach the ball before it passes the object up.
     */
    function moveToPredictedBallPositionMultiPlayer(paddleObj, ballObj) {
        let predictedMovement = predictBallPosition(paddleObj, ballObj) - paddleObj.y + varPredictedPositionY;
        let calculatedTime = calculateTime(paddleObj, ballObj, ballObj);
        let calculatedVelocity = predictedMovement / calculatedTime;
        if (calculatedTime <= 0) {paddleObj.velocityY = 0;} 
        else {paddleObj.velocityY = calculatedVelocity;}
    }

    function moveToPredictedBallPositionSinglePlayer(paddleObj, ballObj) {
        let predictedPosition = predictBallPosition(paddleObj, ballObj) + varPredictedPositionY;
        let predictedMovement = predictedPosition - paddleObj.y;
        
        // Negative predictedMovement: Up
        // Positive predictedMovement: Down
        updateObjectBorders(paddleObj);
        updateObjectBorders(ballObj);

        if (predictedPosition < (paddleObj.borderTop - (paddleObj.height/4)*1.5) ||
            predictedPosition > (paddleObj.borderTop + (paddleObj.height/4)*1.5)) {
            if (predictedMovement > 0) {paddleObj.velocityY = PPF;}
            else if (predictedMovement < 0) {paddleObj.velocityY = -PPF;}
            else {paddleObj.velocityY = PPF_STOP;}
        }
        else {paddleObj.velocityY = PPF_STOP;}
    }

    function repositionGameItem(gameItem) {
        gameItem.x += gameItem.velocityX;
        gameItem.y += gameItem.velocityY;
    }

    function repositionAllGameItems() {
        // update the object borders
        updateAllObjectBorders();

        // update all velocities
        updateAllVelocities();

        // Paddle Repositioning
        if (autoPlay) {
            if (targetedBallLeft.id != "#ballNull") {moveToPredictedBallPositionMultiPlayer(paddleLeft, targetedBallLeft);}
            if (targetedBallRight.id != "#ballNull") {moveToPredictedBallPositionMultiPlayer(paddleRight, targetedBallRight);}
        } else if (singlePlayer) {
            if (playerChosen === "p2") {
                if (targetedBallLeft.id != "#ballNull") {moveToPredictedBallPositionSinglePlayer(paddleLeft, targetedBallLeft);}
            } else if (playerChosen === "p1") {
                if (targetedBallRight.id != "#ballNull") {moveToPredictedBallPositionSinglePlayer(paddleRight, targetedBallRight);}
            }
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

        if (showTelemetryBallNumbers) {
            $(".balls span").show();
        } else {
            $(".balls span").hide();
        }
        
        // Cheat Mode Colors
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

        // Border Colors
        if (pause) {
            $(".board").css("border-color", "lime");
        } else if (freePlay) {
            $(".board").css("border-color", "orange");
        } else {
            $(".board").css("border-color", "white");
        }

        // Paddle Colors
        if (autoPlay || (singlePlayer && playerChosen === "p2")) {
            $("#paddleLeft").css("background-color", "blue");
            $("#paddleLeft").css("box-shadow", "0px 0px 0px 3px cyan inset");
        } else {
            $("#paddleLeft").css("background-color", "cyan");
            $("#paddleLeft").css("box-shadow", "0px 0px 0px 3px teal inset");
        }
        if (autoPlay || (singlePlayer && playerChosen === "p1")) {
            $("#paddleRight").css("background-color", "maroon");
            $("#paddleRight").css("box-shadow", "0px 0px 0px 3px red inset");
        } else {
            $("#paddleRight").css("background-color", "hotpink");
            $("#paddleRight").css("box-shadow", "0px 0px 0px 3px maroon inset");
        }
        
        // Dashboard Colors
        handleCheatModesColors();

        // Testing Modes
        // testMode(singlePlayer);
    }

    function testMode(mode) {
        if (mode) {
            $("body").css("background-color", "hotpink");
        } else {
            $("body").css("background-color", "darkgreen");
        }
    }

    function redrawGameItem(gameItem) {
        $(gameItem.id).css("left", gameItem.x);
        $(gameItem.id).css("top", gameItem.y);
    }

    function redrawScoreBoard() {
        $("#p1Tally"+score.p1).css("background-color", "blue");
        $("#p2Tally"+score.p2).css("background-color", "red");

        if (score.p1 >= 10 || score.p2 >= 10) {
            $(".winTallyMark").css("background-color", "lime");
            if (score.p1 == score.p2) {
                $(".tallyMark").css("box-shadow", "0px 0px 0px 3px violet inset");
                $(".winTallyMark").css("box-shadow", "0px 0px 0px 3px violet inset");
                if (score.p1 >= 10) {$(".p1TallyMark").css("background-color", "blue");}
                if (score.p2 >= 10) {$(".p2TallyMark").css("background-color", "red");}
            } else if (score.p1 > score.p2) {
                $(".tallyMark").css("box-shadow", "none");
                $(".p1TallyMark").css("background-color", "lime");
                $(".p1TallyMark").css("box-shadow", "0px 0px 0px 3px blue inset");
                if (score.p2 >= 10) {$(".p2TallyMark").css("background-color", "red");}
                $(".winTallyMark").css("box-shadow", "0px 0px 0px 3px blue inset");
            } else if (score.p2 > score.p1) {
                $(".tallyMark").css("box-shadow", "none");
                $(".p2TallyMark").css("background-color", "lime");
                $(".p2TallyMark").css("box-shadow", "0px 0px 0px 3px red inset");
                if (score.p1 >= 10) {$(".p1TallyMark").css("background-color", "blue");}
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
        // Check if the game is won
        if (gameWon) {resetGame();}
        
        // Reset the score
        score.bounced = 0;
        ticks = 0;
        // Reset the frame rate
        restartTimer();
        // Reset the balls
        for (let ball of ballPit) {
            // Remove excess balls from the screen
            if (ball != ball0) {
                $(ball.id).remove();
            }
            // Reset the original ball
            else {
                ball.color = getRandomColor();
                ball.x = CENTERS.BORDER.HORIZONTAL-CENTERS.BALL;
                ball.y = CENTERS.BORDER.VERTICAL-CENTERS.BALL;
                randBallVelocityY(ball);
                if (player === p1.id) {
                    ball.speed.left = 0;
                    ball.speed.right = PPF;
                    xDirection = 1;
                } else if (player === p2.id) {
                    ball.speed.left = PPF;
                    ball.speed.right = 0;
                    xDirection = -1;
                } else {
                    alert(text.error + " in restartRound " + player);
                }
            }
        }
        // Remove excess balls from the ballPit
        ballPit.splice(1, ballPit.length);
        // Reset the paddles' positions
        paddleLeft.y = CENTERS.BORDER.VERTICAL-CENTERS.PADDLE.VERTICAL;
        paddleLeft.x = 50;
        paddleRight.y = CENTERS.BORDER.VERTICAL-CENTERS.PADDLE.VERTICAL;
        paddleRight.x = BORDERS.RIGHT-50-paddleRight.width;
        // Reset the targeted balls
        targetedBallLeft = ballNullLeft;
        targetedBallRight = ballNullRight;
        // Unpause the game
        deactivateCheatMode("pause");

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
        resetScoreBoard();
    }

    function resetVariables() {
        deactivateCheatMode("pause");
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

    function resetScoreBoard() {
        $(".p1TallyMark").css("background-color", "darkblue");
        $(".p2TallyMark").css("background-color", "maroon");
        $(".winTallyMark").css("background-color", "limegreen");
        $(".p1TallyMark").css("box-shadow", "none");
        $(".p2TallyMark").css("box-shadow", "none");
        $(".winTallyMark").css("box-shadow", "none");
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

        // disable the dashboard
        $("button").attr("disabled", true);
        $("input").attr("disabled", true);
    }
}