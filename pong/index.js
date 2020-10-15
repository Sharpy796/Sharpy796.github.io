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
        BOTTOM: $("#board").width(),
        RIGHT: ($("#board").height() - $("#ball").width()),
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
    }

    // Game Item Objects

    var paddleLeft = createGameObject(50, 180, 0, 0, "#paddleLeft");    // player 1

    var paddleRight = createGameObject(630, 180, 0, 0, "#paddleRight"); // player 2

    var ball = createGameObject(340, 210, 5, 5, "#ball");               // ball

    var pause = createGameObject(10, 10, 0, 0, "#cheatIcon");           // cheat icon

    var score = {
        p1: 0,
        p2: 0,
        bounced: 0,
    }

    var pause = {
        speedX: 0,
        speedY: 0,
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


    // one-time setup
    var interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL);   // execute newFrame every 0.0166 seconds (60 Frames per second)
    $(document).on("keydown", handleKeyDown);   // listen for keydown events
    $(document).on("keyup", handleKeyUp);       // listen for keyup events
    $("#cheatIcon").on("click", activateCheatMode);       // listen for click events
    $("#cheatIcon").hide();


    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////// CORE LOGIC ///////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /* 
    On each "tick" of the timer, a new frame is dynamically drawn using JavaScript
    by calling this function and executing the code inside.
    */
    function newFrame() {
        pauseGame();
        if (isPaused) {
        } else {
            repositionAllGameItems();
        }

        redrawAllGameItems();
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
            paddleRight.speedY = 0;
            console.log("left released");
        } if (keycode === KEY.DOWN) {
            paddleRight.speedY = 0;
            console.log("down released");
        } if (keycode === KEY.RIGHT) {
            paddleRight.speedY = 0;
            console.log("right released");
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    function createGameObject(x, y, speedX, speedY, id) {
        var gameObject = {};
        gameObject.x = x;
        gameObject.y = y;
        gameObject.speedX = speedX;
        gameObject.speedY = speedY;
        gameObject.id = id;
        return gameObject;
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
            alert("Cheat Mode Activated!");
        } else {
            alert("Wrong Password.");
        }
    }

    function endGame() {
        // stop the interval timer
        clearInterval(interval);

        // turn off event handlers
        $(document).off();
    }
}
