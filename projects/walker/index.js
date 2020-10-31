/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()

function runProgram() {
    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////// SETUP /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // Constant Variables
    var FRAMES_PER_SECOND_INTERVAL = 1000 / 60;
    var BORDER = {
        "LEFT": 0,
        "TOP": 0,
        "RIGHT": $("#board").width() - 50,
        "BOTTOM": $("#board").height() - 50
    }
    var BORDER_P1 = {
        "LEFT": 290,
        "TOP": 100,
        "RIGHT": 340,
        "BOTTOM": 150
    }
    var BORDER_P2 = {
        "LEFT": 100,
        "TOP": 100,
        "RIGHT": 150,
        "BOTTOM": 150
    }
    var KEY = {
        "LEFT": 37,
        "UP": 38,
        "RIGHT": 39,
        "DOWN": 40,

        "A": 65,
        "W": 87,
        "D": 68,
        "S": 83
    }

    // Game Item Objects
    var playerOne = {
        "positionX": 290,
        "positionY": 100,
        "speed": {
            "up": 0,
            "left": 0,
            "down": 0,
            "right": 0,
        },
        "speedX": 0,
        "speedY": 0,
    }

    var playerTwo = {
        "positionX": 100,
        "positionY": 100,
        "speed": {
            "up": 0,
            "left": 0,
            "down": 0,
            "right": 0,
        },
        "speedX": 0,
        "speedY": 0,
    }

    var P1IsIt = false;
    var i = 1;

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
        handleSpeed();          // updates the players' speeds
        repositionGameItem();   // updates the players' positions
        updatePlayerBorders();  // updates the players' borders
        handleCollisions();     // checks to see if the players are out of bounds, and corrects it if they are
        whoIsIt();              // checks to see if the players are colliding with each other, and changes who is "it"
        redrawGameItem();       // draws all the new changes for the users to see
    }

    /* 
    Called in response to events.
    */
    function handleKeyDown(event) {
        var keycode = event.which;
        console.log(keycode);

        ///// PLAYER ONE KEYDOWNS \\\\\
        if (keycode === KEY.UP) {           // up
            console.log("up pressed");
            playerOne.speed.up = -5;
        } if (keycode === KEY.LEFT) {       // left
            console.log("left pressed");
            playerOne.speed.left = -5;
        } if (keycode === KEY.DOWN) {       // down
            console.log("down pressed");
            playerOne.speed.down = 5;
        } if (keycode === KEY.RIGHT) {      // right
            console.log("right pressed");
            playerOne.speed.right = 5;
        }

        ///// PLAYER TWO KEYDOWNS \\\\\
        if (keycode === KEY.W) {            // up
            console.log("w pressed");
            playerTwo.speed.up = -5;
        } if (keycode === KEY.A) {          // left
            console.log("a pressed");
            playerTwo.speed.left = -5;
        } if (keycode === KEY.S) {          // down
            console.log("s pressed");
            playerTwo.speed.down = 5;
        } if (keycode === KEY.D) {          // right
            console.log("d pressed");
            playerTwo.speed.right = 5;
        }
    }

    function handleKeyUp(event) {
        var keycode = event.which;
        console.log(keycode);

        ///// PLAYER ONE KEYUPS \\\\\
        if (keycode === KEY.UP) {           // up
            console.log("up released");
            playerOne.speed.up = 0;
        } if (keycode === KEY.LEFT) {       // left
            console.log("left released");
            playerOne.speed.left = 0;
        } if (keycode === KEY.DOWN) {       // down
            console.log("down released");
            playerOne.speed.down = 0;
        } if (keycode === KEY.RIGHT) {      // right
            console.log("right released");
            playerOne.speed.right = 0;
        }

        ///// PLAYER TWO KEYUPS \\\\\
        if (keycode === KEY.W) {            // up
            console.log("w released");
            playerTwo.speed.up = 0;
        } if (keycode === KEY.A) {          // left
            console.log("a released");
            playerTwo.speed.left = 0;
        } if (keycode === KEY.S) {          // down
            console.log("s released");
            playerTwo.speed.down = 0;
        } if (keycode === KEY.D) {          // right
            console.log("d released");
            playerTwo.speed.right = 0;
        }
    }

    function handleCollisions() {

        ///// PLAYER ONE BORDER COLLISION \\\\\
        if (playerOne.positionX < BORDER.LEFT) {
            playerOne.positionX -= -5;
            console.log("p1: left passed");
        } if (playerOne.positionY < BORDER.TOP) {
            playerOne.positionY -= -5;
            console.log("p1: top passed");
        } if (playerOne.positionX > BORDER.RIGHT) {
            playerOne.positionX -= 5;
            console.log("p1: right passed");
        } if (playerOne.positionY > BORDER.BOTTOM) {
            playerOne.positionY -= 5;
            console.log("p1: bottom passed");
        }

        ///// PLAYER TWO BORDER COLLISION \\\\\
        if (playerTwo.positionX < BORDER.LEFT) {
            playerTwo.positionX -= -5;
            console.log("p2: left passed");
        } if (playerTwo.positionY < BORDER.TOP) {
            playerTwo.positionY -= -5;
            console.log("p2: top passed");
        } if (playerTwo.positionX > BORDER.RIGHT) {
            playerTwo.positionX -= 5;
            console.log("p2: right passed");
        } if (playerTwo.positionY > BORDER.BOTTOM) {
            playerTwo.positionY -= 5;
            console.log("p2: bottom passed");
        }
    }

    function updatePlayerBorders() {
        BORDER_P1.LEFT = playerOne.positionX;
        BORDER_P1.TOP = playerOne.positionY;
        BORDER_P1.RIGHT = playerOne.positionX + 50;
        BORDER_P1.BOTTOM = playerOne.positionY + 50;

        BORDER_P2.LEFT = playerTwo.positionX;
        BORDER_P2.TOP = playerTwo.positionY;
        BORDER_P2.RIGHT = playerTwo.positionX + 50;
        BORDER_P2.BOTTOM = playerTwo.positionY + 50;
    }

    function P1IsInCollision() {
        if ((BORDER_P1.BOTTOM > BORDER_P2.TOP &&
            BORDER_P1.LEFT < BORDER_P2.RIGHT) &&
            (BORDER_P1.TOP < BORDER_P2.BOTTOM &&
                BORDER_P1.RIGHT > BORDER_P2.LEFT)) {
            return true;
        } else {
            return false;
        }
    }

    function whoIsIt() {
        if (P1IsInCollision()) {
            if (i < 2) {
                if (!P1IsIt) {
                    P1IsIt = true;
                    console.log("p1 is it");
                    handleColorChanges();
                } else if (P1IsIt) {
                    P1IsIt = false;
                    console.log("p2 is it");
                    handleColorChanges();
                }
            }
            i += 1;
        } else {
            handleColorChanges();
            i = 1;
        }
    }

    function handleColorChanges() {
        if (!P1IsIt) {
            $("#playerOne").css("background-color", "lime");
            $("#playerTwo").css("background-color", "maroon");
        } if (P1IsIt) {
            $("#playerTwo").css("background-color", "lime");
            $("#playerOne").css("background-color", "teal");
        }

    }

    function handleSpeed() {
        // p1 speed
        playerOne.speedX = playerOne.speed.left + playerOne.speed.right;
        playerOne.speedY = playerOne.speed.up + playerOne.speed.down;

        // p2 speed
        playerTwo.speedX = playerTwo.speed.left + playerTwo.speed.right;
        playerTwo.speedY = playerTwo.speed.up + playerTwo.speed.down;
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

    function repositionGameItem() {
        playerOne.positionX += playerOne.speedX; // update the position of the box along the x-axis
        playerOne.positionY += playerOne.speedY; // update the position of the box along the y-axis
        playerTwo.positionX += playerTwo.speedX; // update the position of the box along the x-axis
        playerTwo.positionY += playerTwo.speedY; // update the position of the box along the y-axis
    }

    function redrawGameItem() {
        $("#playerOne").css("left", playerOne.positionX);    // draw the box in the new location, positionX pixels away from the "left"
        $("#playerOne").css("top", playerOne.positionY);     // draw the box in the new location, positionY pixels away from the "top"
        $("#playerTwo").css("left", playerTwo.positionX);    // draw the box in the new location, positionX pixels away from the "left"
        $("#playerTwo").css("top", playerTwo.positionY);     // draw the box in the new location, positionY pixels away from the "top"
    }

}
