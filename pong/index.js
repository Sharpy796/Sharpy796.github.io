/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()

function runProgram() {
    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////// SETUP /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // Constant Variables
    var FRAMES_PER_SECOND_INTERVAL = 1000 / 60;
    var KEY = {
        /* general controls */
        ENTER: 16,
        P: 80,
        R: 82,

        /* P1 controls */
        W: 87,
        A: 65,
        S: 83,
        D: 68,

        /* P2 controls */
        UP: 38,
        LEFT: 37,
        DOWN: 40,
        RIGHT: 39,
    }

    // Game Item Objects

    var paddleLeft = createGameObject(50, 180, 0, 0, "#paddleLeft");

    var paddleRight = createGameObject(630, 180, 0, 0, "#paddleRight");

    var ball = createGameObject(340, 210, 5, 5, "#ball");

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


    // one-time setup
    var interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL);   // execute newFrame every 0.0166 seconds (60 Frames per second)
    $(document).on("keydown", handleKeyDown);   
    $(document).on("keyup", handleKeyUp);

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////// CORE LOGIC ///////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /* 
    On each "tick" of the timer, a new frame is dynamically drawn using JavaScript
    by calling this function and executing the code inside.
    */
    function newFrame() {
        repositionGameItem(paddleLeft);
        repositionGameItem(paddleRight);
        // moveGameItem(ball);

        redrawGameItem("#paddleLeft", paddleLeft);
        redrawGameItem("#paddleRight", paddleRight);
        redrawGameItem("#ball", ball);
    }

    /* 
    Called in response to events.
    */
    function handleKeyDown(event) {
        var keycode = event.which;
        console.log(keycode);

        /* general controls */
        if (keycode === KEY.ENTER) {
            console.log("enter pressed");
        } if (keycode === KEY.P) {
            console.log("p pressed");
        } if (keycode === KEY.R) {
            console.log("r pressed");
        }

        /* P1 controls */
        if (keycode === KEY.W) {
            paddleLeft.speedY = -5;
            console.log("w pressed");
        } if (keycode === KEY.A) {
            console.log("a pressed");
        } if (keycode === KEY.S) {
            paddleLeft.speedY = 5;
            console.log("s pressed");
        } if (keycode === KEY.D) {
            console.log("d pressed");
        }

        /* P2 controls */
        if (keycode === KEY.UP) {
            paddleRight.speedY = -5;
            console.log("up pressed");
        } if (keycode === KEY.LEFT) {
            console.log("left pressed");
        } if (keycode === KEY.DOWN) {
            paddleRight.speedY = 5;
            console.log("down pressed");
        } if (keycode === KEY.RIGHT) {
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

    function endGame() {
        // stop the interval timer
        clearInterval(interval);

        // turn off event handlers
        $(document).off();
    }

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
}
