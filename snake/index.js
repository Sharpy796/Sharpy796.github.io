/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()

function runProgram() {
    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////// SETUP /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // Constant Variables
    setDifficulty();
    var FRAMES_PER_SECOND_INTERVAL = 1000 / frameRate;
    var BORDERS = {
        TOP: 0,
        LEFT: 0,
        BOTTOM: $("#board").height() - 20,
        RIGHT: $("#board").width() - 20,
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

    var frameRate = 10;
    var isPaused = false;
    var pIsDown = false;
    var upIsDown = false;
    var leftIsDown = false;
    var downIsDown = false;
    var rightIsDown = false;
    var keyWasDown = false;
    var pWasDown = false;
    var direction = null;

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////// CORE LOGIC ///////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /* 
    On each "tick" of the timer, a new frame is dynamically drawn using JavaScript
    by calling this function and executing the code inside.
    */
    function newFrame() {
        if (!isPaused) {
            repositionAllGameItems();
            handleCollisions();
            eatApple();
        }
        redrawAllGameItems();
        keyWasDown = false;
        pWasDown = false;
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
            pWasDown = true;
            console.log("p pressed");   // pause
        }
        pauseGame();

        /* player controls */
        if (!isPaused) {
            if (!keyWasDown) {
                if (keycode === KEY.UP && direction !== "down") {       // up
                    head.speedX = 0;
                    head.speedY = -1;
                    direction = "up";
                    upIsDown = true;
                    keyWasDown = true;
                    console.log("up pressed");
                } if (keycode === KEY.LEFT && direction !== "right") {  // left
                    head.speedX = -1;
                    head.speedY = 0;
                    direction = "left";
                    leftIsDown = true;
                    keyWasDown = true;
                    console.log("left pressed");
                } if (keycode === KEY.DOWN && direction !== "up") {     // down
                    head.speedX = 0;
                    head.speedY = 1;
                    direction = "down";
                    downIsDown = true;
                    keyWasDown = true;
                    console.log("down pressed");
                } if (keycode === KEY.RIGHT && direction !== "left") {  // right
                    head.speedX = 1;
                    head.speedY = 0;
                    direction = "right";
                    rightIsDown = true;
                    keyWasDown = true;
                    console.log("right pressed");
                }
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
        pauseGame();

        if (keycode === KEY.UP) {
            upIsDown = false;
            console.log("up released");
        } if (keycode === KEY.LEFT) {
            leftIsDown = false;
            console.log("left released");
        } if (keycode === KEY.DOWN) {
            downIsDown = false;
            console.log("down released");
        } if (keycode === KEY.RIGHT) {
            rightIsDown = false;
            console.log("right released");
        }
    }

    function handleCollisions() {
        if (head.x < BORDERS.LEFT) {
            $(head.id).css("background-color", "red");
            console.log("left passed");
        } if (head.y < BORDERS.TOP) {
            $(head.id).css("background-color", "red");
            console.log("top passed");
        } if (head.x > BORDERS.RIGHT) {
            $(head.id).css("background-color", "red");
            console.log("right passed");
        } if (head.y > BORDERS.BOTTOM) {
            $(head.id).css("background-color", "red");
            console.log("bottom passed");
        }
        if (head.x > BORDERS.LEFT &&
            head.y > BORDERS.TOP &&
            head.x < BORDERS.RIGHT &&
            head.y < BORDERS.BOTTOM) {
            $(head.id).css("background-color", "orange");
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    function setDifficulty() {
        var correctDifficulty;
        var answer;

        // ask for the desired difficulty
        while (!correctDifficulty) {
            answer = prompt("What difficulty?\nType either:\nEasy\nMedium\nHard");
            if (answer === "Slow" || answer === "Easy" || answer === "Medium" || answer === "Hard") {
                alert("You chose the " + answer + " difficulty. Good luck, and have fun!");
                correctDifficulty = true;
            } else {
                alert("That's not a difficulty!\n(Hint: Try making sure you use proper capitlization.)");
                correctDifficulty = false;
            }
        }

        // set the frame rate for respective difficulty
        if (answer === "Slow") {
            frameRate = 1;
        } else if (answer === "Easy") {
            frameRate = 5;
        } else if (answer === "Medium") {
            frameRate = 10;
        } else if (answer === "Hard") {
            frameRate = 20;
        } else {
            alert("Invalid difficulty: Please reload the page.");
        }
    }

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

    function eatApple() {
        if (apple.x === snakeArray[0].x && apple.y === snakeArray[0].y) {
            apple.row = Math.floor(Math.random() * 22);
            apple.column = Math.floor(Math.random() * 22);
            snakeArray.push[snakeArray[0]];
            head.score += 1;
        }
    }

    function moveGameItem(gameItem) {
        gameItem.row += gameItem.speedX;
        gameItem.column += gameItem.speedY;
    }

    function repositionGameItem(gameItem) {
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
        moveGameItem(head);
        repositionGameItem(apple);
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
