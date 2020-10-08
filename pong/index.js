/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()

function runProgram() {
    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////// SETUP /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // Constant Variables
    const FRAMES_PER_SECOND_INTERVAL = 1000 / 60;
    var KEY = {
        /* general controls */
        ENTER: 16,
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
    var paddleLeft = {
        x: 0,
        y: 0,
        speedX: 0,
        speedY: 0,
        id: "#paddleLeft",
    }

    var paddleRight = {
        x: 0,
        y: 0,
        speedX: 0,
        speedY: 0,
        id: "#paddleRight",
    }

    var ball = {
        x: 0,
        y: 0,
        speedX: 0,
        speedY: 0,
        id: "#ball",
    }

    var score = {
        p1: 0,
        p2: 0,
        bounced: 0,
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


    }

    /* 
    Called in response to events.
    */
    function handleKeyDown() {
        var keycode = event.which;
        console.log(keycode);

        /* general controls */
        if (keycode === KEY.ENTER) {
            console.log("enter pressed");
        } if (keycode === KEY.R) {
            console.log("r pressed");
        }

        /* P1 controls */
        if (keycode === KEY.W) {
            console.log("w pressed");
        } if (keycode === KEY.A) {
            console.log("a pressed");
        } if (keycode === KEY.UP) {
            console.log("s pressed");
        } if (keycode === KEY.UP) {
            console.log("d pressed");
        }

        /* P2 controls */
        if (keycode === KEY.UP) {
            console.log("up pressed");
        } if (keycode === KEY.LEFT) {
            console.log("left pressed");
        } if (keycode === KEY.DOWN) {
            console.log("down pressed");
        } if (keycode === KEY.RIGHT) {
            console.log("right pressed");
        }
    }

    function handleKeyUp() {
        var keycode = event.which;
        console.log(keycode);

        /* general controls */
        if (keycode === KEY.ENTER) {
            console.log("enter released");
        }
        if (keycode === KEY.R) {
            console.log("r released");
        }

        /* P1 controls */
        if (keycode === KEY.W) {
            console.log("w released");
        }
        if (keycode === KEY.A) {
            console.log("a released");
        }
        if (keycode === KEY.UP) {
            console.log("s released");
        }
        if (keycode === KEY.UP) {
            console.log("d released");
        }

        /* P2 controls */
        if (keycode === KEY.UP) {
            console.log("up released");
        }
        if (keycode === KEY.LEFT) {
            console.log("left released");
        }
        if (keycode === KEY.DOWN) {
            console.log("down released");
        }
        if (keycode === KEY.RIGHT) {
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

}
