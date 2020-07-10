var level01 = function (window) {

    window.opspark = window.opspark || {};

    var draw = window.opspark.draw;
    var createjs = window.createjs;

    window.opspark.runLevelInGame = function(game) {
        // some useful constants 
        var groundY = game.groundY;

        // this data will allow us to define all of the
        // behavior of our game
        var levelData = {
            "name": "Robot Romp",
            "number": 1, 
            "speed": -3,
            "gameItems": [  
                { "type": "spikeBall" , "x": 400 , "y": groundY - 25  },
                { "type": "goomba"    , "x": 450 , "y": groundY - 23  },
                { "type": "spikeBall" , "x": 650 , "y": groundY - 120 },
                { "type": "spikeBall" , "x": 900 , "y": groundY - 25  },
                { "type": "spikeBall" , "x": 950 , "y": groundY       },
                { "type": "goomba"    , "x": 1000, "y": groundY - 23  },
                { "type": "mushroom"  , "x": 1125, "y": groundY - 140 },
                { "type": "bossGoomba", "x": 1250, "y": groundY - 48  },
                { "type": "spikeBall" , "x": 1500, "y": groundY       },
                { "type": "spikeBall" , "x": 1700, "y": groundY       },
                { "type": "spikeBall" , "x": 2000, "y": groundY - 120 },
                { "type": "star"      , "x": 2500, "y": groundY - 150 },
            ]
        };
        window.levelData = levelData;
        // set this to true or false depending on if you want to see hitzones
        game.setDebugMode(true);

        // BEGIN EDITING YOUR CODE HERE
        function createSpikeBall(x, y) {
            var hitZoneSize = 25;
            var damageFromObstacle = 10;
            var spikeBallHitZone = game.createObstacle(hitZoneSize, damageFromObstacle);
            spikeBallHitZone.x = x;
            spikeBallHitZone.y = y;
            spikeBallHitZone.rotationalVelocity = -10;
            game.addGameItem(spikeBallHitZone);
            var obstacleImage = draw.bitmap('img/SpikeBall.png');
            spikeBallHitZone.addChild(obstacleImage);
            obstacleImage.x = -25;
            obstacleImage.y = -25;
        }
        
        function createMushroom(x, y) {
            var mushroom = game.createGameItem('enemy',25);
            var mushroomImage = draw.bitmap('img/SuperMush.png');
            mushroomImage.x = -25;
            mushroomImage.y = -25;
            mushroom.addChild(mushroomImage);
            mushroom.x = x;
            mushroom.y = y;
            game.addGameItem(mushroom);
            mushroom.velocityX = -2;
            mushroom.onPlayerCollision = function() {
                console.log('Halle has collected a Mushroom!');
                game.changeIntegrity(20);
                game.increaseScore(200)
                mushroom.fadeOut();
            };
            mushroom.onProjectileCollision = function() {}
        }
        
        function createGoomba(x, y) {
            var goomba = game.createGameItem('enemy',25);
            var goombaImage = draw.bitmap('img/Goomba.gif');
            goombaImage.x = -25;
            goombaImage.y = -25;
            goomba.addChild(goombaImage);
            goomba.x = x;
            goomba.y = y;
            game.addGameItem(goomba);
            goomba.velocityX = -1;
            goomba.rotationalVelocity = 10;
            goomba.onPlayerCollision = function() {
                console.log('The Goomba has hit Halle!');
                game.changeIntegrity(-40);
            };
            goomba.onProjectileCollision = function() {
                console.log('Halle has hit the Goomba!');
                game.increaseScore(500);
                goomba.flyTo(1000, 0);
            }
        }
        
        var hits = 0;
        function createBossGoomba(x, y) {
            var bossGoomba = game.createGameItem('enemy',25);
            var bossGoombaImage = draw.bitmap('img/Goomba.gif');
            bossGoombaImage.x = -25;
            bossGoombaImage.y = -25;
            bossGoomba.addChild(bossGoombaImage);
            bossGoomba.x = x;
            bossGoomba.y = y;
            bossGoomba.scaleX = 2;
            bossGoomba.scaleY = 2;
            game.addGameItem(bossGoomba);
            bossGoomba.velocityX = -1;
            bossGoomba.rotationalVelocity = 5;
            bossGoomba.onPlayerCollision = function() {
                console.log('The Boss Goomba has hit Halle!');
                game.changeIntegrity(-80);
            };
            bossGoomba.onProjectileCollision = function() {
                hits++;
                if (hits >= 5) {
                    console.log('Halle has defeated the Boss Goomba!');
                    game.increaseScore(1000);
                    bossGoomba.flyTo(1000, 0);
                }
                
            }
        }
        
        function createStar(x, y) {
            var star = game.createGameItem('enemy',25);
            var starImage = draw.bitmap('img/SuperStar.png');
            starImage.x = -25;
            starImage.y = -25;
            star.addChild(starImage);
            star.x = x;
            star.y = y;
            star.scaleX = 1.5;
            star.scaleY = 1.5;
            game.addGameItem(star);
            star.velocityX = -2;
            star.onPlayerCollision = function() {
                console.log('Halle has collected the Super Star!');
                console.log('You won!');
                game.increaseScore(game.health * 100);
                star.shrink();
            };
            star.onProjectileCollision = function() {}
        }
        
        function createError(x, y) {
            var error = game.createGameItem('enemy',25);
            var errorImage = draw.bitmap('img/Error.png');
            errorImage.x = -25;
            errorImage.y = -25;
            error.addChild(errorImage);
            error.x = x;
            error.y = y;
            game.addGameItem(error);
        }
        
        for (var i = 0; i < levelData.gameItems.length; i++) {
            var gameItem = levelData.gameItems[i];
            if (gameItem.type === "spikeBall") {
                createSpikeBall(gameItem.x, gameItem.y);
            } else if (gameItem.type === "mushroom") {
                createMushroom(gameItem.x, gameItem.y);
            } else if (gameItem.type === "goomba") {
                createGoomba(gameItem.x, gameItem.y);
            } else if (gameItem.type === "bossGoomba") {
                createBossGoomba(gameItem.x, gameItem.y);
            } else if (gameItem.type === "star") {
                createStar(gameItem.x, gameItem.y);
            } else {
                createError(gameItem.x, gameItem.y);
            }
        }
        
        
        // DO NOT EDIT CODE BELOW HERE
    };
};

// DON'T REMOVE THIS CODE //////////////////////////////////////////////////////
if((typeof process !== 'undefined') &&
    (typeof process.versions.node !== 'undefined')) {
    // here, export any references you need for tests //
    module.exports = level01;
}
