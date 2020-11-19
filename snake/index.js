/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()

function runProgram() {
    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////// SETUP /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // Constant Variables
    var passWall = false;
    var noCollision = false;
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
    var falsePositionCount = 0;
    var borderSide = "none";
    var gameEnd = false;

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
            if (inCollision(apple, head)) {
                eatApple();
            }
            if (!gameEnd) {
                redrawAllGameItems();
            }
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


    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    function setDifficulty() {
        var correctDifficulty;
        var answer;
        var alreadyCollision;
        var alreadyPass;

        // ask for the desired difficulty
        while (!correctDifficulty) {
            // ask for the difficulty: Easy, Medium, Hard, or nothing
            answer = prompt("What difficulty?\nType either:\nEasy\nMedium\nHard\n\nClicking Cancel sets the difficulty to Medium.");
            // if the difficulty is Slow, Easy, Medium, Hard, or nothing
            if (answer === "Slow" ||
                answer === "Easy" ||
                answer === "Medium" ||
                answer === "Hard" ||
                answer === null ||
                answer === "") {
                // if the answer if nothing, set the difficulty to Medium
                if (answer === null || answer === "") {
                    answer = "Medium";
                }
                // tell the user what difficulty they chose, along with the controls
                alert("You chose the " + answer + " difficulty.\n\nCONTROLS\nUse the arrow keys for movement\nPress space to pause\n\nGood luck, and have fun!");
                correctDifficulty = true;
            }
            // if the answer is noCollision
            else if (answer === "noCollision") {
                // if you had already chose noCollision
                if (answer === "noCollision" && alreadyCollision) {
                    alert("You already chose that option!");
                } else {
                    // tell the user they activated noCollision
                    alert("noCollision mode activated");
                    noCollision = true;
                    alreadyCollision = true;
                    passWall = false;
                    alreadyPass = false;
                }
                correctDifficulty = false;
            }
            // if the answer is passWall
            else if (answer === "passWall") {
                // if they already chose that option
                if (answer === "passWall" && alreadyPass) {
                    alert("You already chose that option!");
                } else {
                    // tell the user they activated passWall
                    alert("passWall mode activated");
                    passWall = true;
                    alreadyPass = true;
                    noCollision = false;
                    alreadyCollision = false;
                }
                correctDifficulty = false;
            }
            // if the difficulty is not a valid one
            else {
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


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    //////////// Repositioning \\\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function repositionAllGameItems() {
        moveGameItem(head);
        teleportHead();
        repositionTails();
        repositionGameItem(apple);
        repositionGameItem(head);
    }

    function moveGameItem(gameItem) {
        gameItem.column += gameItem.speedX;
        gameItem.row += gameItem.speedY;
    }

    function teleportHead() {
        if (passWall || noCollision) {
            if (head.column < BORDERS.LEFT / 20) {
                head.column = 21;
            } else if (head.row < BORDERS.TOP / 20) {
                head.row = 21;
            } else if (head.column > BORDERS.RIGHT / 20) {
                head.column = 0;
            } else if (head.row > BORDERS.BOTTOM / 20) {
                head.row = 0;
            }
        }
    }

    function repositionTails() {
        for (var i = snakeArray.length - 1; i > 0; i--) {
            snakeArray[i].x = snakeArray[i - 1].x;
            snakeArray[i].y = snakeArray[i - 1].y;
            snakeArray[i].column = snakeArray[i].x / 20;
            snakeArray[i].row = snakeArray[i].y / 20;
        }
    }

    function repositionGameItem(gameItem) {
        gameItem.x = gameItem.column * 20;
        gameItem.y = gameItem.row * 20;
    }


    ///////////////////\\\\\\\\\\\\\\\\\\\
    ///////////// Collisions \\\\\\\\\\\\\
    ///////////////////\\\\\\\\\\\\\\\\\\\

    function handleCollisions() {
        // if the head is outside the borders, end the game
        if (head.x < BORDERS.LEFT) {
            borderSide = "left";
            collide(borderSide);
        } else if (head.y < BORDERS.TOP) {
            borderSide = "top";
            collide(borderSide);
        } else if (head.x > BORDERS.RIGHT) {
            borderSide = "right";
            collide(borderSide);
        } else if (head.y > BORDERS.BOTTOM) {
            borderSide = "bottom";
            collide(borderSide);
        }
        // if the head is inside the borders, revert to the normal colors
        if (head.x >= BORDERS.LEFT &&
            head.y >= BORDERS.TOP &&
            head.x <= BORDERS.RIGHT &&
            head.y <= BORDERS.BOTTOM) {
            stopCollide();
            borderSide = "none";
        }
        // if the head hits the tail, end the game
        for (var i = 1; i < snakeArray.length; i++) {
            if (inCollision(head, snakeArray[i])) {
                collide("tail");
            }
        }
    }

    function collide(side) {
        // say that we passed a border
        console.log(side + " passed");

        // change the snake's color
        $(head.id).css("background-color", "red");
        $(".tails").css("background-color", "lightsalmon");

        if (noCollision) {
            // pass through everything
        } else if (passWall && side !== "tail") {
            // pass through walls only
        } else {
            // change the message according to the amount of points
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

            // send the message
            alert("You lost!\nPoints earned: " + points + "\n" + congrats);
            alert("Refresh the page to play again.");
            endGame();
        }
    }

    function stopCollide() {
        $(head.id).css("background-color", "orange");
        $(".tails").css("background-color", "palegoldenrod");
    }

    function inCollision(obj1, obj2) {
        // if obj1 is in the same spot as obj2, return true
        if (obj1.x === obj2.x && obj1.y === obj2.y) {
            return true;
        } else {
            return false;
        }
    }


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    /////////// Apples & Bodies \\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function eatApple() {
        // find a new valid random spot for the apple
        var randCol = Math.floor(Math.random() * 22);   // x
        var randRow = Math.floor(Math.random() * 22);   // y
        var validPosition = true;
        // check to see if the new spot is on the snake
        for (var i = 0; i < snakeArray.length; i++) {
            if (randCol === snakeArray[i].column && randRow === snakeArray[i].row) {
                validPosition = false;
                // alert("invalid apple position\nappleX: " + randCol + "\nappleY: " + randRow + "\nx: " + snakeArray[i].column + "\ny: " + snakeArray[i].row);
                falsePositionCount++;
                // if it has tried to find a new valid position 25 times, stop the game
                if (falsePositionCount >= 100) {
                    alert("Error: Couldn't find a valid apple position\nReload the page to play again");
                    validPosition = true;
                    collide();
                    endGame();
                }
            }
        }
        // if it is on the snake, find a new position
        if (!validPosition) {
            eatApple();
        } else {
            falsePositionCount = 0;
            //reposition the apple
            apple.column = randCol; // x
            apple.row = randRow;    // y
            // create a new body box
            createNewBody();
            // increase the score
            head.score += 1;
            console.log("apple eaten");
            console.log("score: " + head.score);
            // set validPosition to true
            validPosition = true;
        }
    }

    function createNewBody() {
        // create a new id for the body
        var bodyId = 'midBody' + (snakeArray.length - 1);
        // create a new div for the body
        var $newBody = $("<div>")
            .appendTo('#board')
            .addClass('gameItem')
            .addClass('tails')
            .attr("id", bodyId)
            .css("left", snakeArray[0].x)
            .css("top", snakeArray[0].y)
            .css("background-color", "orange");
        // store the new div in a variable
        $newBody = createGameObject(
            snakeArray[0].column,
            snakeArray[0].row,
            null, null, null,
            '#' + bodyId);
        // push the new body into snakeArray
        snakeArray.push($newBody);
    }


    ///////////////////|\\\\\\\\\\\\\\\\\\\
    ////////////// Redrawing \\\\\\\\\\\\\\
    ///////////////////|\\\\\\\\\\\\\\\\\\\

    function redrawAllGameItems() {
        for (var i = 0; i < snakeArray.length; i++) {
            redrawGameItem(snakeArray[i]);
        }
        redrawGameItem(apple);
    }

    function redrawGameItem(gameItem) {
        $(gameItem.id).css("left", gameItem.x);
        $(gameItem.id).css("top", gameItem.y);
    }

    /*
    When space is pressed, it toggles between
    paused and unpaused only once
    */
    var num = 0;
    function pauseGame() {
        // while space is pressed
        if (spaceIsDown) {
            // only toggle between pause and unpause once
            if (!num) {
                // if the game is paused, unpause it
                if (isPaused) {
                    isPaused = false;
                    $(".tails").css("background-color", "palegoldenrod");
                    $(head.id).css("background-color", "orange");
                    console.log("unpause");
                } else {
                    // if the game is unpaused, pause it
                    isPaused = true;
                    $(".tails").css("background-color", "lightpink");
                    $(head.id).css("background-color", "fuchsia");
                    console.log("pause");
                }
            }
            num = 1;
        } else {
            num = 0;
        }
    }

    function endGame() {
        // stop the interval timer
        clearInterval(interval);

        // turn off event handlers
        $(document).off();

        // set gameEnd to true
        gameEnd = true;
    }

}
