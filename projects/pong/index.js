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

    var ball = createGameObject(340, 210, -5, -2.5, "#ball0");           // ball

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
    var freePlay = true;
    var autoPlay = true;
    var multiBall = true;
    var ballPit = [];
    ballPit.push(ball);
    var ballPitLeft = [];
    ballPitLeft.push(ball);
    var ballPitRight = [];
    var targetedBallLeft = ballNullLeft;
    var targetedBallRight = ballNullRight;
    var ballPitFilled = false;
    var debug = true;
    var gameWon = false;
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
    var ticks = 0;
    function newFrame() {
        if (!pause) {
            ticks++;
            targetBall();
            // console.log(ticks);
            // getBallPitTelemetry();
        }
        if (multiBall) {
            if (ticks%60 == 0 && ticks <= 60*0) {
                createNewBall();
                // getBallPitTelemetry();
            }
        }
        updateTemporaryVelocity(ball);
        pauseGame();
        changeColors()
        if (debug) {
            showTelemetries();
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
            ball.speed.up = ball.temporaryVelocity.up;
            ball.speed.left = ball.temporaryVelocity.left;
            ball.speed.down = ball.temporaryVelocity.down;
            ball.speed.right = ball.temporaryVelocity.right;
            firstTimeCheat = true;
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
        if (gameObject.id.replace(/[0-9]/g, '') === "#ball") {
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


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    /////////////// Velocity \\\\\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function showTelemetries() {

        

            // console.log(">>> " + each.id + " <<<");

            // console.log("TARGET LEFT REQUIREMENTS:");
            // // console.log(each.velocityX < 0);
            // // console.log(each.x >= paddleLeft.x);
            // console.log(calculateTime(paddleLeft, each, each) < calculateTime(paddleLeft, targetedBallLeft, targetedBallLeft));
            // console.log("Ball Calc Time: " + calculateTime(paddleLeft, each, each));
            // console.log("Target Calc Time: " + calculateTime(paddleLeft, targetedBallLeft, targetedBallLeft));

            // console.log("TARGET RIGHT REQUIREMENTS:");
            // // console.log(each.velocityX > 0);
            // // console.log(each.x <= paddleRight.x);
            // console.log(calculateTime(paddleRight, each, each) < calculateTime(paddleRight, targetedBallRight, targetedBallRight));
            // console.log("Ball Calc Time: " + calculateTime(paddleRight, each, each));
            // console.log("Target Calc Time: " + calculateTime(paddleRight, targetedBallRight, targetedBallRight));

        var signLeft = 1;
        var signRight = 1;
        if (targetedBallLeft.id == "#ballNull") {signLeft=-1;}
        if (targetedBallRight.id == "#ballNull") {signRight=-1;}

        // Ball Velocities
        $("#speeds b").text("Targeted Left: " + targetedBallLeft.id + " (SignLeft " + signLeft + ")");
        $("#up span").text("PaddleLeft X: " + paddleLeft.x);
        $("#left span").text("Targeted X: " + targetedBallLeft.x);
        $("#down span").text("VelocityX: " + targetedBallLeft.velocityX);
        $("#right span").text("Target Calc Time: " + calculateTime(paddleLeft, targetedBallLeft, targetedBallLeft)*signLeft);

        // Ball Temporary Velocities
        $("#tempSpeeds b").text("Targeted Right: " + targetedBallRight.id + " (SignRight " + signRight + ")");
        $("#tempUp span").text("PaddleRight X: " + paddleRight.x );
        $("#tempLeft span").text("Targeted X: " + targetedBallRight.x);
        $("#tempDown span").text("VelocityX: " + targetedBallRight.velocityX);
        $("#tempRight span").text("Target Calc Time: " + calculateTime(paddleRight, targetedBallRight, targetedBallRight)*signRight);

        // Ball Temporary Velocities
        $("#0Speeds b").text("Ball0: " + ball.id);
        $("#0Up span").text("Ball0 X: " + ball.x);
        $("#0Left span").text("VelocityX: " + ball.velocityX);
        $("#0Down span").text("Left Pred Position: " + predictBallPosition(paddleLeft, ball, ball));
        $("#0Right span").text("Right Pred Position: " + predictBallPosition(paddleRight, ball, ball));
    }

    function createBallTelemetry() {
        // for (let each of ballPit) {
        //     ballId = each.id;

        //     var $newTelemetry = $("div")
        //         .appendTo('')
        // }



        // // create a new div for the ball
        // var $newBall = $("<div>")
        //     .appendTo('#ballPit')
        //     .addClass('gameItem balls')
        //     // .addClass('balls')
        //     .attr("id", ballId)
        //     .css("left", 340)
        //     .css("top", 210)
        //     // .css("width", 20)
        //     // .css("height", 20)
        //     .css("background-color", "orange");
        // // store the new div in a variable
        // xDirection *= -1;
        // $newBall = createGameObject(340, 210, 5*xDirection, -2.5, "#"+ballId)
        // randBallVelocityY($newBall)
        // // push the new body into the ballPit
        // ballPit.push($newBall);
        // if (xDirection < 0) {ballPitLeft.push($newBall);}
        // else if (xDirection > 0) {ballPitRight.push($newBall)}
        // else {console.log(text.error)}
        // // filterBallPit($newBall);
        // // sortBallPit($newBall);
        // console.log("#"+ballId+" created!")
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

        // // ball Velocity
        // ball.velocityX = ball.speed.right - ball.speed.left;
        // ball.velocityY = ball.speed.down - ball.speed.up;

        // ballPit Velocity
        for (let each of ballPit) {
            each.velocityX = each.speed.right - each.speed.left;
            each.velocityY = each.speed.down - each.speed.up;
        }
    }

    function increaseGameSpeed() {
        clearInterval(interval);
        setTimeout(restartTimer, 0);
    }

    function randBallVelocityY(ballObj) {
        var randNum = 0;
        while (randNum >= 5 || randNum <= 1) {
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
        console.log("changed ball velocityY to " + varVelocityY);
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

        // AutoPlay Deactivation
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
        if (xDirection < 0) {ballPitLeft.push($newBall);}
        else if (xDirection > 0) {ballPitRight.push($newBall)}
        else {console.log(text.error)}
        // filterBallPit($newBall);
        // sortBallPit($newBall);
        console.log("#"+ballId+" created!")
    }

    // function filterBallpit() {
    //     for (let each of ballPit) {
    //         if (each.velocityX == -5) {
    //             ballPitLeft.shift(each);
    //             ballPitRight.pop();
    //         } else if (each.velocityX == 5) {
    //             ballPitRight.shift(each);
    //             ballPitLeft.pop();
    //         }
    //     }
    // }

    function filterBallPit(ballObj) {
        // var index = 0;


        // if (ballObj.velocityX > 0) {
        //     // ballPitLeft.unshift(ballObj);
        //     // ballPitRight.pop();
        //     index = ballPitLeft.indexOf(ballObj);
        //     if (index != -1) {
        //         ballPitLeft.splice(index, 1);
        //     }
        //     if (!ballPitRight.includes(ballObj)) {
        //         ballPitRight.push(ballObj);
        //     }
        // } else if (ballObj.velocityX < 0) {
        //     // ballPitRight.unshift(ballObj);
        //     // ballPitLeft.pop();
        //     index = ballPitRight.indexOf(ballObj);
        //     if (index != -1) {
        //         ballPitRight.splice(index, 1);
        //     }
        //     if (!ballPitLeft.includes(ballObj)) {
        //         ballPitLeft.push(ballObj);
        //     }
        // }
        // getBallPitTelemetry();
    }

    // function filterBallPit(ballObj) {
    //     var index = 0;

    //     for (let each in )


    //     if (ballObj.velocityX > 0) {
    //         // ballPitLeft.unshift(ballObj);
    //         // ballPitRight.pop();
    //         index = ballPitLeft.indexOf(ballObj);
    //         if (index != -1) {
    //             ballPitLeft.splice(index, 1);
    //         }
    //         if (!ballPitRight.includes(ballObj)) {
    //             ballPitRight.push(ballObj);
    //         }
    //     } else if (ballObj.velocityX < 0) {
    //         // ballPitRight.unshift(ballObj);
    //         // ballPitLeft.pop();
    //         index = ballPitRight.indexOf(ballObj);
    //         if (index != -1) {
    //             ballPitRight.splice(index, 1);
    //         }
    //         if (!ballPitLeft.includes(ballObj)) {
    //             ballPitLeft.push(ballObj);
    //         }
    //     }
    //     // getBallPitTelemetry();
    // }

    function targetBall() {
        for (let each of ballPit) {

            // getBallPitTelemetry();

            // console.log(">>> " + each.id + " <<<");

            // console.log("TARGET LEFT REQUIREMENTS:");
            // // console.log(each.velocityX < 0);
            // // console.log(each.x >= paddleLeft.x);
            // console.log(calculateTime(paddleLeft, each, each) < calculateTime(paddleLeft, targetedBallLeft, targetedBallLeft));
            // console.log("Ball Calc Time: " + calculateTime(paddleLeft, each, each));
            // console.log("Target Calc Time: " + calculateTime(paddleLeft, targetedBallLeft, targetedBallLeft));

            // console.log("TARGET RIGHT REQUIREMENTS:");
            // // console.log(each.velocityX > 0);
            // // console.log(each.x <= paddleRight.x);
            // console.log(calculateTime(paddleRight, each, each) < calculateTime(paddleRight, targetedBallRight, targetedBallRight));
            // console.log("Ball Calc Time: " + calculateTime(paddleRight, each, each));
            // console.log("Target Calc Time: " + calculateTime(paddleRight, targetedBallRight, targetedBallRight));

            if (targetedBallLeft.velocityX >= 0 ||
                targetedBallLeft.x < (paddleLeft.x /*+ $("#paddleLeft").width()*/)
                ) {
                    targetedBallLeft = ballNullLeft;
            }
            if (targetedBallRight.velocityX <= 0 ||
                targetedBallRight.x > (paddleRight.x)
                ) {
                    targetedBallRight = ballNullRight;
            }

            var signLeft = 1;
            var signRight = 1;
            if (targetedBallLeft.id == "#ballNull") {signLeft=-1;}
            if (targetedBallRight.id == "#ballNull") {signRight=-1;}


            if (each.velocityX < 0 && 
                each.x >= (paddleLeft.x /*+ $("#paddleLeft").width()*/) && 
                // calculateTime(paddleLeft, each, each) <= calculateTime(paddleLeft, targetedBallLeft, targetedBallLeft)*signLeft
                each.x <= targetedBallLeft.x
                ) {
                targetedBallLeft = each;
                console.log(targetedBallLeft.id + " is being targeted by LeftPaddle!");
            }
            else if (each.velocityX > 0 && 
                each.x <= paddleRight.x && 
                // calculateTime(paddleRight, each, each) <= calculateTime(paddleRight, targetedBallRight, targetedBallRight)*signRight
                each.x >= targetedBallRight.x
                ) {
                targetedBallRight = each;
                console.log(targetedBallRight.id + " is being targeted by RightPaddle!");
            }
            // console.log("Calculated Time Left: " + calculateTime(paddleLeft, each, each));
            // console.log(calculateTime(paddleLeft, each, each));
        }
        console.log("Left Target: "+targetedBallLeft.id+"\nRight Target: "+targetedBallRight.id);
    }

    function sortBallPit(ballObj) {
        // filterBallPit(ballObj);

        // targetBall();

        ballPitLeft.sort((a, b) => {return calculateTime(paddleLeft, b, b) - calculateTime(paddleLeft, a, a)})
        ballPitRight.sort((a, b) => {return calculateTime(paddleRight, b, b) - calculateTime(paddleRight, a, a)})
    }

    function getBallPitTelemetry() {
        console.log("ballPit:");
        console.log(ballPit);
        console.log("ballPitLeft:");
        console.log(ballPitLeft);
        console.log("ballPitRight:");
        console.log(ballPitRight);
    }

    function changeColors() {
        // targetBall();

        if (pause) {
            // $(".balls").css("background-color", "lime");
        } else {
            
            for (let each of ballPit) {
                if (each != targetedBallLeft && each != targetedBallRight) {$(each.id).css("background-color", "fuchsia");}
                if (each.velocityX < 0) {$(each.id).css("background-color", "blue");}
                if (each.velocityX > 0) {$(each.id).css("background-color", "maroon");}
                if (each == targetedBallLeft) {$(each.id).css("background-color", "cyan");}
                if (each == targetedBallRight) {$(each.id).css("background-color", "red");}
                // console.log(each.id);
                
                $(each.id).text(each.id.charAt(each.id.length-1)).css("text-align", "center");
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
        // updateObjectBorders(ball);
        for (let each of ballPit) {
            updateObjectBorders(each);
        }

        // keep the objects in the borders
        enforceNoNoZone(paddleLeft);
        enforceNoNoZone(paddleRight);
        if (cheatMode) {
            // enforceNoNoZone(ball);
            for (let each of ballPit) {
                enforceNoNoZone(each);
            }
        } else {
            for (let each of ballPit) {
                bounceBall(each);
                enforceNoNoZone(each);
            }
        }

        // check if the ball is touching the paddles
        for (let each of ballPit){
            if (doCollide(each, paddleLeft)) {
                console.log("ping");
                handlePaddleCollisions(paddleLeft);     // left paddle
            } else if (doCollide(each, paddleRight)) {
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
            console.log(obj.id + " passed left border")
        }
        if (obj.topY < BORDERS.TOP) {
            if (/*obj === ball || */ballPit.includes(obj)) {
                obj.y -= -5;
            } else if (autoPlay) {
                obj.y = BORDERS.TOP;
            } else {
                obj.y -= -5;
            }
            console.log(obj.id + " passed top border")
        }
        if (obj.rightX > BORDERS.RIGHT) {
            obj.x -= 5;
            console.log(obj.id + " passed right border")
        }
        if (obj.bottomY > BORDERS.BOTTOM) {
            if (/*obj === ball || */ballPit.includes(obj)) {
                obj.y -= 5;
            } else if (autoPlay) {
                obj.y = BORDERS.BOTTOM - $(obj.id).height();
            } else {
                obj.y -= 5;
            }
            console.log(obj.id + " passed bottom border")

        }
    }

    function bounceBall(ballObj) {
        if (ballObj.leftX < BORDERS.LEFT) {
            if (freePlay) {
                ballObj.speed.right = ballObj.speed.left;
                ballObj.speed.left = 0;
                filterBallPit(ballObj);
            }
            playerLose(p1.id);
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
                filterBallPit(ballObj);
            }
            playerLose(p2.id);
            console.log(ballObj.id+" bounced right border");
        }
        else if (ballObj.bottomY > BORDERS.BOTTOM) {
            ballObj.speed.up = ballObj.speed.down;
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
            for (let each of ballPit) {
                if (whichBorder(each, paddle) === "left") {
                    // bounce the ball left
                    each.speed.left = 5;
                    each.speed.right = 0;
                    each.x -= 1;
                    // increase the score
                    if (paddle === paddleRight) {
                        // sortBallPit(each);
                        score.bounced++;
                        if (!multiBall) {
                            increaseGameSpeed();
                        }
                    }
                    filterBallPit(each);
                    console.log(each.id+" bounced " + tellPaddle(paddle) + " paddle's left border");
                }
                // if it bounced off the paddle's right border
                else if (whichBorder(each, paddle) === "right") {
                    // bounce the ball right
                    each.speed.left = 0;
                    each.speed.right = 5;
                    each.x += 1;
                    // increase the score
                    if (paddle === paddleLeft) {
                        // sortBallPit(each);
                        score.bounced++;
                        if (!multiBall) {
                            increaseGameSpeed();
                        }
                    }
                    filterBallPit(each);
                    console.log(each.id+" bounced " + tellPaddle(paddle) + " paddle's right border");
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
        restartTimer();
        $("balls").css("background-color", "fuchsia");
        for (let each of ballPit) {
            each.x = 340;
            each.y = 210;
            randBallVelocityY(each);
            if (player === p1.id) {
                each.speed.left = 0;
                each.speed.right = 5;
            } else if (player === p2.id) {
                each.speed.left = 5;
                each.speed.right = 0;
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
        varPredictedPositionY = Math.floor(Math.random() * 80) - 40;
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
        if (pointB.id == "#paddleLeft") {
            return (pointA.x-pointB.x + $("#paddleLeft").width())/velocity.velocityX ;
        } else {
            return (pointA.x-pointB.x)/velocity.velocityX; 
        }
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
        var predictedPosition = ballObj.y + (calculateTime(obj, ballObj, ballObj)*(ballObj.velocityY)) - $(obj.id).height()/2 + $(ballObj.id).height()/2;// + varPredictedPositionY;
        if (predictedPosition < BORDERS.TOP) {predictedPosition = -predictedPosition - ballObj.y;}
        else if (predictedPosition > BORDERS.BOTTOM) {predictedPosition = BORDERS.BOTTOM - predictedPosition;}
        
        return predictedPosition;
    }

    /**
     * Calculates the pixels/frame required for an object to catch the ball in time.
     * - First, we find the distance between the ball's predicted Y position and the 
     *   object's current Y position.
     * - Then, we calculate the amount of frames it will take for the ball's X position
     *   to reach the object's X position.
     * - We divide pixels by frames, and we get a velocity.
     * @param {object} gameItem - The object whose required velocity will be calculated. 
     * @returns {double} The Y velocity required to reach the ball before it passes the object up.
     */
    function moveToPredictedBallPosition(gameItem, ballObj) {
        gameItem.y += (predictBallPosition(gameItem, ballObj)-gameItem.y) / (calculateTime(gameItem, ballObj, ballObj));
    }

    function repositionGameItem(gameItem) {
        gameItem.x += gameItem.velocityX;
        gameItem.y += gameItem.velocityY;
    }

    function repositionAllGameItems() {
        // Paddle Repositioning
        if (autoPlay) {
            // if (ballPitLeft.length > 0) {moveToPredictedBallPosition(paddleLeft, ballPitLeft[ballPitLeft.length - 1]);}
            // if (ballPitRight.length > 0) {moveToPredictedBallPosition(paddleRight, ballPitRight[ballPitRight.length - 1]);}
            if (targetedBallLeft.id != "#ballNull") {moveToPredictedBallPosition(paddleLeft, targetedBallLeft);}
            if (targetedBallRight.id != "#ballNull") {moveToPredictedBallPosition(paddleRight, targetedBallRight);}
        } else {
            repositionGameItem(paddleLeft);
            repositionGameItem(paddleRight);
        }
        // Ball Repositioning
        for (let each of ballPit) {
            repositionGameItem(each);
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
        $("#bouncedLeft").text(score.bounced);
        $("#bouncedRight").text(score.bounced);
    }

    function redrawAllGameItems() {
        redrawGameItem(paddleLeft);
        redrawGameItem(paddleRight);
        // redrawGameItem(ball);
        // for (let each of ballPit) {
        //     redrawGameItem(each);
        // }
        for (var i = 0; i < ballPit.length; i++) {
            redrawGameItem(ballPit[i]);
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
