/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()

function runProgram() {
    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////// SETUP /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // Constant Variables
    var FRAMES_PER_SECOND_INTERVAL = 1000 / 10;
    var BORDERS = {
        TOP: 0,
        LEFT: 0,
        BOTTOM: $("#board").height(),
        RIGHT: $("#board").width(),
    }
    var KEY = {
        /* general controls */
        P: 80,      // pause

        /* player controls */
        UP: 38,     // up
        LEFT: 37,   // left
        DOWN: 40,   // down
        RIGHT: 39,  // right
    }

    // Game Item Objects

    var head = createGameObject(1, 1, 0, 0, 0, '#head');
    var tail = createGameObject(2, 1, 0, 0, null, '#tail');

    var apple = createGameObject(5, 5, 0, 0, null, '#apple');

    var snakeArray = [];
    snakeArray[0] = head;
    snakeArray[snakeArray.length] = tail;


    // one-time setup
    var interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL);   // execute newFrame every 0.01 seconds (10 Frames per second)
    $(document).on('keydown', handleKeyDown);
    $(document).on('keyup', handleKeyUp);

    var isPaused = false;
    var pIsDown = false;
    var direction = null;

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////// CORE LOGIC ///////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /* 
    On each "tick" of the timer, a new frame is dynamically drawn using JavaScript
    by calling this function and executing the code inside.
    */
    function newFrame() {
        pauseGame();
        if (!isPaused) {
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
        if (keycode === KEY.P) {
            pIsDown = true;
            console.log("p pressed");       // pause
        }

        /* player controls */
        if (!isPaused) {
            if (keycode === KEY.UP && direction !== "down") {           // up
                head.speedX = 0;
                head.speedY = -1;
                direction = "up";
                console.log("up pressed");
            } if (keycode === KEY.LEFT && direction !== "right") {       // left
                head.speedX = -1;
                head.speedY = 0;
                direction = "left";
                console.log("left pressed");
            } if (keycode === KEY.DOWN && direction !== "up") {       // down
                head.speedX = 0;
                head.speedY = 1;
                direction = "down";
                console.log("down pressed");
            } if (keycode === KEY.RIGHT && direction !== "left") {      // right
                head.speedX = 1;
                head.speedY = 0;
                direction = "right";
                console.log("right pressed");
            }
        }
    }

    function handleKeyUp(event) {
        var keycode = event.which;
        console.log(keycode);

        /* general controls */
        if (keycode === KEY.P) {
            pIsDown = false;
            console.log("p released");
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    function createGameObject(column, row, speedX, speedY, score, id) {
        var gameObject = {};
        gameObject.column = column;
        gameObject.row = row;
        gameObject.x = 20 * column;
        gameObject.y = 20 * row;
        gameObject.speedX = speedX;
        gameObject.speedY = speedY;
        gameObject.score = score;
        gameObject.id = id;
        return gameObject;
    }

    function repositionGameItem(gameItem) {
        gameItem.row += gameItem.speedX;
        gameItem.column += gameItem.speedY;
        gameItem.x = gameItem.row * 20;
        gameItem.y = gameItem.column * 20;
    }

    function repositionTails() {
        for (var i = snakeArray.length - 1; i > 0; i--) {
            snakeArray[i].x = snakeArray[i - 1].x;
            snakeArray[i].y = snakeArray[i - 1].y;
        }
    }

    function repositionAllGameItems() {
        repositionTails();
        repositionGameItem(head);
    }

    function redrawGameItem(gameItem) {
        $(gameItem.id).css("left", gameItem.x);
        $(gameItem.id).css("top", gameItem.y);
    }

    function redrawAllGameItems() {
        redrawGameItem(head);
        redrawGameItem(tail);
        redrawGameItem(apple);
    }

    var num = 1;
    function pauseGame() {
        if (pIsDown) {
            if (num < 2) {
                if (isPaused) {
                    isPaused = false;
                    $(head.id).css("background-color", "green");
                    console.log("unpause");
                } else {
                    isPaused = true;
                    $(head.id).css("background-color", "fuchsia");
                    console.log("pause");
                }
            }
            num += 1;
        } else {
            num = 1;
        }
    }

    function endGame() {
        // stop the interval timer
        clearInterval(interval);

        // turn off event handlers
        $(document).off();
    }

}
