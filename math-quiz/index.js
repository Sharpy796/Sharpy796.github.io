/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()

function runProgram() {
    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////// SETUP /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    // Constant Variables
    var FRAMES_PER_SECOND_INTERVAL = 1000 / 60;

    // Game Item Objects

    // one-time setup
    // var interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL);   // execute newFrame every 0.0166 seconds (60 frames per second)

    var equasionFactor;
    var equasion;


    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////// CORE LOGIC ///////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    setDifficulty();
    function newFrame() {
        // constructEquasion();
        // showEquasion();
    }


    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////


    function setDifficulty() {
        var answer = prompt("What difficulty? Choose Easy, Medium, or Hard.");
        var correctDifficulty = false;
        while (!correctDifficulty) {
            if (answer === "Easy" || answer === "") {
                equasionFactor = 10;
                answer = "Easy";
                correctDifficulty = true;
            } else if (answer === "Medium") {
                equasionFactor = 100;
                correctDifficulty = true;
            } else if (answer === "Hard") {
                equasionFactor = 1000;
                correctDifficulty = true;
            } else {
                alert("That's not a difficulty!\nHint: Make sure you use correct capitalization.");
                correctDifficulty = false;
            }
        }
        alert("You have chosen the " + answer + " difficulty. Have Fun!");
    }

    function showEquasion() {
        // $("#problem").text(constructEquasion());
        $("#problem").text(equasion);
    }

    function constructEquasion() {
        var num1 = Math.floor(Math.rand() * equasionFactor);
        var num2 = Math.floor(Math.rand() * equasionFactor);
        var answer = num1 * num2;
        equasion = num1 + " + " + num2 + " = " + answer;
        // return equasion;
    }




}