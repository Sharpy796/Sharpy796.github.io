/* global $ */
'use strict'
$(document).ready(function(){
	//////////////////////////////////////////////////////////////////
	//////////////////////////// SETUP ///////////////////////////////
    //////////////////////////////////////////////////////////////////

    var BOARD_WIDTH = $('#board').width();	// Number: the maximum X-Coordinate of the screen
    var BOARD_HEIGHT = $('#board').width(); // Number: the maximum Y-Coordinate of the screen

	// Every 50 milliseconds, call the update Function (see below)
	setInterval(update, 50);

	// Every time the box is clicked, call the handleBoxClick Function (see below)
	$('#box').on('click', handleBoxClick);

	var positionX = 0;
    var positionY = 100;
	var speedX = 1;
    var speedY = 1;
	var points = 0;

    var clicks = 0;

    var h = 0;
    var s = "100%";
    var l = "50%";

	//////////////////////////////////////////////////////////////////
	///////////////////////// CORE LOGIC /////////////////////////////
    //////////////////////////////////////////////////////////////////

    function update() {
        updatePosition();
        bounceBox();
        changeColor();
	}

	/* 
	This Function will be called each time the box is clicked. Each time it is called,
	it should increase the points total, increase the speed, and move the box to
	the left side of the screen.
	*/
	function handleBoxClick() {
        updateClicks();
        increasePoints();
        // resetPosition();
        randomPosition();
        if (clicks >= 3) {
            increaseSpeed();
            clicks = 0;
        }
        // changeColor();
	}

	//////////////////////////////////////////////////////////////////
	/////////////////////// HELPER FUNCTIONS /////////////////////////
    //////////////////////////////////////////////////////////////////

    function updatePosition() {
		positionX += speedX;
        positionY += speedY;
        $('#box').css("left", positionX);
        $('#box').css("top", positionY);
    }

    function bounceBox() {
		if (positionX > BOARD_WIDTH) {
			speedX = -speedX;
		}
		else if (positionX < 0) {
			speedX = -speedX;
        }
        if (positionY > BOARD_HEIGHT) {
            speedY = -speedY;
        }
        else if (positionY < 0) {
            speedY = -speedY;
        }
    }

    function changeColor() {
        $('#box').css("background-color", randomColor());
        return randomColor();
    }
    
    function changeTextToColor(color) {
        $('#box').text(color);
    }

    function updateClicks() {
        clicks++;
    }

    function increasePoints() {
		points += 1;
		$('#box').text(points);
    }

    function increaseSpeed() {
		if (speedX >= 0) {
			speedX += 3;
		} 
		else if (speedX < 0) {
			speedX -= 3;
        }
        if (speedY >= 0) {
            speedY += 3;
        }
        else if (speedY < 0) {
            speedY -= 3;
        }
    }

    function resetPosition() {
        positionX = 0;
        positionY = 100;
    }

    function randomPosition() {
        positionX = Math.floor(Math.random * BOARD_WIDTH);
        positionY = Math.floor(Math.random * BOARD_HEIGHT);
    }

    function randomColor() {
        // var h = Math.floor(Math.random() * 360);
        h++;
        if (h > 360) {
            h = 0;
        }
        var hslString = "hsl(" + h + "," + s + "," + l + ")";
        return hslString;
    }

	/* 
	This Function will be called 20 times/second. Each time it is called,
	it should move the Box to a new location. If the box drifts off the screen
	turn it around! 
	*/
	


}); // DO NOT DELETE THIS LINE OF CODE. ALL JAVASCRIPT ABOVE HERE