(function (window) {
    'use strict';
    window.opspark = window.opspark || {};
    window.opspark.collectable = window.opspark.collectable || {};
    let collectable = window.opspark.collectable;
    
    let type = {
        max: {assetKey: 'max', points: 10},
        steve: {assetKey: 'steve', points: 20},
        grace: {assetKey: 'grace', points: 30},
        kennedi: {assetKey: 'kennedi', points: 40},
        db: {assetKey: 'db', points: 50}
    };
    
    /**
     * init: Initialize all collectables.
     * 
     * GOAL: Add as many collectables as necessary to make your level challenging.
     * 
     * Use the createCollectable() Function to create collectables for the level.
     * See the type Object, above, for the types of collectables and their point values.
     * 
     * createCollectable() takes these arguments:
     *      
     *      createCollectable(type, x, y, gravity, bounce);
     * 
     *      type: The type of the collectable, use the type Object above.
     *      x: The x coordineate for the collectable.
     *      y: The y coordineate for the collectable.
     *      gravity: OPTIONAL The gravitational pull on the collectable.
     *      bounce: OPTIONAL A factor effecting how much the collectable will bounce off platforms, etc.
     */ 
    function determineDistance(game, level) {
        return game.world.height - 110 - (105*level);
    }

    function init(game) {
        let createCollectable = collectable.create;

        ////////////////////////////////////////////////////////////////////////
        // ALL YOUR CODE GOES BELOW HERE ///////////////////////////////////////
        

        // 0th Level: x = 680 ; y = 575
        createCollectable(type.max, 750, determineDistance(game, 0));
        
        // 1st Level: y = 375
        createCollectable(type.steve, 250, determineDistance(game, 1));
        // createCollectable(type.db, 425, 475);
        
        // 2nd Level:
        createCollectable(type.kennedi, 600, determineDistance(game, 2));
        
        // 3rd Level:
        createCollectable(type.grace, 425, determineDistance(game, 3));

        
        // 4th Level:
        
        
        // 5th Level:
        createCollectable(type.db, 435, determineDistance(game, 5));
        
        // ALL YOUR CODE GOES ABOVE HERE ///////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
    };
    collectable.init = init;
})(window);