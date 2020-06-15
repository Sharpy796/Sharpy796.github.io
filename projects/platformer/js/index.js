/* global Phaser */
$(document).ready(function () {
    'use strict';
    window.opspark = window.opspark || {};
    let 
        opspark = window.opspark,
        game = opspark.createGame(create, update),
        lives = 3;
        
    const textOpts = { fontSize: '32px', fill: '#000' };
    function create() {
        game.opspark.init();
        
        opspark.platform.factory(game);
        opspark.platform.init(game);
        
        opspark.collectable.factory(game);
        opspark.collectable.init(game);
        
        opspark.cannon.factory(game);
        opspark.cannon.init(game);
        
        opspark.player.init(game);
        
        // game.score = game.add.text(16, 16, 'Score: 0', textOpts);
        // game.lives = game.add.text(16, 70, 'Lives: ' + lives, textOpts);
        // game.score = game.add.text(700, 16, 'Score: 0', textOpts);
        // game.lives = game.add.text(700, 70, 'Lives: ' + lives, textOpts);
        game.score = game.add.text(500, 16, 'Score: 0', textOpts);
        game.lives = game.add.text(500, 70, 'Lives: ' + lives, textOpts);
    }


    function update() {
        const asset = game.player.asset,
              playerManager = game.playerManager,
              collectable = game.collectable;
        
        game.physics.arcade.collide(asset, game.platforms);
        game.physics.arcade.collide(asset, game.projectile);
        game.physics.arcade.collide(collectable, game.platforms);
        game.physics.arcade.overlap(asset, collectable, collectDb, null, this);
        game.physics.arcade.overlap(asset, game.projectile, onProjectileOverlap, null, this);
        
        playerManager.update();
    }

    function onProjectileOverlap() {
        console.log('Halle hit!');
        game.player.die();
        decrementLives();
        if(lives > 0){
            opspark.player.init(game);
        } 
    }
    var gameOver = false;
    function decrementLives(){
        if(lives !== 0 && !youWon){
            lives--;
            game.lives.text = 'Lives: ' + lives;            
        } else if (!youWon) {
            setTimeout(() => game.lives.text = "Refresh Your Browser to", 500);
            if (!gameOver) {
                setTimeout(() => game.add.text(705, 16, "Game Over", textOpts), 500);
                setTimeout(() => game.add.text(710, 124, "Play Again", textOpts), 500);
            }
            gameOver = true;
        } 
    }
    var youWon = false;
    function collectDb(player, collectable) {
        game.score.text = 'Score: ' + (parseInt(/\s+(\S*)$/.exec(game.score.text)[1], 10) + collectable.type.points);
        collectable.kill();
        if(collectable.type.points < 50 ) {
        } else {
            setTimeout(() => game.lives.text = "Refresh Your Browser to");
            if (!youWon) {
                setTimeout(() => game.add.text(710, 16, "You Win!!", textOpts));
                setTimeout(() => game.add.text(710, 124, "Play Again", textOpts));
            }
            youWon = true;
        }
    }
    
});
