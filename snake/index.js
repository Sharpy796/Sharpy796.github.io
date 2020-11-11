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
        BOTTOM: $("#board").height(),
        RIGHT: $("#board").width() - 20,
    }
    var KEY = {
        /* general controls */
        SPACE: 32,  // pause

        /* player controls */
        UP: 38,     // up
        LEFT: 37,   // left
        DOWN: 40,   // down
        RIGHT: 39,  // right
    }

    // Game Item Objects

    var head = createGameObject(1, 1, 0, 0, 0, '#head');

    var apple = createGameObject(5, 5, null, null, null, '#apple');

    var snakeArray = [];
    snakeArray.push(head);


    // one-time setup
    var interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL);   // execute newFrame every 0.01 seconds (10 Frames per second)
    $(document).on('keydown', handleKeyDown);
    $(document).on('keyup', handleKeyUp);

    var frameRate = 10;
    var isPaused = false;
    var spaceIsDown = false;
    var keyWasDown = false;
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
            redrawAllGameItems();
            repositionAllGameItems();
            handleCollisions();
            eatApple();
        }
        keyWasDown = false;
    }

    /* 
    Called in response to events.
    */
    function handleKeyDown(event) {
        var keycode = event.which;
        console.log(keycode);

        /* general controls */
        if (keycode === KEY.SPACE) {
            spaceIsDown = true;
            console.log("space pressed");   // pause
        }
        pauseGame();

        /* player controls */
        if (!isPaused) {
            if (!keyWasDown) {
                if (keycode === KEY.UP && direction !== "down") {       // up
                    head.speedX = 0;
                    head.speedY = -1;
                    direction = "up";
                    keyWasDown = true;
                    console.log("up pressed");
                } if (keycode === KEY.LEFT && direction !== "right") {  // left
                    head.speedX = -1;
                    head.speedY = 0;
                    direction = "left";
                    keyWasDown = true;
                    console.log("left pressed");
                } if (keycode === KEY.DOWN && direction !== "up") {     // down
                    head.speedX = 0;
                    head.speedY = 1;
                    direction = "down";
                    keyWasDown = true;
                    console.log("down pressed");
                } if (keycode === KEY.RIGHT && direction !== "left") {  // right
                    head.speedX = 1;
                    head.speedY = 0;
                    direction = "right";
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
        if (keycode === KEY.SPACE) {
            spaceIsDown = false;
            console.log("space released");
        }
        pauseGame();
    }

    function handleCollisions() {
        if (head.x < BORDERS.LEFT) {
            collide();
            console.log("left passed");
        } if (head.y < BORDERS.TOP) {
            collide();
            console.log("top passed");
        } if (head.x >= BORDERS.RIGHT) {
            collide();
            console.log("right passed");
        } if (head.y >= BORDERS.BOTTOM) {
            collide();
            console.log("bottom passed");
        }
        if (head.x >= BORDERS.LEFT &&
            head.y >= BORDERS.TOP &&
            head.x < BORDERS.RIGHT &&
            head.y < BORDERS.BOTTOM) {
            stopCollide();
        }
        for (var i = 1; i < snakeArray.length; i++) {
            if (inCollision(head, snakeArray[i])) {
                collide();
            }
        }

    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    function collide() {
        $(head.id).css("background-color", "red");
        $(".tails").css("background-color", "lightsalmon");
        var points = head.score;
        var congrats;
        if (points >= 100) {
            congrats = "Incredible!!";
        } else if (points >= 50) {
            congrats = "Amazing!";
        } else if (points >= 25) {
            congrats = "Good Job!";
        } else if (points >= 10) {
            congrats = "Nice!";
        } else {
            congrats = "Better luck next time."
        }
        alert("You lost!\nPoints earned: " + points + "\n" + congrats);
        alert("Refresh the page to play again.");
        endGame();
    }

    function stopCollide() {
        $(head.id).css("background-color", "orange");
        $(".tails").css("background-color", "palegoldenrod");
    }

    function inCollision(obj1, obj2) {
        if (obj1.x === obj2.x && obj1.y === obj2.y) {
            return true;
        } else {
            return false;
        }
    }

    function setDifficulty() {
        var correctDifficulty;
        var answer;

        // ask for the desired difficulty
        while (!correctDifficulty) {
            answer = prompt("What difficulty?\nType either:\nEasy\nMedium\nHard\n\nClicking Cancel sets the difficulty to Medium.");
            if (answer === "Slow" || answer === "Easy" || answer === "Medium" || answer === "Hard" || answer === null || answer === "") {
                if (answer === null || answer === "") {
                    answer = "Medium";
                }
                alert("You chose the " + answer + " difficulty.\nUse the arrow keys for movement\nPress space to pause\nGood luck, and have fun!");
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

    function createNewBody() {
        var bodyId = 'midBody' + (snakeArray.length - 1);
        var $newBody = $("<div>").appendTo('#board').addClass('gameItem').addClass('tails').attr("id", bodyId);
        $newBody = createGameObject(snakeArray[0].column, snakeArray[0].row, null, null, null, '#' + bodyId);
        snakeArray.push($newBody);
    }

    function eatApple() {
        // if the snake head is in the same spot as the apple
        if (inCollision(apple, head)) {
            // find a new valid random spot for the apple
            var randRow = Math.floor(Math.random() * 22);
            var randCol = Math.floor(Math.random() * 22);
            var validPosition = false;
            // loop until it finds a valid position
            while (!validPosition) {
                for (var i = 0; i < snakeArray.length; i++) {
                    if (randRow === snakeArray[i].row && randCol === snakeArray[i].column) {
                        validPosition = false;
                        randRow = Math.floor(Math.random() * 22);
                        randCol = Math.floor(Math.random() * 22);
                        alert("invalid position");
                    } else {
                        validPosition = true;
                    }
                }
            }
            //reposition the apple
            apple.row = randRow;
            apple.column = randCol;
            // create a new body box
            createNewBody();
            // increase the score
            head.score += 1;
            console.log("apple eaten");
            console.log("score: " + head.score);
        }
    }

    function moveGameItem(gameItem) {
        gameItem.column += gameItem.speedX;
        gameItem.row += gameItem.speedY;
    }

    function repositionGameItem(gameItem) {
        gameItem.x = gameItem.column * 20;
        gameItem.y = gameItem.row * 20;
    }

    function repositionTails() {
        for (var i = snakeArray.length - 1; i > 0; i--) {
            snakeArray[i].x = snakeArray[i - 1].x;
            snakeArray[i].y = snakeArray[i - 1].y;
        }
    }

    function repositionAllGameItems() {
        moveGameItem(head);
        repositionTails();
        repositionGameItem(apple);
        repositionGameItem(head);
    }

    function redrawGameItem(gameItem) {
        $(gameItem.id).css("left", gameItem.x);
        $(gameItem.id).css("top", gameItem.y);
    }

    function redrawAllGameItems() {
        for (var i = 0; i < snakeArray.length; i++) {
            redrawGameItem(snakeArray[i]);
        }
        redrawGameItem(apple);
    }

    var num = 1;
    function pauseGame() {
        if (spaceIsDown) {
            if (num < 2) {
                if (isPaused) {
                    isPaused = false;
                    $(".tails").css("background-color", "palegoldenrod");
                    $(head.id).css("background-color", "orange");
                    console.log("unpause");
                } else {
                    isPaused = true;
                    $(".tails").css("background-color", "lightpink");
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
