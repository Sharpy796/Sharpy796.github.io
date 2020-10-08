/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()
  
function runProgram(){
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
      UP: 38,
      LEFT: 37,
      DOWN: 40,
      RIGHT: 39,

      /* P2 controls */
      W: 87,
      A: 65,
      S: 83,
      D: 68,
  }
  
  // Game Item Objects
  var paddleLeft = {
      x: 0,
      y: 0,
      speedX: 0,
      speedY: 0,
      id: "#paddleLeft"
  }

  var paddleRight = {
      x: 0,
      y: 0,
      speedX: 0,
      speedY: 0,
      id: "#paddleRight"
  }

  var ball = {
      x: 0,
      y: 0,
      speedX: 0,
      speedY: 0,
      id: "#ball"
  }


  // one-time setup
  var interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL);   // execute newFrame every 0.0166 seconds (60 Frames per second)
  $(document).on('eventType', handleEvent);                           // change 'eventType' to the type of event you want to handle

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
  function handleEvent(event) {

  }

  funtion handleKeyDown() {
      
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
