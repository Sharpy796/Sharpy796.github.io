(function (window) {
    'use strict';
    window.opspark = window.opspark || {};
    window.opspark.platform = window.opspark.platform || {};
    
    let platform = window.opspark.platform;
    
    /**
     * init: This function initializes the platforms for the level.
     * 
     * GOAL: Add as many platforms necessary to make your level challenging.
     * 
     * Use the createPlatform Function to create platforms for the level. 
     * 
     * createPlatform() takes these arguments:
     *      
     *      createPlatform(x, y, scaleX, scaleY);
     * 
     *      x: The x coordineate for the platform.
     *      y: The y coordineate for the platform.
     *      scaleX: OPTIONAL The scale factor on the x-axis, this value will 
     *              stretch the platform in width.
     *      scaleY: OPTIONAL The scale factor on the y-axis, this value will 
     *              stretch the platform in height.
     */ 
    function determineDistance(game, level) {
        return game.world.height - 32 - (107*level);
    }

    function init(game) {
        let createPlatform = platform.create;

        ////////////////////////////////////////////////////////////////////////
        // ALL YOUR CODE GOES BELOW HERE ///////////////////////////////////////
        
        /*
         * ground : here, we create a floor. Given the width of of the platform 
         * asset, giving it a scaleX and scaleY of 2 will stretch it across the 
         * bottom of the game.
         */
        var platformHeight = 3/8;

        createPlatform(0, determineDistance(game, 0), 3, 2);    // DO NOT DELETE

        // 1st Level: y = 550
        createPlatform(200, determineDistance(game, 1), 1.25, platformHeight);
        
        // 2nd Level: y = 455
        createPlatform(100, determineDistance(game, 2), 0.65, platformHeight);
        createPlatform(540, determineDistance(game, 2), 0.65, platformHeight);
        
        // 3rd Level: y = 350
        createPlatform(200, determineDistance(game, 3), 1.25, platformHeight);
        
        // 4th Level: y = 250
        createPlatform(100, determineDistance(game, 4), 0.65, platformHeight);
        createPlatform(540, determineDistance(game, 4), 0.65, platformHeight);
        
        // 5th Level: y = 150
        createPlatform(200, determineDistance(game, 5), 1.25, platformHeight);
        
        // ALL YOUR CODE GOES ABOVE HERE ///////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
    }
    platform.init = init;
})(window);